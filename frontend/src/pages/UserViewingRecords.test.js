import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import UserViewingRecords from './UserViewingRecords';

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
      <UserViewingRecords />
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
      averageRating: 4.2
    }
  }
};

const mockViewingRecordsData = {
  data: {
    success: true,
    data: {
      content: [
        {
          id: 1,
          movieTitle: 'Test Movie 1',
          moviePosterPath: '/poster1.jpg',
          rating: 4,
          viewingDate: '2024-01-15T12:00:00',
          theater: 'Test Theater',
          screeningFormat: 'IMAX',
          review: 'Great movie!'
        },
        {
          id: 2,
          movieTitle: 'Test Movie 2',
          moviePosterPath: '/poster2.jpg',
          rating: 5,
          viewingDate: '2024-01-10T12:00:00',
          theater: null,
          screeningFormat: null,
          review: null
        }
      ],
      totalPages: 2,
      totalElements: 10,
      number: 0
    }
  }
};

describe('UserViewingRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
    
    // Setup default axios responses
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/social/users/123') && !url.includes('/viewing-records')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/social/users/123/viewing-records')) {
        return Promise.resolve(mockViewingRecordsData);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  test('renders user viewing records page', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User の視聴記録')).toBeInTheDocument();
    });
  });

  test('shows loading text initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('displays user profile information', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User の視聴記録')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('10 件の記録')).toBeInTheDocument();
      expect(screen.getByText('平均評価: 4.2')).toBeInTheDocument();
    });
  });

  test('displays viewing records', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
      expect(screen.getByText('Test Theater')).toBeInTheDocument();
      expect(screen.getByText('IMAX')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録の取得中にエラーが発生しました')).toBeInTheDocument();
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

  test('displays empty state when no records', async () => {
    const emptyRecordsData = {
      data: {
        success: true,
        data: {
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/social/users/123') && !url.includes('/viewing-records')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/social/users/123/viewing-records')) {
        return Promise.resolve(emptyRecordsData);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録がありません')).toBeInTheDocument();
    });
  });

  test('handles 403 forbidden error specifically', async () => {
    const forbiddenError = new Error('Forbidden');
    forbiddenError.response = { status: 403 };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/social/users/123') && !url.includes('/viewing-records')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/social/users/123/viewing-records')) {
        return Promise.reject(forbiddenError);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('このユーザーの視聴記録を閲覧する権限がありません')).toBeInTheDocument();
    });
  });

  test('handles 401 unauthorized error specifically', async () => {
    const unauthorizedError = new Error('Unauthorized');
    unauthorizedError.response = { status: 401 };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/social/users/123') && !url.includes('/viewing-records')) {
        return Promise.resolve(mockUserData);
      }
      if (url.includes('/social/users/123/viewing-records')) {
        return Promise.reject(unauthorizedError);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('このユーザーの視聴記録を閲覧する権限がありません')).toBeInTheDocument();
    });
  });

  test('displays username when displayName is not available', async () => {
    const userWithoutDisplayName = {
      data: {
        success: true,
        data: {
          id: 123,
          username: 'usernameonly',
          email: 'test@example.com',
          averageRating: 3.5
        }
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/social/users/123') && !url.includes('/viewing-records')) {
        return Promise.resolve(userWithoutDisplayName);
      }
      if (url.includes('/social/users/123/viewing-records')) {
        return Promise.resolve(mockViewingRecordsData);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('usernameonly の視聴記録')).toBeInTheDocument();
    });
  });

  test('handles error dismissal', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録の取得中にエラーが発生しました')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('視聴記録の取得中にエラーが発生しました')).not.toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('displays avatar with correct initials', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // Avatar with first letter of displayName
    });
  });

  test('formats viewing date correctly', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('2024年1月15日')).toBeInTheDocument();
      expect(screen.getByText('2024年1月10日')).toBeInTheDocument();
    });
  });

  test('displays ratings correctly', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('handles movie cards hover effects', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('.MuiCard-root');
    expect(movieCard).toHaveStyle('transition: transform 0.2s,elevation 0.2s');
  });

  test('displays screening format chip when available', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('IMAX')).toBeInTheDocument();
    });
    
    const imaxChip = screen.getByText('IMAX');
    expect(imaxChip).toBeInTheDocument();
  });

});