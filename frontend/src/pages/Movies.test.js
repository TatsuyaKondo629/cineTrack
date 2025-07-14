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

describe('Movies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    jest.useRealTimers();
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

  test('performs search with debouncing', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Should not call API immediately
    expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Only initial trending call
    
    // Fast-forward 500ms for debounce
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/search?query=test%20search&page=1'
      );
    });
  });

  test('clears search and returns to current tab when search is cleared', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Enter search
    const searchInput = screen.getByPlaceholderText('映画を検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    jest.advanceTimersByTime(500);
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/movies/trending?timeWindow=day&page=1'
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
    
    // Test unauthenticated user
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    
    const { rerender } = renderWithRouter();
    
    await waitFor(() => {
      expect(screen.queryByText('記録')).not.toBeInTheDocument();
    });
  });

  test('opens viewing record dialog when add button is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('記録')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
      expect(screen.getByText('あなたの評価')).toBeInTheDocument();
      expect(screen.getByLabelText('視聴日')).toBeInTheDocument();
    });
  });

  test('shows login warning for unauthenticated users trying to add record', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click movie to open details
    fireEvent.click(screen.getByText('Test Movie 1'));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Try to add to watchlist from dialog
    fireEvent.click(screen.getByText('視聴記録に追加'));
    
    await waitFor(() => {
      expect(screen.getByText('ログインしてください')).toBeInTheDocument();
    });
  });

  test('saves viewing record successfully', async () => {
    const saveResponse = { data: { success: true } };
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    mockedAxios.post.mockResolvedValue(saveResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open add dialog
    fireEvent.click(screen.getAllByText('記録')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Set rating
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[3]); // 4 stars
    
    // Fill other fields
    fireEvent.change(screen.getByLabelText('映画館'), { target: { value: 'Test Theater' } });
    
    // Save
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/viewing-records',
        expect.objectContaining({
          tmdbMovieId: 1,
          movieTitle: 'Test Movie 1',
          rating: 4,
          theater: 'Test Theater'
        }),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を保存しました')).toBeInTheDocument();
    });
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

  test('disables save button when rating is 0', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('記録')[0]);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    });
    
    // Set rating
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[2]); // 3 stars
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存' })).not.toBeDisabled();
    });
  });

  test('handles save error gracefully', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: 'Duplicate record' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('記録')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Set rating and save
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[3]);
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    
    await waitFor(() => {
      expect(screen.getByText('Duplicate record')).toBeInTheDocument();
    });
  });

  test('displays movie ratings and release years correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockMoviesResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('★ 8.5')).toBeInTheDocument();
      expect(screen.getByText('★ 7.2')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });
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
});