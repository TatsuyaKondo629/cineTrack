import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './Navbar';

// Mock the context and router hooks
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/' };
const mockAuth = {
  isAuthenticated: false,
  user: null,
  logout: jest.fn()
};

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

// Mock MUI useMediaQuery since it's causing issues
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}));

const theme = createTheme();

const renderNavbar = () => {
  return render(
    <ThemeProvider theme={theme}>
      <Navbar />
    </ThemeProvider>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuth.logout.mockClear();
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
  });

  test('renders CineTrack logo', () => {
    renderNavbar();
    expect(screen.getByText('CineTrack')).toBeInTheDocument();
  });

  test('shows login and register buttons when not authenticated', () => {
    renderNavbar();
    // Use getAllByText since there might be multiple instances (mobile/desktop)
    const loginButtons = screen.getAllByText('ログイン');
    const registerButtons = screen.getAllByText('新規登録');
    expect(loginButtons.length).toBeGreaterThan(0);
    expect(registerButtons.length).toBeGreaterThan(0);
  });

  test('shows movie search link', () => {
    renderNavbar();
    // Use getAllByText since there might be multiple instances (mobile/desktop)
    const movieSearchLinks = screen.getAllByText('映画を探す');
    expect(movieSearchLinks.length).toBeGreaterThan(0);
  });

  test('clicking CineTrack logo navigates to home', () => {
    renderNavbar();
    
    fireEvent.click(screen.getByText('CineTrack'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});