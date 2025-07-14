import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to prevent API calls during tests
jest.mock('axios');

// Mock react-router-dom completely to avoid navigation issues
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => element,
  Navigate: () => <div data-testid="navigate" />,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' }),
}));

// Mock AuthContext to provide basic auth functionality
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

// Mock ProtectedRoute component
jest.mock('./components/auth/ProtectedRoute', () => {
  return function ProtectedRoute({ children }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

// Mock all pages to avoid component loading issues
jest.mock('./pages/Home', () => () => <div data-testid="home-page">Home</div>);
jest.mock('./pages/Login', () => () => <div data-testid="login-page">Login</div>);
jest.mock('./pages/Register', () => () => <div data-testid="register-page">Register</div>);
jest.mock('./pages/Movies', () => () => <div data-testid="movies-page">Movies</div>);
jest.mock('./pages/Dashboard', () => () => <div data-testid="dashboard-page">Dashboard</div>);
jest.mock('./pages/ViewingRecords', () => () => <div data-testid="viewing-records-page">ViewingRecords</div>);
jest.mock('./components/layout/Navbar', () => () => <div data-testid="navbar">Navbar</div>);

test('renders CineTrack application', () => {
  render(<App />);
  
  // Check if the router wrapper is rendered
  expect(screen.getByTestId('router')).toBeInTheDocument();
  expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
});