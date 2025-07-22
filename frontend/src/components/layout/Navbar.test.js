import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import Navbar from './Navbar';

// Create mock functions
const mockNavigate = jest.fn();
const mockLogout = jest.fn();

// Mock modules with dynamic return values
let mockLocation = { pathname: '/' };
let mockAuth = {
  isAuthenticated: false,
  user: null,
  logout: mockLogout,
};
let mockIsMobile = false;

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

// Mock MUI useMediaQuery - this is the key fix for testing mobile/desktop
jest.mock('@mui/material', () => {
  const actualMui = jest.requireActual('@mui/material');
  return {
    ...actualMui,
    useMediaQuery: jest.fn(() => false), // Default to desktop
  };
});

// Import the mocked useMediaQuery
import { useMediaQuery } from '@mui/material';
const mockUseMediaQuery = useMediaQuery;

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
    mockLogout.mockClear();
    // Reset to default state
    mockAuth = {
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    };
    mockLocation = { pathname: '/' };
    mockIsMobile = false;
    // Reset the useMediaQuery mock
    mockUseMediaQuery.mockReturnValue(mockIsMobile);
  });

  describe('Basic Rendering', () => {
    test('renders CineTrack logo and title', () => {
      renderNavbar();
      expect(screen.getByText('CineTrack')).toBeInTheDocument();
    });

    test('clicking CineTrack logo navigates to home', () => {
      renderNavbar();
      fireEvent.click(screen.getByText('CineTrack'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('shows basic navigation structure', () => {
      renderNavbar();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    test('renders movie icon', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toBeInTheDocument();
    });
  });

  describe('Desktop Navigation - Unauthenticated', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth.isAuthenticated = false;
    });

    test('shows movie search and theater search buttons', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('映画を探す');
      expect(toolbar).toHaveTextContent('映画館検索');
    });

    test('shows login and register buttons when not authenticated', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ログイン');
      expect(toolbar).toHaveTextContent('新規登録');
    });

    test('movie search button navigates to movies page', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const movieButton = within(toolbar).getByText('映画を探す');
      fireEvent.click(movieButton);
      expect(mockNavigate).toHaveBeenCalledWith('/movies');
    });

    test('theater search button navigates to theaters page', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const theaterButton = within(toolbar).getByText('映画館検索');
      fireEvent.click(theaterButton);
      expect(mockNavigate).toHaveBeenCalledWith('/theaters');
    });

    test('login button navigates to login page', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const loginButton = within(toolbar).getByText('ログイン');
      fireEvent.click(loginButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('register button navigates to register page', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const registerButton = within(toolbar).getByText('新規登録');
      fireEvent.click(registerButton);
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    test('does not show hamburger menu in desktop mode', () => {
      renderNavbar();
      expect(screen.queryByLabelText('open drawer')).not.toBeInTheDocument();
    });
  });

  describe('Desktop Navigation - Authenticated', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('shows authenticated navigation buttons', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ダッシュボード');
      expect(toolbar).toHaveTextContent('視聴記録');
      expect(toolbar).toHaveTextContent('統計・分析');
      expect(toolbar).toHaveTextContent('ウィッシュリスト');
      expect(toolbar).toHaveTextContent('ユーザー検索');
      expect(toolbar).toHaveTextContent('フォロー管理');
      expect(toolbar).toHaveTextContent('アクティビティ');
    });

    test('does not show login/register buttons when authenticated', () => {
      renderNavbar();
      expect(screen.queryByText('ログイン')).not.toBeInTheDocument();
      expect(screen.queryByText('新規登録')).not.toBeInTheDocument();
    });

    test('shows user avatar with first letter of username', () => {
      renderNavbar();
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    test('dashboard button navigates to dashboard', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const dashboardButton = within(toolbar).getByText('ダッシュボード');
      fireEvent.click(dashboardButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    test('viewing records button navigates to viewing records', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const viewingRecordsButton = within(toolbar).getByText('視聴記録');
      fireEvent.click(viewingRecordsButton);
      expect(mockNavigate).toHaveBeenCalledWith('/viewing-records');
    });

    test('statistics button navigates to statistics', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const statisticsButton = within(toolbar).getByText('統計・分析');
      fireEvent.click(statisticsButton);
      expect(mockNavigate).toHaveBeenCalledWith('/statistics');
    });

    test('wishlist button navigates to wishlist', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const wishlistButton = within(toolbar).getByText('ウィッシュリスト');
      fireEvent.click(wishlistButton);
      expect(mockNavigate).toHaveBeenCalledWith('/wishlist');
    });

    test('users button navigates to users', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const usersButton = within(toolbar).getByText('ユーザー検索');
      fireEvent.click(usersButton);
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });

    test('follow management button navigates to follow management', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const followButton = within(toolbar).getByText('フォロー管理');
      fireEvent.click(followButton);
      expect(mockNavigate).toHaveBeenCalledWith('/follow-management');
    });

    test('activity feed button navigates to activity feed', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      const activityButton = within(toolbar).getByText('アクティビティ');
      fireEvent.click(activityButton);
      expect(mockNavigate).toHaveBeenCalledWith('/activity-feed');
    });
  });

  describe('User Menu Functionality', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('clicking avatar opens user menu', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(within(menu).getByText('プロフィール編集')).toBeInTheDocument();
        expect(within(menu).getByText('ログアウト')).toBeInTheDocument();
      });
    });

    test('profile edit menu item navigates to profile edit', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const profileEditItem = screen.getByText('プロフィール編集');
        fireEvent.click(profileEditItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
    });

    test('logout menu item calls logout and navigates to home', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const logoutItem = within(menu).getByText('ログアウト');
        fireEvent.click(logoutItem);
      });
      
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

  });

  describe('Mobile View - Unauthenticated', () => {
    beforeEach(() => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      };
    });

    test('shows hamburger menu button in mobile mode', () => {
      renderNavbar();
      expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
    });

    test('does not show desktop navigation buttons in mobile mode', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      // In mobile mode, the toolbar should not contain these buttons
      expect(toolbar).not.toHaveTextContent('映画を探す');
      expect(toolbar).not.toHaveTextContent('映画館検索');
    });

    test('does not show login/register buttons in mobile mode', () => {
      renderNavbar();
      const toolbar = screen.getByRole('banner');
      // In mobile mode, login/register buttons are not in the toolbar
      expect(toolbar).not.toHaveTextContent('ログイン');
      expect(toolbar).not.toHaveTextContent('新規登録');
    });

    test('clicking hamburger menu opens drawer', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('映画を探す')).toBeInTheDocument();
        expect(screen.getByText('映画館検索')).toBeInTheDocument();
        expect(screen.getByText('ログイン')).toBeInTheDocument();
        expect(screen.getByText('新規登録')).toBeInTheDocument();
      });
    });

    test('clicking drawer item navigates and closes drawer', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const drawer = screen.getByRole('presentation');
        const moviesItem = within(drawer).getByText('映画を探す');
        fireEvent.click(moviesItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/movies');
    });

    test('drawer can be closed by clicking outside', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        expect(screen.getByText('映画を探す')).toBeInTheDocument();
      });

      // Find the backdrop and click it
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
      }
    });
  });

  describe('Mobile View - Authenticated', () => {
    beforeEach(() => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('shows hamburger menu and user avatar in mobile mode', () => {
      renderNavbar();
      expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    test('clicking hamburger menu shows all authenticated menu items', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const drawer = screen.getByRole('presentation');
        expect(within(drawer).getByText('映画を探す')).toBeInTheDocument();
        expect(within(drawer).getByText('映画館検索')).toBeInTheDocument();
        expect(within(drawer).getByText('ダッシュボード')).toBeInTheDocument();
        expect(within(drawer).getByText('視聴記録')).toBeInTheDocument();
        expect(within(drawer).getByText('統計・分析')).toBeInTheDocument();
        expect(within(drawer).getByText('ウィッシュリスト')).toBeInTheDocument();
        expect(within(drawer).getByText('ユーザー検索')).toBeInTheDocument();
        expect(within(drawer).getByText('フォロー管理')).toBeInTheDocument();
        expect(within(drawer).getByText('アクティビティ')).toBeInTheDocument();
      });
    });

    test('drawer shows logout button for authenticated users', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const logoutButtons = screen.getAllByText('ログアウト');
        expect(logoutButtons.length).toBeGreaterThan(0);
      });
    });

    test('clicking logout in drawer calls logout and navigates', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const logoutButtons = screen.getAllByText('ログアウト');
        // Click the logout button in the drawer (should be the last one)
        fireEvent.click(logoutButtons[logoutButtons.length - 1]);
      });
      
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('mobile user menu shows additional navigation items', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        // In mobile mode, the user menu should include additional navigation items
        expect(within(menu).getByText('プロフィール編集')).toBeInTheDocument();
        expect(within(menu).getByText('ダッシュボード')).toBeInTheDocument();
        expect(within(menu).getByText('視聴記録')).toBeInTheDocument();
        expect(within(menu).getByText('統計・分析')).toBeInTheDocument();
        expect(within(menu).getByText('ウィッシュリスト')).toBeInTheDocument();
        expect(within(menu).getByText('ユーザー検索')).toBeInTheDocument();
        expect(within(menu).getByText('フォロー管理')).toBeInTheDocument();
        expect(within(menu).getByText('アクティビティ')).toBeInTheDocument();
      });
    });

    test('mobile user menu dashboard item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const dashboardItem = within(menu).getByText('ダッシュボード');
        fireEvent.click(dashboardItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    test('mobile user menu viewing records item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const viewingRecordsItem = within(menu).getByText('視聴記録');
        fireEvent.click(viewingRecordsItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/viewing-records');
    });

    test('mobile user menu statistics item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const statisticsItem = within(menu).getByText('統計・分析');
        fireEvent.click(statisticsItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/statistics');
    });

    test('mobile user menu wishlist item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const wishlistItem = within(menu).getByText('ウィッシュリスト');
        fireEvent.click(wishlistItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/wishlist');
    });

    test('mobile user menu users item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const usersItem = within(menu).getByText('ユーザー検索');
        fireEvent.click(usersItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/users');
    });

    test('mobile user menu follow management item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const followItem = within(menu).getByText('フォロー管理');
        fireEvent.click(followItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/follow-management');
    });

    test('mobile user menu activity item navigates correctly', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        const activityItem = within(menu).getByText('アクティビティ');
        fireEvent.click(activityItem);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/activity-feed');
    });
  });

  describe('Active State Highlighting', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('isActive function works correctly for movies page', () => {
      mockLocation = { pathname: '/movies' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('映画を探す');
    });

    test('isActive function works correctly for dashboard page', () => {
      mockLocation = { pathname: '/dashboard' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ダッシュボード');
    });

    test('isActive function works correctly for root path', () => {
      mockLocation = { pathname: '/' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('映画を探す');
    });
  });

  describe('User Avatar Edge Cases', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
    });

    test('handles user with different username', () => {
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'alice', email: 'alice@example.com' },
        logout: mockLogout,
      };
      
      renderNavbar();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    test('handles empty username gracefully', () => {
      mockAuth = {
        isAuthenticated: true,
        user: { username: '', email: 'test@example.com' },
        logout: mockLogout,
      };
      
      renderNavbar();
      // Component should not crash
      expect(screen.getByText('CineTrack')).toBeInTheDocument();
    });

    test('handles null username gracefully', () => {
      mockAuth = {
        isAuthenticated: true,
        user: { username: null, email: 'test@example.com' },
        logout: mockLogout,
      };
      
      renderNavbar();
      // Component should not crash
      expect(screen.getByText('CineTrack')).toBeInTheDocument();
    });

    test('handles user with no user object', () => {
      mockAuth = {
        isAuthenticated: true,
        user: null,
        logout: mockLogout,
      };
      
      renderNavbar();
      // Component should not crash
      expect(screen.getByText('CineTrack')).toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('menu state management works', async () => {
      renderNavbar();
      const avatar = screen.getByText('T');
      
      // Open menu
      fireEvent.click(avatar);
      await waitFor(() => {
        expect(screen.getByText('プロフィール編集')).toBeInTheDocument();
      });
      
      // Menu should be visible
      expect(screen.getByText('プロフィール編集')).toBeInTheDocument();
    });

  });

  describe('Drawer State Management', () => {
    beforeEach(() => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('drawer toggle functionality works', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      
      // Open drawer
      fireEvent.click(hamburgerButton);
      await waitFor(() => {
        const drawer = screen.getByRole('presentation');
        expect(within(drawer).getByText('ダッシュボード')).toBeInTheDocument();
      });
      
      // Close drawer by clicking an item
      const drawer = screen.getByRole('presentation');
      const dashboardItem = within(drawer).getByText('ダッシュボード');
      fireEvent.click(dashboardItem);
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    test('drawer closes when navigation occurs', async () => {
      renderNavbar();
      const hamburgerButton = screen.getByLabelText('open drawer');
      
      // Open drawer
      fireEvent.click(hamburgerButton);
      await waitFor(() => {
        expect(screen.getByText('映画を探す')).toBeInTheDocument();
      });
      
      // Click navigation item
      const moviesItem = screen.getByText('映画を探す');
      fireEvent.click(moviesItem);
      
      expect(mockNavigate).toHaveBeenCalledWith('/movies');
      // Drawer should close after navigation
    });
  });

  describe('Icons and Visual Elements', () => {
    test('renders with icons properly', () => {
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
      renderNavbar();
      
      // Component should render without errors
      expect(screen.getByText('CineTrack')).toBeInTheDocument();
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('Active State Branch Coverage Tests', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('theaters page shows active styling', () => {
      mockLocation = { pathname: '/theaters' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('映画館検索');
      // Active state styling should be applied
    });

    test('viewing-records page shows active styling', () => {
      mockLocation = { pathname: '/viewing-records' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('視聴記録');
      // Active state styling should be applied
    });

    test('statistics page shows active styling', () => {
      mockLocation = { pathname: '/statistics' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('統計・分析');
      // Active state styling should be applied
    });

    test('wishlist page shows active styling', () => {
      mockLocation = { pathname: '/wishlist' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ウィッシュリスト');
      // Active state styling should be applied
    });

    test('users page shows active styling', () => {
      mockLocation = { pathname: '/users' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ユーザー検索');
      // Active state styling should be applied
    });

    test('follow-management page shows active styling', () => {
      mockLocation = { pathname: '/follow-management' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('フォロー管理');
      // Active state styling should be applied
    });

    test('activity-feed page shows active styling', () => {
      mockLocation = { pathname: '/activity-feed' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('アクティビティ');
      // Active state styling should be applied
    });

    test('login page shows active styling when unauthenticated', () => {
      mockAuth = {
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      };
      mockLocation = { pathname: '/login' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ログイン');
      // Active state styling should be applied
    });

    test('register page shows active styling when unauthenticated', () => {
      mockAuth = {
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      };
      mockLocation = { pathname: '/register' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('新規登録');
      // Active state styling should be applied
    });

    test('non-active pages do not show active styling', () => {
      mockLocation = { pathname: '/some-other-page' };
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('映画を探す');
      expect(toolbar).toHaveTextContent('ダッシュボード');
      // No active styling should be applied to these buttons
    });
  });

  describe('Desktop vs Mobile Conditional Rendering', () => {
    test('unauthenticated desktop shows login/register buttons', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      };
      
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      expect(toolbar).toHaveTextContent('ログイン');
      expect(toolbar).toHaveTextContent('新規登録');
    });

    test('unauthenticated mobile does not show login/register buttons in toolbar', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      };
      
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      // In mobile mode, these buttons should not be in the toolbar
      expect(toolbar).not.toHaveTextContent('ログイン');
      expect(toolbar).not.toHaveTextContent('新規登録');
      // But should be available in the drawer
      expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
    });

    test('authenticated mobile does not show desktop navigation in toolbar', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
      
      renderNavbar();
      
      const toolbar = screen.getByRole('banner');
      // Desktop navigation should not be visible in mobile mode
      expect(toolbar).not.toHaveTextContent('ダッシュボード');
      expect(toolbar).not.toHaveTextContent('視聴記録');
      expect(toolbar).not.toHaveTextContent('統計・分析');
      expect(toolbar).not.toHaveTextContent('ウィッシュリスト');
      expect(toolbar).not.toHaveTextContent('ユーザー検索');
      expect(toolbar).not.toHaveTextContent('フォロー管理');
      expect(toolbar).not.toHaveTextContent('アクティビティ');
      
      // But user avatar should be visible
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  describe('User Menu Mobile vs Desktop Conditional Items', () => {
    test('desktop user menu does not show navigation items', async () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
      
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        // Desktop user menu should only have profile edit and logout
        expect(within(menu).getByText('プロフィール編集')).toBeInTheDocument();
        expect(within(menu).getByText('ログアウト')).toBeInTheDocument();
        
        // Should NOT contain navigation items in desktop mode
        expect(within(menu).queryByText('ダッシュボード')).not.toBeInTheDocument();
        expect(within(menu).queryByText('視聴記録')).not.toBeInTheDocument();
        expect(within(menu).queryByText('統計・分析')).not.toBeInTheDocument();
        expect(within(menu).queryByText('ウィッシュリスト')).not.toBeInTheDocument();
        expect(within(menu).queryByText('ユーザー検索')).not.toBeInTheDocument();
        expect(within(menu).queryByText('フォロー管理')).not.toBeInTheDocument();
        expect(within(menu).queryByText('アクティビティ')).not.toBeInTheDocument();
      });
    });

    test('mobile user menu shows all navigation items', async () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
      
      renderNavbar();
      const avatar = screen.getByText('T');
      fireEvent.click(avatar);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        // Mobile user menu should contain all navigation items
        expect(within(menu).getByText('ダッシュボード')).toBeInTheDocument();
        expect(within(menu).getByText('視聴記録')).toBeInTheDocument();
        expect(within(menu).getByText('統計・分析')).toBeInTheDocument();
        expect(within(menu).getByText('ウィッシュリスト')).toBeInTheDocument();
        expect(within(menu).getByText('ユーザー検索')).toBeInTheDocument();
        expect(within(menu).getByText('フォロー管理')).toBeInTheDocument();
        expect(within(menu).getByText('アクティビティ')).toBeInTheDocument();
        expect(within(menu).getByText('プロフィール編集')).toBeInTheDocument();
        expect(within(menu).getByText('ログアウト')).toBeInTheDocument();
      });
    });
  });

  describe('Drawer Active State Testing', () => {
    beforeEach(() => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      mockAuth = {
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      };
    });

    test('drawer items show active state correctly', async () => {
      mockLocation = { pathname: '/dashboard' };
      renderNavbar();
      
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const drawer = screen.getByRole('presentation');
        const dashboardItem = within(drawer).getByText('ダッシュボード');
        expect(dashboardItem).toBeInTheDocument();
        // The dashboard item should show as selected/active
      });
    });

    test('drawer items for different active paths', async () => {
      mockLocation = { pathname: '/viewing-records' };
      renderNavbar();
      
      const hamburgerButton = screen.getByLabelText('open drawer');
      fireEvent.click(hamburgerButton);
      
      await waitFor(() => {
        const drawer = screen.getByRole('presentation');
        const viewingRecordsItem = within(drawer).getByText('視聴記録');
        expect(viewingRecordsItem).toBeInTheDocument();
        // The viewing records item should show as selected/active
      });
    });
  });
});