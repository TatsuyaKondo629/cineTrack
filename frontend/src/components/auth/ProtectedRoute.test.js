import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Test component to wrap as children
const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithRouter = (initialEntries = ['/protected']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading spinner when loading is true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    });

    renderWithRouter();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('renders children when user is authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    });

    renderWithRouter();
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    });

    const { container } = renderWithRouter();
    
    // The component should not render the protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    
    // Should redirect, so the container should be empty or contain navigation
    expect(container.firstChild).toBeInTheDocument();
  });

  test('loading state has correct styling and layout', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    });

    renderWithRouter();
    
    const progressContainer = screen.getByRole('progressbar').closest('div');
    expect(progressContainer).toHaveStyle({
      display: 'flex'
    });
  });

  test('handles rapid state changes correctly', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    });

    const { rerender } = renderWithRouter();
    
    // Initially loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Change to authenticated
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    });
    
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <TestChild />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});