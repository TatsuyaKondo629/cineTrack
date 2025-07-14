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
    poster_path: '/test1.jpg',
    release_date: '2023-01-01',
    overview: 'This is a test movie'
  },
  {
    id: 2,
    title: 'Test Movie 2',
    poster_path: '/test2.jpg',
    release_date: '2023-02-01',
    overview: 'This is another test movie'
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
});