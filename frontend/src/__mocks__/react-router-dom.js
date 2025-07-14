import React from 'react';

export default {
  BrowserRouter: ({ children }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  }),
  useParams: () => ({}),
  Link: ({ children, to, ...props }) => {
    return React.createElement('a', { href: to, ...props }, children);
  },
  NavLink: ({ children, to, ...props }) => {
    return React.createElement('a', { href: to, ...props }, children);
  }
};

export const BrowserRouter = ({ children }) => children;
export const useNavigate = () => jest.fn();
export const useLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
});
export const useParams = () => ({});
export const Link = ({ children, to, ...props }) => {
  return React.createElement('a', { href: to, ...props }, children);
};
export const NavLink = ({ children, to, ...props }) => {
  return React.createElement('a', { href: to, ...props }, children);
};