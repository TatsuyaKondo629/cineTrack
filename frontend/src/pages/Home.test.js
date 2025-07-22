import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Home from './Home';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockMovies = [
  {
    id: 1,
    title: 'Test Movie 1',
    original_title: 'Original Test Movie 1',
    poster_path: '/test1.jpg',
    release_date: '2023-01-01',
    overview: 'This is a test movie',
    vote_average: 7.5,
    vote_count: 500,
    popularity: 100.5,
    original_language: 'en',
    genre_ids: [28, 12]
  },
  {
    id: 2,
    title: 'Test Movie 2',
    original_title: 'Test Movie 2',
    poster_path: '/test2.jpg',
    release_date: '2023-02-01',
    overview: 'This is another test movie',
    vote_average: 8.2,
    vote_count: 750,
    popularity: 85.3,
    original_language: 'jp',
    genre_ids: [16, 35]
  }
];

const mockAuth = {
  isAuthenticated: false
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

const renderHome = () => {
  return render(<Home />);
};

describe('Home Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
    mockAuth.isAuthenticated = false;
  });

  test('renders hero section', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    expect(screen.getByText('CineTrack')).toBeInTheDocument();
    expect(screen.getByText('あなたの映画体験を記録し、管理しよう')).toBeInTheDocument();
  });

  test('renders trending movies section', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    expect(screen.getByText('今日のトレンド映画')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  test('renders features section', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    expect(screen.getByText('主な機能')).toBeInTheDocument();
    expect(screen.getByText('📽️ 映画検索')).toBeInTheDocument();
    expect(screen.getByText('📝 視聴記録')).toBeInTheDocument();
    expect(screen.getByText('📊 統計表示')).toBeInTheDocument();
  });

  test('shows start button for non-authenticated users', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    expect(screen.getByText('今すぐ始める')).toBeInTheDocument();
  });

  test('shows dashboard button for authenticated users', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    mockAuth.isAuthenticated = true;

    await act(async () => {
      renderHome();
    });
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });

  test('clicking movie opens details dialog', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Movie 1'));
    
    // Check if dialog is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a test movie')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      renderHome();
    });
    
    // Should not crash and should not show movie content
    await waitFor(() => {
      expect(screen.queryByText('Test Movie 1')).not.toBeInTheDocument();
    });
  });

  test('shows loading state initially', async () => {
    // Don't resolve the promise immediately
    mockedAxios.get.mockImplementationOnce(() => new Promise(() => {}));

    await act(async () => {
      renderHome();
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('navigates to movies page when start button is clicked', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    fireEvent.click(screen.getByText('今すぐ始める'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('navigates to login when login button is clicked', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    fireEvent.click(screen.getByText('ログイン'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to movies page for authenticated users', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    mockAuth.isAuthenticated = true;

    await act(async () => {
      renderHome();
    });
    
    fireEvent.click(screen.getByText('映画を探す'));
    expect(mockNavigate).toHaveBeenCalledWith('/movies');
  });

  test('navigates to dashboard for authenticated users', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    mockAuth.isAuthenticated = true;

    await act(async () => {
      renderHome();
    });
    
    fireEvent.click(screen.getByText('ダッシュボード'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('navigates to movies page from trending section', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('もっと映画を見る')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('もっと映画を見る'));
    expect(mockNavigate).toHaveBeenCalledWith('/movies');
  });

  test('navigates to movies page from dialog', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Movie 1'));
    
    // Check if dialog is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('映画ページで詳細を見る'));
    expect(mockNavigate).toHaveBeenCalledWith('/movies');
  });

  test('closes movie details dialog', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Movie 1'));
    
    // Check if dialog is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('閉じる'));
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('closes movie details dialog with backdrop click', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: mockMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Movie 1'));
    
    // Check if dialog is opened
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Click backdrop to close - simulate the onClose callback
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('displays movie with null poster path', async () => {
    const moviesWithNullPoster = [
      {
        id: 1,
        title: 'Movie Without Poster',
        poster_path: null,
        release_date: '2023-01-01',
        overview: 'Movie without poster'
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: moviesWithNullPoster
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Poster')).toBeInTheDocument();
    });
  });

  test('displays movie with missing release date', async () => {
    const moviesWithoutDate = [
      {
        id: 1,
        title: 'Movie Without Date',
        poster_path: '/test.jpg',
        release_date: null,
        overview: 'Movie without release date'
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: moviesWithoutDate
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Date')).toBeInTheDocument();
    });
  });

  test('handles movies with missing vote average', async () => {
    const moviesWithoutRating = [
      {
        id: 1,
        title: 'Movie Without Rating',
        poster_path: '/test.jpg',
        release_date: '2023-01-01',
        overview: 'Movie without rating',
        vote_average: null
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: moviesWithoutRating
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Rating')).toBeInTheDocument();
    });
  });

  test('displays movie details with all optional fields', async () => {
    const movieWithAllFields = {
      id: 1,
      title: 'Complete Movie',
      original_title: 'Original Complete Movie',
      poster_path: '/test.jpg',
      release_date: '2023-01-01',
      overview: 'Complete movie overview',
      vote_average: 8.5,
      vote_count: 1000,
      popularity: 123.45,
      original_language: 'en',
      genre_ids: [28, 12, 16]
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: [movieWithAllFields]
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Complete Movie')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Complete Movie'));
    
    await waitFor(() => {
      expect(screen.getByText('Original Complete Movie')).toBeInTheDocument();
      expect(screen.getByText('Complete movie overview')).toBeInTheDocument();
      expect(screen.getByText('2023-01-01')).toBeInTheDocument();
      expect(screen.getAllByText('★ 8.5')[1]).toBeInTheDocument(); // Dialog版を選択
      expect(screen.getByText('(1000 票)')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('ジャンル')).toBeInTheDocument();
    });
  });

  test('displays movie details with missing optional fields', async () => {
    const movieWithMissingFields = {
      id: 1,
      title: 'Minimal Movie',
      original_title: 'Minimal Movie', // Same as title
      poster_path: '/test.jpg',
      release_date: null,
      overview: null,
      vote_average: null,
      vote_count: null,
      popularity: null,
      original_language: null,
      genre_ids: null
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: [movieWithMissingFields]
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Minimal Movie')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Minimal Movie'));
    
    await waitFor(() => {
      expect(screen.getByText('概要が提供されていません。')).toBeInTheDocument();
      expect(screen.getByText('未定')).toBeInTheDocument();
      expect(screen.getAllByText('★ N/A')[0]).toBeInTheDocument();
      expect(screen.getByText('(0 票)')).toBeInTheDocument();
      expect(screen.getAllByText('N/A')[0]).toBeInTheDocument(); // 最初のN/Aを選択
    });
  });

  test('handles API response with unsuccessful status', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'API Error'
      }
    });

    await act(async () => {
      renderHome();
    });
    
    // Should not crash and should not show movie content
    await waitFor(() => {
      expect(screen.queryByText('Test Movie 1')).not.toBeInTheDocument();
    });
  });

  test('limits movies to first 8 results', async () => {
    const manyMovies = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Movie ${i + 1}`,
      poster_path: `/test${i + 1}.jpg`,
      release_date: '2023-01-01',
      overview: `Overview ${i + 1}`
    }));

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          results: manyMovies
        }
      }
    });

    await act(async () => {
      renderHome();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Movie 8')).toBeInTheDocument();
      expect(screen.queryByText('Movie 9')).not.toBeInTheDocument();
    });
  });
});