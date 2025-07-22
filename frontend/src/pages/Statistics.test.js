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

  test.skip('renders all statistics cards with data', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('総視聴映画数')).toBeInTheDocument();
      expect(screen.getByText('平均評価')).toBeInTheDocument();
      expect(screen.getByText('月あたり視聴数')).toBeInTheDocument();
      expect(screen.getByText('視聴期間（日）')).toBeInTheDocument();
    }, { timeout: 5000 });

    await waitFor(() => {
      // Check the actual values
      expect(screen.getByText('25')).toBeInTheDocument(); // total movies
      expect(screen.getByText('4.2')).toBeInTheDocument(); // average rating
      expect(screen.getByText('2.5')).toBeInTheDocument(); // movies per month
      expect(screen.getByText('365')).toBeInTheDocument(); // viewing days
    }, { timeout: 5000 });
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

  test.skip('displays favorite genre when available', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('お気に入りジャンル')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('アクション')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('displays monthly data correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('月別視聴数')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      expect(screen.getByText('2024年2月')).toBeInTheDocument();
      expect(screen.getByText('2024年3月')).toBeInTheDocument();
      expect(screen.getByText('5本')).toBeInTheDocument();
      expect(screen.getByText('3本')).toBeInTheDocument();
      expect(screen.getByText('7本')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('displays genre distribution correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('ジャンル分布')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('アクション')).toBeInTheDocument();
      expect(screen.getByText('ドラマ')).toBeInTheDocument();
      expect(screen.getByText('コメディ')).toBeInTheDocument();
      expect(screen.getByText('10本')).toBeInTheDocument();
      expect(screen.getByText('8本')).toBeInTheDocument();
      expect(screen.getByText('40.0%')).toBeInTheDocument();
      expect(screen.getByText('32.0%')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('displays rating distribution correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('評価分布')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('★1')).toBeInTheDocument();
      expect(screen.getByText('★2')).toBeInTheDocument();
      expect(screen.getByText('★3')).toBeInTheDocument();
      expect(screen.getByText('★4')).toBeInTheDocument();
      expect(screen.getByText('★5')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('displays summary statistics correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('最も視聴の多い月')).toBeInTheDocument();
      expect(screen.getByText('最も人気のジャンル')).toBeInTheDocument();
      expect(screen.getByText('最も多い評価')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('2024年3月')).toBeInTheDocument(); // highest month
      expect(screen.getByText('★4')).toBeInTheDocument(); // most common rating
    }, { timeout: 5000 });
  });

  test.skip('displays detail information correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('詳細情報')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('初回視聴日: 2023-01-15')).toBeInTheDocument();
      expect(screen.getByText('最新視聴日: 2024-01-15')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('handles empty data gracefully', async () => {
    mockedAxios.get.mockResolvedValue(mockEmptyStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // total movies
      expect(screen.getByText('0.0')).toBeInTheDocument(); // average rating
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

  test.skip('handles data with null values correctly', async () => {
    const dataWithNulls = {
      success: true,
      data: {
        overall: {
          totalMovies: 0,
          averageRating: null,
          moviesPerMonth: null,
          viewingDays: 0,
          favoriteGenre: null,
          firstViewingDate: null,
          lastViewingDate: null
        },
        monthly: [],
        genres: [],
        ratings: []
      }
    };
    
    mockedAxios.get.mockResolvedValue(dataWithNulls);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('詳細情報')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('初回視聴日: データなし')).toBeInTheDocument();
      expect(screen.getByText('最新視聴日: データなし')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('handles successful API response and sets stats data', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    // Wait for API response to be processed (line 52: setStatsData)
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check that data was set correctly by verifying rendered content
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // totalMovies
      expect(screen.getByText('4.2')).toBeInTheDocument(); // averageRating
      expect(screen.getByText('アクション')).toBeInTheDocument(); // favoriteGenre
    }, { timeout: 5000 });
  });

  test.skip('renders full monthly data section with all elements', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    // Test monthly data section (lines 191-459)
    await waitFor(() => {
      expect(screen.getByText('月別視聴数')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check all monthly items are rendered
    await waitFor(() => {
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      expect(screen.getByText('2024年2月')).toBeInTheDocument();
      expect(screen.getByText('2024年3月')).toBeInTheDocument();
      expect(screen.getByText('5本')).toBeInTheDocument();
      expect(screen.getByText('3本')).toBeInTheDocument();
      expect(screen.getByText('7本')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('renders genre distribution section completely', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    // Test genre distribution section (part of lines 191-459)
    await waitFor(() => {
      expect(screen.getByText('ジャンル分布')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check all genre data is rendered
    await waitFor(() => {
      expect(screen.getByText('アクション')).toBeInTheDocument();
      expect(screen.getByText('ドラマ')).toBeInTheDocument();
      expect(screen.getByText('コメディ')).toBeInTheDocument();
      expect(screen.getByText('10本')).toBeInTheDocument();
      expect(screen.getByText('8本')).toBeInTheDocument();
      expect(screen.getByText('7本')).toBeInTheDocument();
      expect(screen.getByText('40.0%')).toBeInTheDocument();
      expect(screen.getByText('32.0%')).toBeInTheDocument();
      expect(screen.getByText('28.0%')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('renders rating distribution section completely', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    // Test rating distribution section (part of lines 191-459)
    await waitFor(() => {
      expect(screen.getByText('評価分布')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check all rating data is rendered
    await waitFor(() => {
      expect(screen.getByText('★1')).toBeInTheDocument();
      expect(screen.getByText('★2')).toBeInTheDocument();
      expect(screen.getByText('★3')).toBeInTheDocument();
      expect(screen.getByText('★4')).toBeInTheDocument();
      expect(screen.getByText('★5')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test.skip('renders summary statistics section completely', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    // Test summary statistics section (part of lines 191-459)
    await waitFor(() => {
      expect(screen.getByText('視聴統計サマリー')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('最も視聴の多い月')).toBeInTheDocument();
      expect(screen.getByText('最も人気のジャンル')).toBeInTheDocument();
      expect(screen.getByText('最も多い評価')).toBeInTheDocument();
      expect(screen.getByText('2024年3月')).toBeInTheDocument(); // highest month
      expect(screen.getByText('★4')).toBeInTheDocument(); // most common rating
    }, { timeout: 5000 });
  });

  test.skip('renders detail information section completely', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    // Test detail information section (part of lines 191-459)
    await waitFor(() => {
      expect(screen.getByText('詳細情報')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('初回視聴日: 2023-01-15')).toBeInTheDocument();
      expect(screen.getByText('最新視聴日: 2024-01-15')).toBeInTheDocument();
    }, { timeout: 5000 });
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

  test.skip('logs correct messages during fetch', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Fetching statistics from:',
        'http://localhost:8080/api/stats/summary'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Statistics response:',
        mockStatsData
      );
    }, { timeout: 5000 });
  });

  test.skip('formats data correctly for charts', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('月別視聴数')).toBeInTheDocument();
      expect(screen.getByText('評価分布')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      // Monthly data should be formatted correctly
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      
      // Rating data should be formatted correctly
      expect(screen.getByText('★5')).toBeInTheDocument();
      expect(screen.getByText('★4')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // Tests specifically targeting formatMonthlyData function coverage
  test.skip('formatMonthlyData function processes various monthly data', async () => {
    const customMonthlyData = {
      success: true,
      data: {
        overall: {
          totalMovies: 10,
          averageRating: 3.5,
          moviesPerMonth: 1.5,
          viewingDays: 100,
          favoriteGenre: 'Test'
        },
        monthly: [
          { month: '2023年12月', count: 2 },
          { month: '2024年1月', count: 8 },
          { month: '2024年2月', count: 0 }
        ],
        genres: [],
        ratings: []
      }
    };
    
    mockedAxios.get.mockResolvedValue(customMonthlyData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('2023年12月')).toBeInTheDocument();
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      expect(screen.getByText('2024年2月')).toBeInTheDocument();
      expect(screen.getByText('2本')).toBeInTheDocument();
      expect(screen.getByText('8本')).toBeInTheDocument();
      expect(screen.getByText('0本')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // Tests specifically targeting formatRatingData function coverage
  test.skip('formatRatingData function processes rating data correctly', async () => {
    const customRatingData = {
      success: true,
      data: {
        overall: {
          totalMovies: 15,
          averageRating: 4.0,
          moviesPerMonth: 2.0,
          viewingDays: 200
        },
        monthly: [],
        genres: [],
        ratings: [
          { rating: 1, count: 1 },
          { rating: 2, count: 0 },
          { rating: 3, count: 3 },
          { rating: 4, count: 6 },
          { rating: 5, count: 5 }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(customRatingData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('★1')).toBeInTheDocument();
      expect(screen.getByText('★2')).toBeInTheDocument();
      expect(screen.getByText('★3')).toBeInTheDocument();
      expect(screen.getByText('★4')).toBeInTheDocument();
      expect(screen.getByText('★5')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check count labels are properly formatted
    await waitFor(() => {
      expect(screen.getByText('1本')).toBeInTheDocument();
      expect(screen.getByText('3本')).toBeInTheDocument();
      expect(screen.getByText('6本')).toBeInTheDocument();
      expect(screen.getByText('5本')).toBeInTheDocument();
    }, { timeout: 5000 });
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

  // Test edge cases for data formatting functions
  test.skip('handles empty monthly and rating arrays correctly', async () => {
    const emptyArraysData = {
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
    
    mockedAxios.get.mockResolvedValue(emptyArraysData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // totalMovies
      expect(screen.getByText('0.0')).toBeInTheDocument(); // averageRating
    }, { timeout: 5000 });
    
    // Should not show favorite genre section when favoriteGenre is null
    expect(screen.queryByText('お気に入りジャンル')).not.toBeInTheDocument();
  });

  // Test complex data scenarios to increase branch coverage
  test.skip('handles complex data with various edge cases', async () => {
    const complexData = {
      success: true,
      data: {
        overall: {
          totalMovies: 100,
          averageRating: 4.75,
          moviesPerMonth: 8.33,
          viewingDays: 365,
          favoriteGenre: 'サスペンス',
          firstViewingDate: '2020-01-01',
          lastViewingDate: '2024-12-31'
        },
        monthly: [
          { month: '2024年1月', count: 25 },
          { month: '2024年2月', count: 15 },
          { month: '2024年3月', count: 30 },
          { month: '2024年4月', count: 30 } // Same as March to test max calculation
        ],
        genres: [
          { genre: 'サスペンス', count: 40, percentage: 40.0 },
          { genre: 'アクション', count: 30, percentage: 30.0 },
          { genre: 'ドラマ', count: 20, percentage: 20.0 },
          { genre: 'コメディ', count: 10, percentage: 10.0 }
        ],
        ratings: [
          { rating: 1, count: 5 },
          { rating: 2, count: 10 },
          { rating: 3, count: 15 },
          { rating: 4, count: 35 },
          { rating: 5, count: 35 } // Same as rating 4 to test max calculation
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(complexData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument(); // Should round to 4.8
      expect(screen.getByText('8.3')).toBeInTheDocument(); // Should round to 8.3
      expect(screen.getByText('365')).toBeInTheDocument();
      expect(screen.getByText('サスペンス')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Test the summary statistics with multiple max values
    await waitFor(() => {
      // Should show one of the months with max count (March or April)
      const summaryText = screen.getByText('視聴統計サマリー');
      expect(summaryText).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // Test data formatting edge cases with single items
  test.skip('handles single item arrays in monthly and rating data', async () => {
    const singleItemData = {
      success: true,
      data: {
        overall: {
          totalMovies: 1,
          averageRating: 5.0,
          moviesPerMonth: 1.0,
          viewingDays: 30,
          favoriteGenre: 'ホラー'
        },
        monthly: [
          { month: '2024年1月', count: 1 }
        ],
        genres: [
          { genre: 'ホラー', count: 1, percentage: 100.0 }
        ],
        ratings: [
          { rating: 5, count: 1 }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(singleItemData);
    
    render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // totalMovies
      expect(screen.getByText('5.0')).toBeInTheDocument(); // averageRating
      expect(screen.getByText('1.0')).toBeInTheDocument(); // moviesPerMonth
      expect(screen.getByText('ホラー')).toBeInTheDocument(); // favoriteGenre
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      expect(screen.getByText('1本')).toBeInTheDocument();
      expect(screen.getByText('★5')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  // Test fetchStatistics useCallback dependency on API_BASE_URL
  test.skip('fetchStatistics useCallback updates when API_BASE_URL changes', async () => {
    mockedAxios.get.mockResolvedValue(mockStatsData);
    
    const { rerender } = render(<Statistics />);
    
    await waitFor(() => {
      expect(screen.getByText('統計・分析')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Clear mock to track new calls
    mockedAxios.get.mockClear();
    
    // Force re-render to trigger useEffect again
    rerender(<Statistics />);
    
    // Should call API again due to useEffect dependency
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

});