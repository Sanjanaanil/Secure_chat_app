<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiSend, FiPaperclip, FiSmile, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

const ChatBox = ({ 
  messages, 
  onSendMessage, 
  onTyping, 
  typingUsers,
  selectedUser,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Emit typing event
    onTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      onTyping(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const getMessageStatusIcon = (status) => {
    switch(status) {
      case 'sent':
        return <FiCheck className="text-gray-400" />;
      case 'delivered':
        return <BsCheck2All className="text-gray-400" />;
      case 'read':
        return <FiCheckCircle className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {selectedUser && (
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <div className="relative">
            <img
              src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=3b82f6&color=fff`}
              alt={selectedUser.username}
              className="w-10 h-10 rounded-full"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
              selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedUser.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => {
          const isOwn = msg.sender?._id === currentUser?._id;
          
          return (
            <div
              key={msg._id || index}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwn && (
                <img
                  src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username}&background=3b82f6&color=fff`}
                  alt={msg.sender?.username}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                />
              )}
              
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`message-bubble ${
                    isOwn ? 'message-sent' : 'message-received'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  
                  {/* Message Time and Status */}
                  <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                    {isOwn && getMessageStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="typing-indicator">
              <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <FiSmile className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

=======
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiSend, FiPaperclip, FiSmile, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

const ChatBox = ({ 
  messages, 
  onSendMessage, 
  onTyping, 
  typingUsers,
  selectedUser,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Emit typing event
    onTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      onTyping(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const getMessageStatusIcon = (status) => {
    switch(status) {
      case 'sent':
        return <FiCheck className="text-gray-400" />;
      case 'delivered':
        return <BsCheck2All className="text-gray-400" />;
      case 'read':
        return <FiCheckCircle className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {selectedUser && (
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <div className="relative">
            <img
              src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=3b82f6&color=fff`}
              alt={selectedUser.username}
              className="w-10 h-10 rounded-full"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
              selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedUser.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => {
          const isOwn = msg.sender?._id === currentUser?._id;
          
          return (
            <div
              key={msg._id || index}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwn && (
                <img
                  src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username}&background=3b82f6&color=fff`}
                  alt={msg.sender?.username}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                />
              )}
              
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`message-bubble ${
                    isOwn ? 'message-sent' : 'message-received'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  
                  {/* Message Time and Status */}
                  <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                    {isOwn && getMessageStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="typing-indicator">
              <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <FiSmile className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

>>>>>>> de7565ca49d3668c0675e7bf4d5a8e6c7249fdb9
export default ChatBox;