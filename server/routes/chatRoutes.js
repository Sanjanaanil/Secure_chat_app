<<<<<<< HEAD
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

=======
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

>>>>>>> de7565ca49d3668c0675e7bf4d5a8e6c7249fdb9
module.exports = router;