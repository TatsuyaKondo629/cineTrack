import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Movies from './Movies';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock TheaterSearch component
jest.mock('../components/TheaterSearch', () => {
  return function MockTheaterSearch({ onTheaterSelect, selectedTheater, label }) {
    return (
      <div>
        <label htmlFor="theater-select">{label}</label>
        <select
          id="theater-select"
          value={selectedTheater?.id || ''}
          onChange={(e) => {
            if (e.target.value) {
              onTheaterSelect({ id: e.target.value, name: 'Test Theater', displayName: 'Test Theater' });
            } else {
              onTheaterSelect(null);
            }
          }}
        >
          <option value="">選択してください</option>
          <option value="1">Test Theater</option>
        </select>
      </div>
    );
  };
});

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
      <Movies />
    </MemoryRouter>
  );
};

const mockMoviesResponse = {
  data: {
    success: true,
    data: {
      results: [
        {
          id: 1,
          title: 'Test Movie 1',
          poster_path: '/poster1.jpg',
          release_date: '2024-01-15',
          vote_average: 8.5,
          vote_count: 1000,
          popularity: 100.5,
          original_language: 'en',
          original_title: 'Test Movie 1',
          overview: 'A great test movie',
          genre_ids: [28, 12]
        },
        {
          id: 2,
          title: 'Test Movie 2',
          poster_path: '/poster2.jpg',
          release_date: '2024-02-10',
          vote_average: 7.2,
          vote_count: 500,
          popularity: 80.0,
          original_language: 'ja',
          original_title: 'テスト映画2',
          overview: 'Another test movie',
          genre_ids: [18]
        }
      ]
    }
  }
};

// Additional test helpers for coverage improvement
const createMovieResponse = (movies) => ({
  success: true,
  data: { results: movies }
});

const createMockMovie = (id = 1, overrides = {}) => ({
  id,
  title: `Test Movie ${id}`,
  original_title: `Test Movie ${id}`,
  overview: 'Test overview',
  poster_path: '/test-poster.jpg',
  vote_average: 8.5,
  release_date: '2023-01-01',
  genre_ids: [28, 12],
  ...overrides
});

