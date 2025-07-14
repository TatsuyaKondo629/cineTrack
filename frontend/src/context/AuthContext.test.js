import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Test component to use AuthContext
const TestComponent = () => {
  const { user, token, login, register, logout, isAuthenticated, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="username">{user?.username || 'No User'}</div>
      <div data-testid="token">{token || 'No Token'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuthProvider = (children) => {
  return render(
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset axios mocks
    jest.clearAllMocks();
  });

  test('initializes with no user when no token in localStorage', () => {
    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('No User');
    expect(screen.getByTestId('token')).toHaveTextContent('No Token');
  });

  test('initializes with user when token exists in localStorage', () => {
    // Set up localStorage
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
    
    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
  });

  test('successful login updates context and localStorage', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'new-jwt-token',
          username: 'testuser',
          email: 'test@example.com'
        }
      }
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('testuser');
      expect(screen.getByTestId('token')).toHaveTextContent('new-jwt-token');
    });

    // Check localStorage
    expect(localStorage.getItem('token')).toBe('new-jwt-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({
      username: 'testuser',
      email: 'test@example.com'
    });
  });

  test('failed login does not update context', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Login failed'));

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('No User');
    });
  });

  test('successful registration returns success', async () => {
    const mockResponse = {
      data: {
        success: true
      }
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password'
        }
      );
    });
  });

  test('logout clears context and localStorage', () => {
    // Set up initial state
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
    
    renderWithAuthProvider(<TestComponent />);
    
    // Verify initial state
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    
    // Logout
    fireEvent.click(screen.getByText('Logout'));
    
    // Verify state after logout
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('No User');
    expect(screen.getByTestId('token')).toHaveTextContent('No Token');
    
    // Verify localStorage is cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});