
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

## How It Works

A new user signs up using username, email, and password.

The password is hashed using bcrypt before being stored in MongoDB.

On login, the backend verifies credentials and generates a JWT token.

The frontend stores the token and uses it for authenticated requests.

Socket.IO establishes a real-time connection between client and server.

Messages are sent instantly and stored in the database.

Users can chat in real time without refreshing the page.

## Installation and Setup
1. Clone the repository
git clone <your-repository-url>
cd secure-chat-app

3. Install dependencies

At the project root:

npm install

Install frontend dependencies:

cd client
npm install

Install backend dependencies:

cd ../server
npm install

3. Create .env file in the server folder
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
CLIENT_URL=http://localhost:3000

5. Start the application

From the root folder:

npm run dev

This will start:

Frontend on http://localhost:3000

Backend on http://localhost:5000

## MongoDB Atlas Setup

1.Create a MongoDB Atlas account.

2.Create a new project and deployment.

3.Create a database user.

4.Add your IP address in Network Access or use 0.0.0.0/0 for development.

5.Copy the connection string and paste it into MONGODB_URI in your .env file.

## Deployment

This project can be deployed using:

Render for backend and frontend

Vercel for frontend

MongoDB Atlas for database hosting

## Future Enhancements

Group chat

Typing indicator

Message seen/delivered status

File sharing

End-to-end encryption

Profile pictures

Search chat history

## Conclusion

This Secure Chat Application demonstrates full-stack web development with authentication, real-time communication, and cloud database integration. It is a practical project for learning how modern chat platforms work.

## Author

Sanjana Anil Naik

