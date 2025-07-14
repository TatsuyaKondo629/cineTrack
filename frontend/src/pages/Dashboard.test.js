import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './Dashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock useAuth hook
const mockUser = { username: 'testuser', email: 'test@example.com' };
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

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
      <Dashboard />
    </MemoryRouter>
  );
};

const mockStatsResponse = {
  data: {
    success: true,
    data: {
      totalMovies: 25,
      averageRating: 4.2
    }
  }
};

const mockRecordsResponse = {
  data: {
    success: true,
    data: {
      content: [
        {
          id: 1,
          movieTitle: 'Test Movie 1',
          moviePosterPath: '/poster1.jpg',
          rating: 4,
          viewingDate: '2024-01-15',
          theater: 'Test Theater',
          screeningFormat: 'IMAX',
          review: 'Great movie!'
        },
        {
          id: 2,
          movieTitle: 'Test Movie 2',
          moviePosterPath: '/poster2.jpg',
          rating: 5,
          viewingDate: '2024-01-10',
          theater: null,
          screeningFormat: null,
          review: null
        }
      ]
    }
  }
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  test('displays loading spinner initially', () => {
    // Mock axios to delay response
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays user welcome message after loading', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('おかえりなさい、')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('あなたの映画ライフを確認しましょう')).toBeInTheDocument();
    });
  });

  test('displays user statistics correctly', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // totalMovies
      expect(screen.getByText('4.2')).toBeInTheDocument(); // averageRating
      expect(screen.getByText('視聴した映画数')).toBeInTheDocument();
      expect(screen.getByText('平均評価')).toBeInTheDocument();
    });
  });

  test('displays recent viewing records', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      expect(screen.getByText('★ 4')).toBeInTheDocument();
      expect(screen.getByText('★ 5')).toBeInTheDocument();
      expect(screen.getByText('📍 Test Theater')).toBeInTheDocument();
      expect(screen.getByText('IMAX')).toBeInTheDocument();
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
    });
  });

  test('displays empty state when no records exist', async () => {
    const emptyRecordsResponse = {
      data: {
        success: true,
        data: {
          content: []
        }
      }
    };
    
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(emptyRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('まだ視聴記録がありません')).toBeInTheDocument();
      expect(screen.getByText('映画を観たら記録してみましょう！')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '映画を探す' })).toBeInTheDocument();
    });
  });

  test('navigates to movies page when "映画を探す" button is clicked', async () => {
    const emptyRecordsResponse = {
      data: {
        success: true,
        data: {
          content: []
        }
      }
    };
    
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(emptyRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '映画を探す' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: '映画を探す' }));
    expect(mockNavigate).toHaveBeenCalledWith('/movies');
  });

  test('navigates to viewing records when "すべて見る" button is clicked', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'すべて見る' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'すべて見る' }));
    expect(mockNavigate).toHaveBeenCalledWith('/viewing-records');
  });

  test('navigates to viewing records when record card is clicked', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click on the first movie card
    fireEvent.click(screen.getByText('Test Movie 1').closest('[role="button"]') || screen.getByText('Test Movie 1').closest('div'));
    expect(mockNavigate).toHaveBeenCalledWith('/viewing-records');
  });

  test('quick action buttons navigate correctly', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getAllByText('映画を探す')).toHaveLength(1);
      expect(screen.getByText('視聴記録を見る')).toBeInTheDocument();
    });
    
    // Test "映画を探す" quick action
    fireEvent.click(screen.getAllByText('映画を探す')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/movies');
    
    // Test "視聴記録を見る" quick action
    fireEvent.click(screen.getByText('視聴記録を見る'));
    expect(mockNavigate).toHaveBeenCalledWith('/viewing-records');
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      // Should not crash and should show default values
      expect(screen.getByText('0')).toBeInTheDocument(); // default totalMovies
      expect(screen.getByText('0.0')).toBeInTheDocument(); // default averageRating
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching dashboard data:', expect.any(Error));
    consoleSpy.makeRealMock();
  });

  test('does not make API calls when no token is available', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
    
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('No authentication token found');
    consoleSpy.makeRealMock();
  });

  test('makes correct API calls with proper headers', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/viewing-records/stats',
      {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      }
    );
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:8080/api/viewing-records?page=0&size=6',
      {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      }
    );
  });

  test('displays correct recent records count', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // recentRecords.length
      expect(screen.getByText('最近の記録')).toBeInTheDocument();
    });
  });

  test('handles incomplete stats data', async () => {
    const incompleteStatsResponse = {
      data: {
        success: true,
        data: {
          totalMovies: null,
          averageRating: null
        }
      }
    };
    
    mockedAxios.get
      .mockResolvedValueOnce(incompleteStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // fallback for totalMovies
      expect(screen.getByText('0.0')).toBeInTheDocument(); // fallback for averageRating
    });
  });

  test('handles failed API responses', async () => {
    const failedStatsResponse = {
      data: {
        success: false
      }
    };
    
    const failedRecordsResponse = {
      data: {
        success: false
      }
    };
    
    mockedAxios.get
      .mockResolvedValueOnce(failedStatsResponse)
      .mockResolvedValueOnce(failedRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('まだ視聴記録がありません')).toBeInTheDocument();
    });
  });

  test('formats dates correctly', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      // Check if dates are formatted as Japanese locale
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });
});