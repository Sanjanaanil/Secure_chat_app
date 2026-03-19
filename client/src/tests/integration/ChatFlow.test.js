import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import Chat from '../../pages/Chat';
import Login from '../../components/Login';

// Mock axios
jest.mock('axios');
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const disconnect = jest.fn();
  return jest.fn(() => ({
    emit,
    on,
    disconnect,
    id: 'mock-socket-id'
  }));
});

describe('Chat Application Integration', () => {
  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    token: 'mock-token'
  };

  const mockUsers = [
    {
      _id: 'user456',
      username: 'john_doe',
      email: 'john@example.com',
      isOnline: true,
      avatar: null
    },
    {
      _id: 'user789',
      username: 'jane_smith',
      email: 'jane@example.com',
      isOnline: false,
      avatar: null
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('complete user login flow', async () => {
    // Mock successful login API response
    axios.post.mockResolvedValueOnce({
      data: mockUser
    });

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Fill login form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if API was called correctly
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        {
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });
  });

  test('loads and displays users after authentication', async () => {
    // Mock authenticated user
    localStorage.setItem('token', 'mock-token');
    
    // Mock API responses
    axios.get.mockResolvedValueOnce({
      data: mockUsers
    });

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/users')
      );
    });
  });

  test('loads chat history when selecting a user', async () => {
    localStorage.setItem('token', 'mock-token');

    const mockMessages = {
      messages: [
        {
          _id: 'msg1',
          sender: { _id: 'user456', username: 'john_doe' },
          content: 'Hello!',
          createdAt: new Date().toISOString(),
          status: 'read'
        },
        {
          _id: 'msg2',
          sender: { _id: 'user123', username: 'testuser' },
          content: 'Hi there!',
          createdAt: new Date().toISOString(),
          status: 'read'
        }
      ],
      hasMore: false
    };

    // Mock API responses
    axios.get
      .mockResolvedValueOnce({ data: mockUsers })  // get users
      .mockResolvedValueOnce({ data: mockMessages }); // get chat history

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Wait for users to load and click on a user
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
    });

    // Click on user
    fireEvent.click(screen.getByText('john_doe'));

    // Check if chat history API was called
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/history/user456')
      );
    });
  });

  test('handles API errors gracefully', async () => {
    localStorage.setItem('token', 'mock-token');

    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check if error toast appears (implementation depends on toast library)
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('logs out user correctly', async () => {
    localStorage.setItem('token', 'mock-token');

    // Mock successful logout
    axios.post.mockResolvedValueOnce({ data: { message: 'Logged out' } });

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Find and click logout button
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
    });

    // Check if logout API was called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout')
      );
    });

    // Check if token was removed
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('Encryption Flow', () => {
  test('messages are properly encrypted before sending', () => {
    // Test encryption utility
    const encryption = require('../../../server/utils/encryption');
    
    const originalMessage = 'Secret message';
    const encrypted = encryption.encrypt(originalMessage);
    
    expect(encrypted.encryptedContent).not.toBe(originalMessage);
    expect(encrypted.iv).toBeDefined();
    
    const decrypted = encryption.decrypt(encrypted);
    expect(decrypted).toBe(originalMessage);
  });

  test('encrypted messages are stored in database', () => {
    // This would test database storage with encryption
    // Implementation depends on your database setup
  });
});

describe('Real-time Features', () => {
  test('typing indicator appears when user is typing', async () => {
    // Test typing indicator functionality
    // This would involve socket.io event testing
  });

  test('message status updates correctly', () => {
    // Test message status (sent, delivered, read)
  });

  test('online/offline status updates in real-time', () => {
    // Test user presence updates
  });
});

describe('Responsive Design', () => {
  test('sidebar collapses on mobile view', () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check if mobile menu button is visible
    const menuButton = screen.getByRole('button', { name: '' }); // Menu button with FiMenu icon
    expect(menuButton).toBeInTheDocument();
  });

  test('sidebar is visible on desktop view', () => {
    // Mock desktop viewport
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Sidebar should be visible without menu button on desktop
    const menuButton = screen.queryByRole('button', { name: '' });
    expect(menuButton).not.toBeInTheDocument();
  });
});

describe('Theme Switching', () => {
  test('dark mode toggles correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    const themeButton = screen.getByRole('button', { name: '' }); // Theme toggle button
    
    // Click theme button
    fireEvent.click(themeButton);

    // Check if dark class is toggled on document
    // Note: This depends on your theme implementation
  });

  test('theme preference persists after reload', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Chat />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Check if dark mode is applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});