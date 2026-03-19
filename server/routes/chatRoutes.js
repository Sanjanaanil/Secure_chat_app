const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendPrivateMessage,
  getChatHistory,
  markAsRead,
  getAllUsers,
  addFriend,
  createGroup,
  sendGroupMessage,
  getGroupMessages
} = require('../controllers/chatController');

// All routes are protected
router.use(protect);

// User routes
router.get('/users', getAllUsers);
router.post('/add-friend/:userId', addFriend);

// Private message routes
router.post('/send', sendPrivateMessage);
router.get('/history/:userId', getChatHistory);
router.put('/read/:messageId', markAsRead);

// Group routes
router.post('/group', createGroup);
router.post('/group/send', sendGroupMessage);
router.get('/group/:groupId/messages', getGroupMessages);

module.exports = router;