<<<<<<< HEAD
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.group; // Required if not a group message
    }
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: function() {
      return !this.receiver; // Required if not a private message
    }
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true // Initialization vector for encryption
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileName: String,
  fileSize: Number,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
});

=======
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.group; // Required if not a group message
    }
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: function() {
      return !this.receiver; // Required if not a private message
    }
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true // Initialization vector for encryption
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileName: String,
  fileSize: Number,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
});

>>>>>>> de7565ca49d3668c0675e7bf4d5a8e6c7249fdb9
module.exports = mongoose.model('Message', messageSchema);