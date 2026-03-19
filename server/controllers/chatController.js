const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const encryption = require('../utils/encryption');

// @desc    Send a private message
// @route   POST /api/chat/send
// @access  Private
const sendPrivateMessage = async (req, res) => {
  try {
    const { receiverId, content, contentType = 'text' } = req.body;

    // Encrypt message
    const encrypted = encryption.encrypt(content);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      contentType,
      status: 'sent'
    });

    // Populate sender info
    await message.populate('sender', 'username email avatar');

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat history with a user
// @route   GET /api/chat/history/:userId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'username email avatar')
      .populate('receiver', 'username email avatar');

    // Decrypt messages for client
    const decryptedMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      try {
        msgObj.content = encryption.decrypt({
          encryptedContent: msg.encryptedContent,
          iv: msg.iv
        });
      } catch (error) {
        msgObj.content = '[Encrypted message]';
      }
      delete msgObj.encryptedContent;
      delete msgObj.iv;
      return msgObj;
    });

    res.json({
      messages: decryptedMessages.reverse(),
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as read
// @route   PUT /api/chat/read/:messageId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user hasn't already read this message
    if (!message.readBy.some(read => read.user.toString() === req.user._id.toString())) {
      message.readBy.push({
        user: req.user._id,
        readAt: Date.now()
      });
      message.status = 'read';
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (for adding friends)
// @route   GET /api/chat/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username email avatar isOnline lastSeen');
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add friend
// @route   POST /api/chat/add-friend/:userId
// @access  Private
const addFriend = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user._id);
    const friend = await User.findById(userId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(userId);
    await user.save();

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Group Chat Functions

// @desc    Create a group
// @route   POST /api/chat/group
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [
        { user: req.user._id, role: 'admin' },
        ...members.map(memberId => ({ user: memberId, role: 'member' }))
      ]
    });

    // Add group to all members
    await User.updateMany(
      { _id: { $in: [req.user._id, ...members] } },
      { $push: { groups: group._id } }
    );

    await group.populate('members.user', 'username email avatar');

    res.status(201).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send group message
// @route   POST /api/chat/group/send
// @access  Private
const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content, contentType = 'text' } = req.body;

    // Check if user is member of group
    const group = await Group.findById(groupId);
    if (!group.members.some(m => m.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a group member' });
    }

    // Encrypt message
    const encrypted = encryption.encrypt(content);

    const message = await Message.create({
      sender: req.user._id,
      group: groupId,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      contentType,
      status: 'sent'
    });

    // Update group's last message
    group.lastMessage = message._id;
    await group.save();

    await message.populate('sender', 'username email avatar');

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get group messages
// @route   GET /api/chat/group/:groupId/messages
// @access  Private
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is member
    const group = await Group.findById(groupId);
    if (!group.members.some(m => m.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a group member' });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'username email avatar');

    // Decrypt messages
    const decryptedMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      try {
        msgObj.content = encryption.decrypt({
          encryptedContent: msg.encryptedContent,
          iv: msg.iv
        });
      } catch (error) {
        msgObj.content = '[Encrypted message]';
      }
      delete msgObj.encryptedContent;
      delete msgObj.iv;
      return msgObj;
    });

    res.json({
      messages: decryptedMessages.reverse(),
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendPrivateMessage,
  getChatHistory,
  markAsRead,
  getAllUsers,
  addFriend,
  createGroup,
  sendGroupMessage,
  getGroupMessages
};