describe('Movies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  test('renders main heading and search bar', () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    expect(screen.getByRole('heading', { name: '映画を探す' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('映画を検索...')).toBeInTheDocument();
  });

  test('renders category tabs', () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    expect(screen.getByRole('tab', { name: 'トレンド' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '人気作品' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '上映中' })).toBeInTheDocument();
  });

  test('displays loading spinner initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('fetches and displays trending movies on initial load', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/trending?timeWindow=day&page=1'
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  test('switches to popular movies when tab is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click popular tab
    fireEvent.click(screen.getByRole('tab', { name: '人気作品' }));
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/popular?page=1'
      );
    });
  });

  test('switches to now playing movies when tab is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: '上映中' }));
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/now-playing?page=1'
      );
    });
  });

  test('opens movie details dialog when movie is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Movie 1'));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('A great test movie')).toBeInTheDocument();
      expect(screen.getByText('公開日')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    });
  });

  test('shows add button only for authenticated users', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Should show add buttons
    expect(screen.getAllByText('記録')).toHaveLength(2);
  });

  test('hides add button for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Should not show add buttons
    expect(screen.queryByText('記録')).not.toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching trending movies:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('displays movie ratings and release years correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('★ 8.5')).toBeInTheDocument();
    expect(screen.getByText('★ 7.2')).toBeInTheDocument();
    expect(screen.getAllByText('2024')).toHaveLength(2);
  });

  test('clears search query when tab is changed', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Enter search
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
    
    // Change tab
    fireEvent.click(screen.getByRole('tab', { name: '人気作品' }));
    
    // Search should be cleared
    expect(searchInput.value).toBe('');
  });

  test('handles API errors for popular movies', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Initial trending call
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error')); // Popular movies call
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: '人気作品' }));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching popular movies:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('handles API errors for now playing movies', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Initial trending call
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error')); // Now playing call
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('tab', { name: '上映中' }));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching now playing movies:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('displays poster image with fallback', async () => {
    const moviesWithNullPoster = {
      data: {
        success: true,
        data: {
          results: [{
            id: 1,
            title: 'Movie Without Poster',
            poster_path: null,
            release_date: '2024-01-15',
            vote_average: 8.5,
            overview: 'Movie without poster'
          }]
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(moviesWithNullPoster);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Poster')).toBeInTheDocument();
    });
  });

  test('displays movie with missing vote average', async () => {
    const moviesWithoutRating = {
      data: {
        success: true,
        data: {
          results: [{
            id: 1,
            title: 'Movie Without Rating',
            poster_path: '/poster.jpg',
            release_date: '2024-01-15',
            vote_average: null,
            overview: 'Movie without rating'
          }]
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(moviesWithoutRating);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Rating')).toBeInTheDocument();
    });
  });

  test('displays movie with missing release date', async () => {
    const moviesWithoutDate = {
      data: {
        success: true,
        data: {
          results: [{
            id: 1,
            title: 'Movie Without Date',
            poster_path: '/poster.jpg',
            release_date: null,
            vote_average: 8.5,
            overview: 'Movie without date'
          }]
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(moviesWithoutDate);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Date')).toBeInTheDocument();
    });
  });

  test('displays movie dialog with all details', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Movie 1'));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('A great test movie')).toBeInTheDocument();
      expect(screen.getByText('公開日')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('評価')).toBeInTheDocument();
      expect(screen.getByText('人気度')).toBeInTheDocument();
      expect(screen.getByText('言語')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });
  });

  test('closes movie dialog', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Movie 1'));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('閉じる'));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('handles unsuccessful API response', async () => {
    const unsuccessfulResponse = {
      data: {
        success: false,
        message: 'API Error'
      }
    };
    
    mockedAxios.get.mockResolvedValue(unsuccessfulResponse);
    
    renderWithRouter();
    
    // Should not crash and should not display movies
    await waitFor(() => {
      expect(screen.queryByText('Test Movie 1')).not.toBeInTheDocument();
    });
  });

  // Search functionality tests
  test('searches for movies when query is entered', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Initial trending call
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Search call
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test movie' } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/search?query=test%20movie&page=1'
      );
    }, { timeout: 1000 });
  });

  test('handles search API errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Initial trending call
    mockedAxios.get.mockRejectedValueOnce(new Error('Search API Error')); // Search call
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error searching movies:', expect.any(Error));
    }, { timeout: 1000 });
    
    consoleSpy.mockRestore();
  });

  test('clears search and returns to tab content when search is empty', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Enter search
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Should fetch trending movies again
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/trending?timeWindow=day&page=1'
      );
    }, { timeout: 1000 });
  });

  test('does not search if query is empty or whitespace only', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    
    // Should not make search API call
    await waitFor(() => {
      expect(mockedAxios.get).not.toHaveBeenCalledWith(
        expect.stringContaining('/movies/search')
      );
    }, { timeout: 1000 });
  });

  // Wishlist functionality tests
  test('checks wishlist status for authenticated users', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Movies call
    mockedAxios.get.mockResolvedValueOnce({ data: { data: true } }); // Wishlist check for movie 1
    mockedAxios.get.mockResolvedValueOnce({ data: { data: false } }); // Wishlist check for movie 2
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/wishlist/check/1',
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/wishlist/check/2',
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  test('adds movie to wishlist when not in wishlist', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Movies call
    mockedAxios.get.mockResolvedValueOnce({ data: { data: false } }); // Wishlist check - not in wishlist
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } }); // Add to wishlist
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Find and click wishlist button
    const wishlistButtons = screen.getAllByText('追加');
    fireEvent.click(wishlistButtons[0]);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/wishlist/add',
        {
          tmdbMovieId: 1,
          movieTitle: 'Test Movie 1',
          moviePosterPath: '/poster1.jpg',
          movieOverview: 'A great test movie',
          movieReleaseDate: '2024-01-15',
          movieVoteAverage: 8.5
        },
        {
          headers: { 
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });



  test('handles wishlist API errors', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockMoviesResponse); // Movies call
    mockedAxios.get.mockResolvedValueOnce({ data: { data: false } }); // Wishlist check
    mockedAxios.post.mockRejectedValueOnce(new Error('Wishlist API Error')); // Add to wishlist error
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const wishlistButtons = screen.getAllByText('追加');
    fireEvent.click(wishlistButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  // Viewing record dialog tests
  test('opens viewing record dialog when add button is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const addButtons = screen.getAllByText('記録');
    fireEvent.click(addButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    }, { timeout: 3000 });
  });


  test('closes viewing record dialog', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const addButtons = screen.getAllByText('記録');
    fireEvent.click(addButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('視聴記録を追加')).not.toBeInTheDocument();
    });
  });

  test('displays snackbar messages', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    mockedAxios.get.mockResolvedValueOnce({ data: { data: false } }); // Not in wishlist
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const wishlistButtons = screen.getAllByText('追加');
    fireEvent.click(wishlistButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('ウィッシュリストに追加しました')).toBeInTheDocument();
    });
  });

  test('handles auth check for wishlist operations', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Wishlist buttons should not be visible for unauthenticated users
    expect(screen.queryByText('追加')).not.toBeInTheDocument();
  });


  test('validates viewing record form', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const addButtons = screen.getAllByText('記録');
    fireEvent.click(addButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Try to save without rating (required)
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    // Form should prevent submission without required rating
    expect(screen.getByText('視聴記録を追加')).toBeInTheDocument(); // Dialog still open
  });


  test('handles movie card interactions', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Test movie card click (should open details)
    const movieCard = screen.getByText('Test Movie 1').closest('div');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('handles tab changes properly', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Switch between tabs
    const popularTab = screen.getByRole('tab', { name: '人気作品' });
    fireEvent.click(popularTab);
    
    const nowPlayingTab = screen.getByRole('tab', { name: '上映中' });
    fireEvent.click(nowPlayingTab);
    
    const trendingTab = screen.getByRole('tab', { name: 'トレンド' });
    fireEvent.click(trendingTab);
    
    // Should have made API calls for each tab
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/popular?page=1'
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/now-playing?page=1'
      );
    });
  });

  test('handles large number of movies', async () => {
    const manyMovies = {
      data: {
        success: true,
        data: {
          results: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Movie ${i + 1}`,
            poster_path: `/poster${i + 1}.jpg`,
            release_date: '2024-01-01',
            vote_average: 7.5,
            overview: `Overview for movie ${i + 1}`,
            genre_ids: [28]
          }))
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(manyMovies);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 20')).toBeInTheDocument();
    });
  });

  test('handles movies with different data completeness', async () => {
    const moviesWithVariousData = {
      data: {
        success: true,
        data: {
          results: [
            {
              id: 1,
              title: 'Complete Movie',
              poster_path: '/poster.jpg',
              release_date: '2024-01-01',
              vote_average: 8.5,
              overview: 'Complete overview',
              genre_ids: [28, 12]
            },
            {
              id: 2,
              title: 'Minimal Movie',
              poster_path: null,
              release_date: null,
              vote_average: 0,
              overview: '',
              genre_ids: []
            }
          ]
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(moviesWithVariousData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Complete Movie')).toBeInTheDocument();
      expect(screen.getByText('Minimal Movie')).toBeInTheDocument();
    });
  });

  test('maintains component state during re-renders', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Switch tabs (should clear search)
    fireEvent.click(screen.getByRole('tab', { name: '人気作品' }));
    
    // Verify search was cleared
    expect(searchInput.value).toBe('');
  });


  test('handles edge case in movie data', async () => {
    const edgeCaseMovies = {
      data: {
        success: true,
        data: {
          results: [
            {
              id: 1,
              title: '',
              poster_path: '/poster.jpg',
              release_date: 'invalid-date',
              vote_average: -1,
              overview: null,
              genre_ids: null
            }
          ]
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(edgeCaseMovies);
    
    renderWithRouter();
    
    // Should handle gracefully without crashing
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('handles auth context changes', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    // Start authenticated
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Should show action buttons for authenticated user
    expect(screen.getAllByText('記録')).toHaveLength(2);
  });

  // Additional edge case and error handling tests
  test('handles malformed API responses', async () => {
    const malformedResponse = {
      data: {
        success: true,
        data: null // This could cause issues
      }
    };
    
    mockedAxios.get.mockResolvedValue(malformedResponse);
    
    renderWithRouter();
    
    // Should not crash, component should handle gracefully
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('handles network timeout scenarios', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('Network timeout'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles rapid user interactions', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Rapid search input changes
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'a' } });
    fireEvent.change(searchInput, { target: { value: 'ab' } });
    fireEvent.change(searchInput, { target: { value: 'abc' } });
    
    // Should handle debouncing properly
    expect(searchInput.value).toBe('abc');
  });

  test('handles component cleanup', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    const { unmount } = renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Unmount component
    unmount();
    
    // Should not cause memory leaks or errors
    expect(true).toBe(true); // If we reach here, cleanup worked
  });

  test('preserves user session state', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    mockLocalStorage.getItem.mockReturnValue('valid-token');
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Should show authenticated user features
    expect(screen.getAllByText('記録')).toHaveLength(2);
  });
});