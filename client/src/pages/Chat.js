import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import { FiLogOut, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef();

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_API_URL, {
      auth: { token }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('private-message', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Show notification if not the current chat
      if (message.sender._id !== selectedUser?._id) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}`}
                    alt=""
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {message.sender.username}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 4000 });
      }
    });

    newSocket.on('group-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message-sent', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('typing', (data) => {
      if (data.userId !== user?._id) {
        setTypingUsers(prev => {
          if (data.isTyping && !prev.includes(data.username)) {
            return [...prev, data.username];
          } else if (!data.isTyping) {
            return prev.filter(name => name !== data.username);
          }
          return prev;
        });
      }
    });

    newSocket.on('user-online', (data) => {
      setUsers(prev => prev.map(u => 
        u._id === data.userId ? { ...u, isOnline: true } : u
      ));
    });

    newSocket.on('user-offline', (data) => {
      setUsers(prev => prev.map(u => 
        u._id === data.userId ? { ...u, isOnline: false, lastSeen: data.lastSeen } : u
      ));
    });

    newSocket.on('message-read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId ? { ...msg, status: 'read' } : msg
      ));
    });

    newSocket.on('error', (error) => {
      toast.error(error.message);
    });

    // Fetch users
    fetchUsers();

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chat/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chat/history/${userId}`
      );
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchChatHistory(user._id);
  };

  const handleSendMessage = (content) => {
    if (!selectedUser) return;

    socketRef.current.emit('private-message', {
      receiverId: selectedUser._id,
      content,
      contentType: 'text'
    });
  };

  const handleTyping = (isTyping) => {
    if (!selectedUser) return;

    socketRef.current.emit('typing', {
      receiverId: selectedUser._id,
      isTyping
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="chat-container">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <FiMenu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static z-40 w-80 h-full`}>
        <Sidebar
          users={users}
          currentUser={user}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          loading={loading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {selectedUser ? selectedUser.username : 'Welcome to Secure Chat'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Box */}
        {selectedUser ? (
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            typingUsers={typingUsers}
            selectedUser={selectedUser}
            currentUser={user}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Welcome to Secure Chat
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select a user from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;