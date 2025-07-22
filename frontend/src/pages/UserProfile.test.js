import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import UserProfile from './UserProfile';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useParams: () => ({ userId: '123' }),
  useNavigate: () => mockNavigate,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <UserProfile />
    </MemoryRouter>
  );
};

const mockUserData = {
  data: {
    success: true,
    data: {
      id: 123,
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'テストユーザーのプロフィールです',
      isFollowing: false,
      isFollowedBy: false,
      isMutualFollow: false,
      followerCount: 10,
      followingCount: 5,
      totalMovieCount: 25,
      averageRating: 4.2,
      createdAt: '2023-01-15T00:00:00Z'
    }
  }
};

const mockFollowersData = {
  data: {
    success: true,
    data: [
      {
        id: 1,
        username: 'follower1',
        displayName: 'Follower One',
        email: 'follower1@example.com',
        followerCount: 5,
        totalMovieCount: 12,
        isMutualFollow: true
      }
    ]
  }
};

const mockFollowingData = {
  data: {
    success: true,
    data: [
      {
        id: 3,
        username: 'following1',
        displayName: 'Following One',
        email: 'following1@example.com',
        followerCount: 15,
        totalMovieCount: 35,
        isMutualFollow: false
      }
    ]
  }
};

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
    
    // Setup default axios responses
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/api/social/users/123/followers')) {
        return Promise.resolve(mockFollowersData);
      }
      if (url.includes('/api/social/users/123/following')) {
        return Promise.resolve(mockFollowingData);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  test('renders user profile page', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  test('shows loading spinner initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('displays user statistics', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('視聴映画')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('平均評価')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('フォロワー')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('フォロー中')).toBeInTheDocument();
    });
  });

  test('displays join date', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/2023年1月15日に参加/)).toBeInTheDocument();
    });
  });

  test('shows follow button for unfollowed user', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('フォロー')).toBeInTheDocument();
    });
  });

  test('switches to followers tab', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロワー/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Follower One')).toBeInTheDocument();
    });
  });

  test('switches to following tab', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロー中/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Following One')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー情報の取得中にエラーが発生しました')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles 404 errors specifically', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue({ response: { status: 404 } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles unsuccessful API responses', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false, message: 'User not found' }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  test('displays empty states for followers and following', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/api/social/users/123/followers')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      if (url.includes('/api/social/users/123/following')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロワー/i }));
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーがいません')).toBeInTheDocument();
    });
  });

  test('displays user bio when available', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('テストユーザーのプロフィールです')).toBeInTheDocument();
    });
  });

  test('displays fallback message when bio is missing', async () => {
    const userWithoutBio = {
      data: {
        success: true,
        data: {
          ...mockUserData.data.data,
          bio: null
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(userWithoutBio);
      }
      return Promise.resolve(mockFollowersData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールが設定されていません。')).toBeInTheDocument();
    });
  });

  test('displays N/A for missing average rating', async () => {
    const userWithoutRating = {
      data: {
        success: true,
        data: {
          ...mockUserData.data.data,
          averageRating: null
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(userWithoutRating);
      }
      return Promise.resolve(mockFollowersData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  test('handles missing user stats gracefully', async () => {
    const userWithoutStats = {
      data: {
        success: true,
        data: {
          id: 123,
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          isFollowing: false,
          createdAt: '2023-01-15T00:00:00Z'
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(userWithoutStats);
      }
      return Promise.resolve(mockFollowersData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(4);
    });
  });

  test('handles missing join date', async () => {
    const userWithoutJoinDate = {
      data: {
        success: true,
        data: {
          ...mockUserData.data.data,
          createdAt: null
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(userWithoutJoinDate);
      }
      return Promise.resolve(mockFollowersData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  test('handles username when displayName is missing', async () => {
    const userWithoutDisplayName = {
      data: {
        success: true,
        data: {
          ...mockUserData.data.data,
          displayName: null
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(userWithoutDisplayName);
      }
      return Promise.resolve(mockFollowersData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('does not fetch followers/following data until tabs are clicked', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Should only have been called once for user profile
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/social/users/123',
      { headers: { Authorization: 'Bearer test-token' } }
    );
  });

  test('displays mutual follow indicators in user lists', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロワー/i }));
    
    await waitFor(() => {
      expect(screen.getByText('相互フォロー')).toBeInTheDocument();
    });
  });

  test('displays follower and movie counts in user lists', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロワー/i }));
    
    await waitFor(() => {
      expect(screen.getByText('5 フォロワー')).toBeInTheDocument();
      expect(screen.getByText('12 映画')).toBeInTheDocument();
    });
  });

  test('handles followers fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/api/social/users/123/followers')) {
        return Promise.reject(new Error('Followers fetch failed'));
      }
      return Promise.resolve(mockFollowingData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロワー/i }));
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーがいません')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles following fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/social/users/123') && !url.includes('/followers') && !url.includes('/following')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/api/social/users/123/following')) {
        return Promise.reject(new Error('Following fetch failed'));
      }
      return Promise.resolve(mockFollowersData);
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: /フォロー中/i }));
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーがいません')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });
});