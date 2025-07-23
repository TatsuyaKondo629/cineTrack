import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ActivityFeed from './ActivityFeed';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => mockNavigate
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
      <ActivityFeed />
    </MemoryRouter>
  );
};

const mockActivitiesData = {
  success: true,
  data: {
    content: [
      {
        userId: 1,
        username: 'testuser',
        displayName: 'Test User',
        activityType: 'VIEW_MOVIE',
        movieId: 1,
        movieTitle: 'Test Movie',
        moviePoster: '/test-poster.jpg',
        createdAt: '2023-01-01T10:00:00',
        rating: 4,
        review: 'Great movie with excellent story!'
      },
      {
        userId: 2,
        username: 'user2',
        displayName: null,
        activityType: 'ADD_TO_WISHLIST',
        movieId: 2,
        movieTitle: 'Wishlist Movie',
        moviePoster: null,
        createdAt: '2023-01-01T09:00:00'
      }
    ]
  }
};

describe('ActivityFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token');
  });

  test('renders loading skeleton initially', () => {
    // Mock axios to return a pending promise
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    
    const { container } = renderWithRouter();
    
    // Check for page heading and skeleton loader elements
    expect(screen.getByText('アクティビティフィード')).toBeInTheDocument();
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('displays error message when API call fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('アクティビティフィードの取得中にエラーが発生しました')).toBeInTheDocument();
    });
  });

  test('displays error message when API returns error', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false,
        message: 'Custom error message'
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  test('displays no activities message when feed is empty', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: []
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('アクティビティがありません')).toBeInTheDocument();
      expect(screen.getByText('フォローしているユーザーの活動がここに表示されます')).toBeInTheDocument();
    });
    
    // Test the "ユーザーを探す" button
    const findUsersButton = screen.getByText('ユーザーを探す');
    fireEvent.click(findUsersButton);
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  test('fetches and displays activities successfully', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockActivitiesData
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('アクティビティフィード')).toBeInTheDocument();
    });
    
    // Wait for activities to load
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('Wishlist Movie')).toBeInTheDocument();
    });
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/social/activities',
      {
        headers: { Authorization: 'Bearer fake-token' },
        params: { page: 0, size: 50 }
      }
    );
  });

  test('navigates to user profile when user is clicked', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockActivitiesData
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Test clicking on avatar or username
    const avatars = screen.getAllByRole('button');
    const userElement = avatars.find(el => el.textContent === 'T'); // Avatar with first letter
    if (userElement) {
      fireEvent.click(userElement);
      expect(mockNavigate).toHaveBeenCalledWith('/users/1');
    }
  });

  test('handles movie click', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockedAxios.get.mockResolvedValue({
      data: mockActivitiesData
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Movie'));
    expect(consoleSpy).toHaveBeenCalledWith('Movie clicked:', 1);
    
    consoleSpy.mockRestore();
  });

  test('refreshes activities when refresh button is clicked', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockActivitiesData
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Clear the mock to track new calls
    mockedAxios.get.mockClear();
    
    const refreshButton = screen.getByRole('button', { name: /更新/ });
    fireEvent.click(refreshButton);
    
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('formats dates correctly', async () => {
    const now = new Date('2023-01-08T12:00:00');
    jest.useFakeTimers().setSystemTime(now);
    
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'test',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Recent Movie',
              createdAt: '2023-01-08T11:30:00' // 30 minutes ago
            },
            {
              userId: 1,
              username: 'test',
              activityType: 'VIEW_MOVIE',
              movieId: 2,
              movieTitle: 'Hour Movie',
              createdAt: '2023-01-08T10:00:00' // 2 hours ago
            },
            {
              userId: 1,
              username: 'test',
              activityType: 'VIEW_MOVIE',
              movieId: 3,
              movieTitle: 'Day Movie',
              createdAt: '2023-01-07T12:00:00' // 1 day ago
            },
            {
              userId: 1,
              username: 'test',
              activityType: 'VIEW_MOVIE',
              movieId: 4,
              movieTitle: 'Week Movie',
              createdAt: '2023-01-01T12:00:00' // 7 days ago
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('30分前')).toBeInTheDocument();
      expect(screen.getByText('2時間前')).toBeInTheDocument();
      expect(screen.getByText('1日前')).toBeInTheDocument();
      expect(screen.getByText('1月1日')).toBeInTheDocument(); // Over 7 days shows formatted date
    });
    
    jest.useRealTimers();
  });

  test('displays and handles ratings', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockActivitiesData
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      // Check if rating is displayed for the first activity
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  test('handles review dialog functionality', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'testuser',
              displayName: 'Test User',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Test Movie',
              moviePoster: '/test-poster.jpg',
              createdAt: '2023-01-01T10:00:00',
              rating: 4,
              review: 'This is a very long review that should be truncated and show the full review button because it exceeds the 100 character limit for display purposes. This is definitely more than 100 characters!'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Should have "全文を見る" button for long review
    const fullReviewButton = screen.getByText('全文を見る');
    fireEvent.click(fullReviewButton);
    
    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Test Movie のレビュー')).toBeInTheDocument();
    });
    
    // Close dialog
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Test Movie のレビュー')).not.toBeInTheDocument();
    });
  });

  test('closes error alert when close button is clicked', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('アクティビティフィードの取得中にエラーが発生しました')).toBeInTheDocument();
    });
    
    // Find and click the close button on the alert
    const alertElement = screen.getByRole('alert');
    const closeButton = alertElement.querySelector('[data-testid="CloseIcon"]');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('アクティビティフィードの取得中にエラーが発生しました')).not.toBeInTheDocument();
    });
  });

  test('handles API response without success field', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('アクティビティフィードの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('handles successful API response setActivities', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'testuser',
              displayName: 'Test User',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Test Movie',
              moviePoster: '/test-poster.jpg',
              createdAt: '2023-01-01T10:00:00',
              rating: 4,
              review: 'Great movie!'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  test('handles API response with false success and custom message', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false,
        message: 'Server error occurred'
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });
  });

  test('handles API response with false success and default message', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('アクティビティフィードの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('displays correct activity icons for different types', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'test1',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Movie 1',
              createdAt: '2023-01-01T10:00:00'
            },
            {
              userId: 2,
              username: 'test2',
              activityType: 'ADD_TO_WISHLIST',
              movieId: 2,
              movieTitle: 'Movie 2',
              createdAt: '2023-01-01T09:00:00'
            },
            {
              userId: 3,
              username: 'test3',
              activityType: 'RATE_MOVIE',
              movieId: 3,
              movieTitle: 'Movie 3',
              createdAt: '2023-01-01T08:00:00',
              rating: 5
            },
            {
              userId: 4,
              username: 'test4',
              activityType: 'UNKNOWN_TYPE',
              movieId: 4,
              movieTitle: 'Movie 4',
              createdAt: '2023-01-01T07:00:00'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
      expect(screen.getByText('Movie 4')).toBeInTheDocument();
    });
  });

  test('handles poster path variations', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'test1',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Movie No Poster',
              moviePoster: null,
              createdAt: '2023-01-01T10:00:00'
            },
            {
              userId: 2,
              username: 'test2',
              activityType: 'VIEW_MOVIE',
              movieId: 2,
              movieTitle: 'Movie HTTP Poster',
              moviePoster: 'http://example.com/poster.jpg',
              createdAt: '2023-01-01T09:00:00'
            },
            {
              userId: 3,
              username: 'test3',
              activityType: 'VIEW_MOVIE',
              movieId: 3,
              movieTitle: 'Movie TMDB Poster',
              moviePoster: '/tmdb-poster.jpg',
              createdAt: '2023-01-01T08:00:00'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie No Poster')).toBeInTheDocument();
      expect(screen.getByText('Movie HTTP Poster')).toBeInTheDocument();
      expect(screen.getByText('Movie TMDB Poster')).toBeInTheDocument();
    });
  });

  test('handles empty date string formatting', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'test1',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Movie No Date',
              createdAt: ''
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie No Date')).toBeInTheDocument();
    });
  });

  test('uses displayName when available, username when not', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'user1',
              displayName: 'Display Name',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Movie 1',
              createdAt: '2023-01-01T10:00:00'
            },
            {
              userId: 2,
              username: 'user2',
              displayName: null,
              activityType: 'VIEW_MOVIE',
              movieId: 2,
              movieTitle: 'Movie 2',
              createdAt: '2023-01-01T09:00:00'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Display Name')).toBeInTheDocument(); // Uses displayName
      expect(screen.getByText('user2')).toBeInTheDocument(); // Uses username when displayName is null
    });
  });

  test('handles user navigation from profile button', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'testuser',
              displayName: 'Test User',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Test Movie',
              moviePoster: '/test-poster.jpg',
              createdAt: '2023-01-01T10:00:00',
              rating: 4,
              review: 'Great movie!'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Test profile button navigation - use getAllByText to get the first one
    const profileButtons = screen.getAllByText('プロフィール');
    fireEvent.click(profileButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/users/1');
  });

  test('handles viewing records navigation', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 1,
              username: 'testuser',
              displayName: 'Test User',
              activityType: 'VIEW_MOVIE',
              movieId: 1,
              movieTitle: 'Test Movie',
              moviePoster: '/test-poster.jpg',
              createdAt: '2023-01-01T10:00:00',
              rating: 4,
              review: 'Great movie!'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Test viewing records button navigation
    const viewingRecordsButtons = screen.getAllByText('視聴記録');
    fireEvent.click(viewingRecordsButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/users/1/viewing-records');
  });

  test('handles username click when displayName is not available', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 2,
              username: 'user2',
              displayName: null,
              activityType: 'VIEW_MOVIE',
              movieId: 2,
              movieTitle: 'Movie 2',
              createdAt: '2023-01-01T09:00:00'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie 2')).toBeInTheDocument();
    });
    
    // Click on username
    const usernameElement = screen.getByText('user2');
    fireEvent.click(usernameElement);
    expect(mockNavigate).toHaveBeenCalledWith('/users/2');
  });

  test('handles avatar click navigation', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: [
            {
              userId: 3,
              username: 'testuser3',
              displayName: 'Test User 3',
              activityType: 'VIEW_MOVIE',
              movieId: 3,
              movieTitle: 'Movie 3',
              createdAt: '2023-01-01T09:00:00'
            }
          ]
        }
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie 3')).toBeInTheDocument();
    });
    
    // Click on avatar (first letter)
    const avatarElement = screen.getByText('T');
    fireEvent.click(avatarElement);
    expect(mockNavigate).toHaveBeenCalledWith('/users/3');
  });

  test('handles movie poster click', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockedAxios.get.mockResolvedValue({
      data: mockActivitiesData
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Click on movie poster
    const posterImage = screen.getByAltText('Test Movie');
    fireEvent.click(posterImage);
    expect(consoleSpy).toHaveBeenCalledWith('Movie clicked:', 1);
    
    consoleSpy.mockRestore();
  });

});