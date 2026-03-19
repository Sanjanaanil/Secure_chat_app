const User = require('../models/User');
const Message = require('../models/Message');
const encryption = require('../utils/encryption');

const connectedUsers = new Map();

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify JWT token (you'll need to implement this)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Store user connection
    connectedUsers.set(socket.user._id.toString(), socket.id);
    
    // Update user online status
    User.findByIdAndUpdate(socket.user._id, { 
      isOnline: true,
      lastSeen: Date.now()
    }).then(() => {
      // Broadcast online status to all connected users
      socket.broadcast.emit('user-online', {
        userId: socket.user._id,
        isOnline: true
      });
    });

    // Join user's private room
    socket.join(socket.user._id.toString());

    // Handle private messages
    socket.on('private-message', async (data) => {
      try {
        const { receiverId, content, contentType = 'text' } = data;

        // Encrypt message
        const encrypted = encryption.encrypt(content);

        // Save to database
        const message = await Message.create({
          sender: socket.user._id,
          receiver: receiverId,
          encryptedContent: encrypted.encryptedContent,
          iv: encrypted.iv,
          contentType,
          status: 'sent'
        });

        await message.populate('sender', 'username email avatar');

        // Prepare message for sending (decrypt for display)
        const messageToSend = {
          _id: message._id,
          sender: message.sender,
          content: content, // Send original content for display
          contentType,
          createdAt: message.createdAt,
          status: 'sent'
        };

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('private-message', messageToSend);
          
          // Update message status to delivered
          message.deliveredTo.push(receiverId);
          message.status = 'delivered';
          await message.save();
          
          messageToSend.status = 'delivered';
        }

        // Send confirmation to sender
        socket.emit('message-sent', messageToSend);
      } catch (error) {
        console.error('Error sending private message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle group messages
    socket.on('group-message', async (data) => {
      try {
        const { groupId, content, contentType = 'text' } = data;

        // Encrypt message
        const encrypted = encryption.encrypt(content);

        // Save to database
        const message = await Message.create({
          sender: socket.user._id,
          group: groupId,
          encryptedContent: encrypted.encryptedContent,
          iv: encrypted.iv,
          contentType,
          status: 'sent'
        });

        await message.populate('sender', 'username email avatar');

        // Prepare message for sending
        const messageToSend = {
          _id: message._id,
          sender: message.sender,
          groupId,
          content,
          contentType,
          createdAt: message.createdAt
        };

        // Emit to all users in the group (except sender)
        socket.to(groupId).emit('group-message', messageToSend);
        
        // Send confirmation to sender
        socket.emit('message-sent', messageToSend);
      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('error', { message: 'Failed to send group message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', {
          userId: socket.user._id,
          username: socket.user.username,
          isTyping
        });
      }
    });

    // Handle read receipts
    socket.on('mark-read', async (data) => {
      try {
        const { messageId, senderId } = data;

        const message = await Message.findById(messageId);
        if (message && !message.readBy.some(r => r.user.toString() === socket.user._id.toString())) {
          message.readBy.push({ user: socket.user._id });
          message.status = 'read';
          await message.save();

          // Notify sender that message was read
          const senderSocketId = connectedUsers.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-read', {
              messageId,
              readerId: socket.user._id,
              readAt: Date.now()
            });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      connectedUsers.delete(socket.user._id.toString());
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: Date.now()
      });

      // Broadcast offline status
      socket.broadcast.emit('user-offline', {
        userId: socket.user._id,
        lastSeen: Date.now()
      });
    });
  });

  return io;
};

module.exports = setupSocket;