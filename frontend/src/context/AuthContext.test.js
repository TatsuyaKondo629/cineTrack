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

  test('throws error when useAuth is used outside AuthProvider', () => {
    const TestComponentOutsideProvider = () => {
      const { user } = useAuth();
      return <div>{user?.username}</div>;
    };

    // This should throw an error
    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  test('failed login with response data message', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      {
        email: 'test@example.com',
        password: 'password'
      }
    );
  });

  test('failed login with unsuccessful response', async () => {
    const mockResponse = {
      data: {
        success: false,
        message: 'Login failed'
      }
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    renderWithAuthProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });

  test('failed registration with response data message', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Username already exists'
        }
      }
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);

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

  test('failed registration with unsuccessful response', async () => {
    const mockResponse = {
      data: {
        success: false,
        message: 'Registration failed'
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

  test('initializes with loading true and sets to false after effect', async () => {
    renderWithAuthProvider(<TestComponent />);
    
    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // After useEffect, should not be loading
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  test('sets axios authorization header when token exists', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
    
    renderWithAuthProvider(<TestComponent />);
    
    // Should set axios default header
    expect(axios.defaults.headers.common['Authorization']).toBe('Bearer test-token');
  });

  test('removes axios authorization header when no token', () => {
    // Clear any existing headers
    delete axios.defaults.headers.common['Authorization'];
    
    renderWithAuthProvider(<TestComponent />);
    
    // Should not have authorization header
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });
});