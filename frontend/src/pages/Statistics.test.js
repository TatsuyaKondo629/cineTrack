import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Statistics from './Statistics';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

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

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

const mockStatsData = {
  success: true,
  data: {
    overall: {
      totalMovies: 25,
      averageRating: 4.2,
      moviesPerMonth: 2.5,
      viewingDays: 365,
      favoriteGenre: 'アクション',
      firstViewingDate: '2023-01-15',
      lastViewingDate: '2024-01-15'
    },
    monthly: [
      { month: '2024年1月', count: 5 },
      { month: '2024年2月', count: 3 },
      { month: '2024年3月', count: 7 }
    ],
    genres: [
      { genre: 'アクション', count: 10, percentage: 40.0 },
      { genre: 'ドラマ', count: 8, percentage: 32.0 },
      { genre: 'コメディ', count: 7, percentage: 28.0 }
    ],
    ratings: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 5 },
      { rating: 4, count: 10 },
      { rating: 5, count: 7 }
    ]
  }
};

const mockEmptyStatsData = {
  success: true,
  data: {
    overall: null,
    monthly: [],
    genres: [],
    ratings: []
  }
};

describe('Statistics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('renders statistics page header', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
      expect(screen.getByText('あなたの映画視聴データを詳しく分析します')).toBeInTheDocument();
    });
  });

  test('shows loading spinner initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    render(<Statistics />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });


  test('renders chart sections with data', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('月別視聴数')).toBeInTheDocument();
      expect(screen.getByText('ジャンル分布')).toBeInTheDocument();
      expect(screen.getByText('評価分布')).toBeInTheDocument();
      expect(screen.getByText('視聴統計サマリー')).toBeInTheDocument();
    });
  });

  test('handles no authentication token', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    });

    // Should not make API call without token
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('handles API error gracefully', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { message: 'Server error' } }
    });
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching statistics:', expect.any(Object));
  });

  test('makes API call with correct parameters', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/stats/summary',
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });

  test('handles empty arrays for statistics correctly', async () => {
    const emptyData = {
      success: true,
      data: {
        overall: {
          totalMovies: 0,
          averageRating: 0,
          moviesPerMonth: 0,
          viewingDays: 0,
          favoriteGenre: null
        },
        monthly: [],
        genres: [],
        ratings: []
      }
    };
    
    mockedAxios.get.mockResolvedValue(emptyData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    });
    
    // Should not crash with empty arrays
    expect(screen.queryByText('お気に入りジャンル')).not.toBeInTheDocument();
  });

  // Test fetchStatistics function with different API_BASE_URL
  test('fetchStatistics uses custom API_BASE_URL from environment', async () => {
    // Mock environment variable
    const originalEnv = process.env.REACT_APP_API_BASE_URL;
    process.env.REACT_APP_API_BASE_URL = 'https://custom-api.example.com/api';
    
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://custom-api.example.com/api/stats/summary',
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        }
      );
    }, { timeout: 5000 });
    
    // Restore original environment
    process.env.REACT_APP_API_BASE_URL = originalEnv;
  });

  // Test fetchStatistics function error handling branches
  test('fetchStatistics handles axios error with response data', async () => {
    const errorWithResponse = {
      response: {
        data: {
          message: 'Specific server error'
        }
      }
    };
    
    mockedAxios.get.mockRejectedValue(errorWithResponse);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check console.error was called with correct parameters
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching statistics:', errorWithResponse);
    expect(consoleSpy).toHaveBeenCalledWith('Error details:', errorWithResponse.response.data);
  });

  // Test fetchStatistics function error handling without response data
  test('fetchStatistics handles axios error without response data', async () => {
    const errorWithoutResponse = new Error('Network error');
    
    mockedAxios.get.mockRejectedValue(errorWithoutResponse);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check console.error was called with correct parameters
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching statistics:', errorWithoutResponse);
    expect(consoleSpy).toHaveBeenCalledWith('Error details:', undefined);
  });

});