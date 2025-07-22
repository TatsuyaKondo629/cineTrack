import React from 'react';

// Create persistent mock functions
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
};

// Mock components
export const BrowserRouter = ({ children }) => <div data-testid="browser-router">{children}</div>;
export const MemoryRouter = ({ children }) => <div data-testid="memory-router">{children}</div>;
export const Navigate = ({ to }) => <div data-testid="navigate-to">{to}</div>;
export const Link = ({ children, to, ...props }) => {
  return React.createElement('a', { href: to, ...props, 'data-testid': 'router-link' }, children);
};
export const NavLink = ({ children, to, ...props }) => {
  return React.createElement('a', { href: to, ...props, 'data-testid': 'nav-link' }, children);
};

// Mock hooks
export const useNavigate = () => mockNavigate;
export const useLocation = () => mockLocation;
export const useParams = () => ({});
export const useSearchParams = () => [new URLSearchParams(), jest.fn()];

// Default export for compatibility
export default {
  BrowserRouter,
  MemoryRouter,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Link,
  NavLink
};