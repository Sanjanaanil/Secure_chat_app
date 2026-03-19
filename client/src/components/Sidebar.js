import React, { useState } from 'react';
import { formatDistance } from 'date-fns';
import { FiSearch, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Sidebar = ({ users, currentUser, selectedUser, onSelectUser, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'online', 'offline'

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'online' && user.isOnline) ||
      (filter === 'offline' && !user.isOnline);
    return matchesSearch && matchesFilter;
  });

  const onlineCount = users.filter(u => u.isOnline).length;

  return (
    <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <FaWhatsapp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Secure Chat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {onlineCount} online • {users.length - onlineCount} offline
            </p>
          </div>
        </div>

        {/* Current User */}
        {currentUser && (
          <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=3b82f6&color=fff`}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {currentUser.username}
              </p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${
              filter === 'online'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Online
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${
              filter === 'offline'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Offline
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No users found
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedUser?._id === user._id
                  ? 'bg-primary-50 dark:bg-gray-600'
                  : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.username}
                  </h3>
                  {!user.isOnline && user.lastSeen && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistance(new Date(user.lastSeen), new Date(), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 mt-1">
                  {user.isOnline ? (
                    <span className="text-xs text-green-500">Online</span>
                  ) : (
                    <span className="text-xs text-gray-500">Offline</span>
                  )}
                </div>
              </div>
              
              {/* Unread count indicator (you can implement this) */}
              <FiMessageSquare className="w-4 h-4 text-gray-400" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;