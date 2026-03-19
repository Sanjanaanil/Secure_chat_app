# 🔐 Secure Chat Application

A full-stack real-time chat application with end-to-end encryption, built with React, Node.js, Socket.IO, and MongoDB.

## ✨ Features

- 🔒 **End-to-End Encryption**: All messages are encrypted before sending and decrypted on the receiving end
- 👥 **One-to-One Chat**: Private conversations with real-time messaging
- 👪 **Group Chat**: Create and manage group conversations
- 🟢 **Online/Offline Status**: Real-time user presence indicators
- ✏️ **Typing Indicators**: See when someone is typing
- ✓ **Read Receipts**: Know when your messages are delivered and read
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔐 **Secure Authentication**: JWT-based authentication with password hashing
- 💾 **Persistent Storage**: Chat history stored in MongoDB

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Socket.IO Client
- React Router DOM
- Axios
- React Hot Toast
- Date-fns
- Emoji Picker React

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens (JWT)
- Bcrypt.js
- Crypto (for encryption)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/secure-chat-app.git
cd secure-chat-app