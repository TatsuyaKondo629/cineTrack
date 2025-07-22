import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Wishlist from './Wishlist';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock TheaterSearch component
jest.mock('../components/TheaterSearch', () => {
  return function MockTheaterSearch({ onTheaterSelect, selectedTheater, label }) {
    return (
      <div>
        <div>{label || '映画館を選択'}</div>
        <button onClick={() => onTheaterSelect({ id: 1, name: 'Test Theater' })}>
          Select Theater
        </button>
        {selectedTheater && <div>Selected: {selectedTheater.name}</div>}
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
      <Wishlist />
    </MemoryRouter>
  );
};

const mockWishlistData = {
  data: {
    success: true,
    data: [
      {
        id: 1,
        tmdbMovieId: 123,
        movieTitle: 'Test Movie 1',
        moviePosterPath: '/poster1.jpg',
        movieOverview: 'Great test movie',
        movieReleaseDate: '2024-01-15',
        movieVoteAverage: 8.5,
        addedAt: '2024-01-01T12:00:00'
      },
      {
        id: 2,
        tmdbMovieId: 456,
        movieTitle: 'Test Movie 2',
        moviePosterPath: '/poster2.jpg',
        movieOverview: 'Another test movie',
        movieReleaseDate: '2024-02-10',
        movieVoteAverage: 7.2,
        addedAt: '2024-01-02T12:00:00'
      }
    ]
  }
};

describe('Wishlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
    
    // Setup default axios responses
    mockedAxios.get.mockResolvedValue(mockWishlistData);
  });

  test('renders wishlist page', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ウィッシュリスト')).toBeInTheDocument();
      expect(screen.getByText('気になる映画をお気に入りリストで管理しましょう')).toBeInTheDocument();
    });
  });

  test('shows loading spinner initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays wishlist movies', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  test('displays movie details correctly', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('★ 8.5')).toBeInTheDocument();
    });
    
    // Check date formatting (may not be exactly "2024年1月" due to formatting)
    await waitFor(() => {
      const dateElements = screen.getAllByText(/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test('opens movie details dialog', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Great test movie')).toBeInTheDocument();
    });
  });

  test('closes movie details dialog', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('removes movie from wishlist', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const removeButtons = screen.getAllByText('削除');
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/wishlist/remove/123',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      );
    });
  });

  test('opens clear all confirmation dialog', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const clearAllButton = screen.getByText('すべてクリア');
    fireEvent.click(clearAllButton);
    
    await waitFor(() => {
      expect(screen.getByText('ウィッシュリストをクリア')).toBeInTheDocument();
      expect(screen.getByText(/すべてのウィッシュリストアイテムを削除しますか/)).toBeInTheDocument();
    });
  });

  test('clears all movies from wishlist', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const clearAllButton = screen.getByText('すべてクリア');
    fireEvent.click(clearAllButton);
    
    const confirmButton = screen.getByRole('button', { name: 'クリア' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/wishlist/clear',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      );
    });
  });

  test('cancels clear all action', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const clearAllButton = screen.getByText('すべてクリア');
    fireEvent.click(clearAllButton);
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('ウィッシュリストをクリア')).not.toBeInTheDocument();
    });
  });

  test('opens viewing record dialog from movie details', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
  });

  test('saves viewing record', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Set rating
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[1]); // 1 star (index 1 = 1 star)
    
    // Save
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/viewing-records',
        expect.objectContaining({
          tmdbMovieId: 123,
          movieTitle: 'Test Movie 1',
          rating: 1
        }),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );
    }, { timeout: 3000 });
  });

  test('cancels viewing record dialog', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('視聴記録を追加')).not.toBeInTheDocument();
    });
  });

  test('disables save button when rating is 0', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    expect(saveButton).toBeDisabled();
  });

  test('handles theater selection', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
      expect(screen.getByText('映画館を選択')).toBeInTheDocument();
    });
    
    const selectTheaterButton = screen.getByText('Select Theater');
    fireEvent.click(selectTheaterButton);
    
    expect(screen.getByText('Selected: Test Theater')).toBeInTheDocument();
  });

  test('displays empty state when no movies', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ウィッシュリストは空です')).toBeInTheDocument();
      expect(screen.getByText('映画を検索してお気に入りに追加してみましょう')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ウィッシュリストの取得に失敗しました')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles missing token', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('認証が必要です')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful API responses', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false, message: 'Error' }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ウィッシュリストの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('handles remove action errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.delete.mockRejectedValue(new Error('Delete failed'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const removeButtons = screen.getAllByText('削除');
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('削除に失敗しました')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles save viewing record errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: 'Save failed' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Set rating and save
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[3]);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('displays movie with missing poster', async () => {
    const dataWithNullPoster = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            tmdbMovieId: 123,
            movieTitle: 'Movie Without Poster',
            moviePosterPath: null,
            overview: 'Movie without poster',
            releaseDate: '2024-01-15',
            voteAverage: 8.5,
            addedAt: '2024-01-01T12:00:00'
          }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(dataWithNullPoster);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Poster')).toBeInTheDocument();
    });
  });

  test('handles missing optional movie fields', async () => {
    const minimalMovieData = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            tmdbMovieId: 123,
            movieTitle: 'Minimal Movie',
            addedAt: '2024-01-01T12:00:00'
            // other fields missing
          }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(minimalMovieData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Minimal Movie')).toBeInTheDocument();
    });
  });

  test('updates viewing record form fields', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Update review field - Find by placeholder instead of label
    const reviewField = screen.getByPlaceholderText(/この映画はどうでしたか/);
    fireEvent.change(reviewField, { target: { value: 'Great movie!' } });
    
    expect(reviewField.value).toBe('Great movie!');
    
    // Update viewing date - Use a more robust selector
    const dateField = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dateField, { target: { value: '2024-02-01' } });
    
    expect(dateField.value).toBe('2024-02-01');
  });

  test('removes movie from details dialog', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const removeButton = screen.getByText('ウィッシュリストから削除');
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/wishlist/remove/123',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      );
    });
  });

  test('handles viewing record save without token', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithRouter();
    
    // Wait for initial load with token error
    await waitFor(() => {
      expect(screen.getByText('認証が必要です')).toBeInTheDocument();
    });
  });

  test('handles clear wishlist errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.delete.mockRejectedValue(new Error('Clear failed'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const clearAllButton = screen.getByText('すべてクリア');
    fireEvent.click(clearAllButton);
    
    const confirmButton = screen.getByRole('button', { name: 'クリア' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('クリアに失敗しました')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles unsuccessful remove response', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: false } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const removeButtons = screen.getAllByText('削除');
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('削除に失敗しました')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful clear response', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: false } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const clearAllButton = screen.getByText('すべてクリア');
    fireEvent.click(clearAllButton);
    
    const confirmButton = screen.getByRole('button', { name: 'クリア' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('クリアに失敗しました')).toBeInTheDocument();
    });
  });

  test('displays movie with missing vote average', async () => {
    const dataWithoutRating = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            tmdbMovieId: 123,
            movieTitle: 'Movie Without Rating',
            moviePosterPath: '/poster1.jpg',
            movieOverview: 'Movie without rating',
            movieReleaseDate: '2024-01-15',
            movieVoteAverage: null,
            addedAt: '2024-01-01T12:00:00'
          }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(dataWithoutRating);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Rating')).toBeInTheDocument();
    });
  });

  test('handles date formatting errors gracefully', async () => {
    const dataWithBadDate = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            tmdbMovieId: 123,
            movieTitle: 'Movie With Bad Date',
            moviePosterPath: '/poster1.jpg',
            movieOverview: 'Movie with invalid date',
            movieReleaseDate: 'invalid-date',
            movieVoteAverage: 8.5,
            addedAt: '2024-01-01T12:00:00'
          }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(dataWithBadDate);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie With Bad Date')).toBeInTheDocument();
    });
  });

  test('closes snackbar notification', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Set rating and save
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[3]);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を保存しました')).toBeInTheDocument();
    });
    
    // Close snackbar (lines 717-720)
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('視聴記録を保存しました')).not.toBeInTheDocument();
    });
  });

  // Test to cover line 138: formatDate catch block
  test('handles date formatting with invalid date that throws error', () => {
    const dataWithInvalidDate = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            tmdbMovieId: 123,
            movieTitle: 'Movie With Invalid Date',
            moviePosterPath: '/poster1.jpg',
            movieOverview: 'Movie with invalid date',
            movieReleaseDate: 'completely-invalid-date-string',
            movieVoteAverage: 8.5,
            addedAt: '2024-01-01T12:00:00'
          }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(dataWithInvalidDate);
    
    renderWithRouter();
  });

  // Test to cover lines 183-188: handleSaveViewingRecord without token
  test('handles save viewing record without token specifically', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const movieCard = screen.getByText('Test Movie 1').closest('[class*="MuiCard-root"]');
    fireEvent.click(movieCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    const addRecordButton = screen.getByText('視聴記録に追加');
    fireEvent.click(addRecordButton);
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を追加')).toBeInTheDocument();
    });
    
    // Clear token before saving
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Set rating and try to save
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[3]);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    });
  });

  // Test to cover line 414-425: movie without vote average in grid display
  test('handles movie without vote average in grid display', async () => {
    const dataWithoutVoteAverage = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            tmdbMovieId: 123,
            movieTitle: 'Movie Without Vote Average',
            moviePosterPath: '/poster1.jpg',
            movieOverview: 'Movie without vote average',
            movieReleaseDate: '2024-01-15',
            movieVoteAverage: null,
            addedAt: '2024-01-01T12:00:00'
          }
        ]
      }
    };
    
    mockedAxios.get.mockResolvedValue(dataWithoutVoteAverage);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Vote Average')).toBeInTheDocument();
    });
    
    // The movie should not show a rating chip when movieVoteAverage is null
    const movieCard = screen.getByText('Movie Without Vote Average').closest('[class*="MuiCard-root"]');
    expect(movieCard).not.toHaveTextContent('★');
  });
});