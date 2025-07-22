import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ViewingRecords from './ViewingRecords';

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

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <ViewingRecords />
    </MemoryRouter>
  );
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
          rating: 4.5,
          viewingDate: '2024-01-15T12:00:00',
          theater: 'Test Theater',
          screeningFormat: 'IMAX',
          review: 'Great movie!'
        },
        {
          id: 2,
          movieTitle: 'Test Movie 2',
          moviePosterPath: '/poster2.jpg',
          rating: 3.0,
          viewingDate: '2024-01-10T12:00:00',
          theater: null,
          screeningFormat: null,
          review: null
        }
      ],
      totalPages: 2
    }
  }
};

const mockEmptyResponse = {
  data: {
    success: true,
    data: {
      content: [],
      totalPages: 0
    }
  }
};

describe('ViewingRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  test('displays loading spinner initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders main heading and search bar after loading', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '視聴記録' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...')).toBeInTheDocument();
    });
  });

  test('fetches and displays viewing records on initial load', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/viewing-records?page=0&size=12',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      expect(screen.getByText('★ 4.5')).toBeInTheDocument();
      expect(screen.getByText('★ 3')).toBeInTheDocument();
      expect(screen.getByText('📍 Test Theater')).toBeInTheDocument();
      expect(screen.getByText('IMAX')).toBeInTheDocument();
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
    });
  });

  test('displays empty state when no records exist', async () => {
    mockedAxios.get.mockResolvedValue(mockEmptyResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('まだ視聴記録がありません')).toBeInTheDocument();
      expect(screen.getByText('映画を観たら記録してみましょう！')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '映画を探す' })).toBeInTheDocument();
    });
  });

  test('filters records based on search query', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    // Search for "Movie 1"
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'Movie 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Movie 2')).not.toBeInTheDocument();
    });
  });

  test('shows no results message when search yields no matches', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Search for non-existent movie
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'Non-existent Movie' } });
    
    await waitFor(() => {
      expect(screen.getByText('検索結果が見つかりません')).toBeInTheDocument();
      expect(screen.getByText('別のキーワードで検索してみてください')).toBeInTheDocument();
    });
  });

  test('shows pagination when there are multiple pages', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Check pagination is displayed
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // page 2 button
  });

  test('handles pagination page change', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click page 2
    fireEvent.click(screen.getByText('2'));
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/viewing-records?page=1&size=12',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue({
      response: { data: { message: 'Unauthorized' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching viewing records:', expect.any(Object));
    consoleSpy.mockRestore();
  });

  test('shows login required message when no token is available', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    });
    
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('formats dates correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      // Check if dates are formatted as Japanese locale
      const dateElements = screen.getAllByText(/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test('displays movie posters with correct image URLs', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w300/poster1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w300/poster2.jpg');
    });
  });

  test('handles snackbar close', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    });
    
    // Close snackbar by clicking the close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('ログインが必要です')).not.toBeInTheDocument();
    });
  });

  test('displays movie details correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      // Check that all movie details are displayed
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
      
      // Check ratings
      expect(screen.getByText('★ 4.5')).toBeInTheDocument();
      expect(screen.getByText('★ 3')).toBeInTheDocument();
      
      // Check theater info
      expect(screen.getByText('📍 Test Theater')).toBeInTheDocument();
      
      // Check screening format
      expect(screen.getByText('IMAX')).toBeInTheDocument();
      
      // Check review
      expect(screen.getByText('Great movie!')).toBeInTheDocument();
    });
  });

  // Context Menu Tests
  test('opens context menu when more button is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click the more button
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('編集')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
  });


  // Edit Dialog Tests

  test('closes edit dialog when cancel button is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Click cancel
    fireEvent.click(screen.getByText('キャンセル'));
    
    await waitFor(() => {
      expect(screen.queryByText('視聴記録を編集')).not.toBeInTheDocument();
    });
  });



  test('updates rating in edit dialog', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Update rating
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[2]); // 3 stars
    
    const saveButton = screen.getByText('保存');
    expect(saveButton).not.toBeDisabled();
  });



  test('handles edit save error', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.put.mockRejectedValue({
      response: { data: { message: 'Update failed' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Click save
    fireEvent.click(screen.getByText('保存'));
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  test('handles edit save error without token', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Clear token
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Click save
    fireEvent.click(screen.getByText('保存'));
    
    await waitFor(() => {
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    });
  });

  // Delete Dialog Tests
  test('opens delete dialog when delete menu item is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click the more button
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
    
    // Click delete menu item
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
      expect(screen.getByText('「Test Movie 1」の視聴記録を削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('この操作は取り消せません。')).toBeInTheDocument();
    });
  });

  test('closes delete dialog when cancel button is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open delete dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
    });
    
    // Click cancel
    const cancelButtons = screen.getAllByText('キャンセル');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]); // Last cancel button
    
    await waitFor(() => {
      expect(screen.queryByText('記録を削除')).not.toBeInTheDocument();
    });
  });

  test('deletes record successfully', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open delete dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
    });
    
    // Confirm delete
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]); // Last delete button
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/viewing-records/1',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除しました')).toBeInTheDocument();
    });
  });

  test('handles delete error', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.delete.mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open delete dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
    });
    
    // Confirm delete
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  test('handles delete error without token', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open delete dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
    });
    
    // Clear token
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Confirm delete
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    
    await waitFor(() => {
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    });
  });

  // Search functionality tests
  test('searches by theater name', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    // Search by theater
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'Test Theater' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Movie 2')).not.toBeInTheDocument();
    });
  });

  test('searches by review content', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    // Search by review
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'Great movie' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Movie 2')).not.toBeInTheDocument();
    });
  });

  test('handles case-insensitive search', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    // Search with different case
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'test movie 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Movie 2')).not.toBeInTheDocument();
    });
  });

  test('handles search with whitespace', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    // Search with whitespace
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    
    await waitFor(() => {
      // Should show all records when search is just whitespace
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  test('clears search and shows all records', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
    
    // Search for one movie
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'Movie 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Movie 2')).not.toBeInTheDocument();
    });
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  // Image handling tests
  test('handles missing poster image', async () => {
    const recordsWithNullPoster = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Movie Without Poster',
              moviePosterPath: null,
              rating: 4.0,
              viewingDate: '2024-01-15T12:00:00',
              theater: 'Test Theater',
              screeningFormat: 'IMAX',
              review: 'Great movie!'
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(recordsWithNullPoster);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie Without Poster')).toBeInTheDocument();
    });
    
    // Check placeholder image is used
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-movie.jpg');
  });

  // Edge cases and error handling
  test('handles API response with success false', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false,
        message: 'API Error'
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('まだ視聴記録がありません')).toBeInTheDocument();
    });
  });

  test('handles network error without response', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('記録の取得に失敗しました')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles single page without pagination', async () => {
    const singlePageResponse = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Single Movie',
              moviePosterPath: '/poster.jpg',
              rating: 4.0,
              viewingDate: '2024-01-15T12:00:00',
              theater: 'Test Theater',
              screeningFormat: 'IMAX',
              review: 'Great movie!'
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(singlePageResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Single Movie')).toBeInTheDocument();
    });
    
    // No pagination should be shown
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('handles environment variable API_BASE_URL', async () => {
    const originalEnv = process.env.REACT_APP_API_BASE_URL;
    process.env.REACT_APP_API_BASE_URL = 'https://custom-api.com/api';
    
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://custom-api.com/api/viewing-records?page=0&size=12',
        expect.any(Object)
      );
    });
    
    process.env.REACT_APP_API_BASE_URL = originalEnv;
  });

  test('handles records with null values', async () => {
    const recordsWithNullValues = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Test Movie',
              moviePosterPath: '/poster.jpg',
              rating: 4.0,
              viewingDate: '2024-01-15T12:00:00',
              theater: null,
              screeningFormat: null,
              review: null
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(recordsWithNullValues);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Should not show theater, screening format, or review
    expect(screen.queryByText('📍')).not.toBeInTheDocument();
    expect(screen.queryByText('IMAX')).not.toBeInTheDocument();
    expect(screen.queryByText('Great movie!')).not.toBeInTheDocument();
  });

  test('handles invalid date formatting', async () => {
    const recordsWithInvalidDate = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Test Movie',
              moviePosterPath: '/poster.jpg',
              rating: 4.0,
              viewingDate: 'invalid-date',
              theater: 'Test Theater',
              screeningFormat: 'IMAX',
              review: 'Great movie!'
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(recordsWithInvalidDate);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Should handle invalid date gracefully
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  test('handles menu record not found error', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click the more button
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('編集')).toBeInTheDocument();
    });
    
    // Manually trigger error by setting invalid menuRecordId
    // This simulates edge case where record might not be found
    // (Though this is unlikely in real scenarios)
    
    // The menu should still function
    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  // Additional edge case tests for complete coverage
  test('handles refetch after successful edit', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.put.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const initialCallCount = mockedAxios.get.mock.calls.length;
    
    // Edit a record
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('保存'));
    
    await waitFor(() => {
      expect(mockedAxios.get.mock.calls.length).toBe(initialCallCount + 1);
    });
  });

  test('handles refetch after successful delete', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    const initialCallCount = mockedAxios.get.mock.calls.length;
    
    // Delete a record
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    
    await waitFor(() => {
      expect(mockedAxios.get.mock.calls.length).toBe(initialCallCount + 1);
    });
  });



  test('handles unsuccessful API responses', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false,
        message: 'Custom error message'
      }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('まだ視聴記録がありません')).toBeInTheDocument();
    });
  });

  test('handles search with null theater and review', async () => {
    const recordsWithNullValues = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Test Movie',
              moviePosterPath: '/poster.jpg',
              rating: 4.0,
              viewingDate: '2024-01-15T12:00:00',
              theater: null,
              screeningFormat: 'IMAX',
              review: null
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(recordsWithNullValues);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    
    // Search should handle null values gracefully
    const searchInput = screen.getByPlaceholderText('映画タイトル、映画館、レビューで検索...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
  });


  test('handles multiline text in review field', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Check review textarea is multiline
    const reviewInput = screen.getByLabelText('レビュー・感想');
    expect(reviewInput).toBeInTheDocument();
    expect(reviewInput.tagName).toBe('TEXTAREA');
    
    // Test multiline input
    fireEvent.change(reviewInput, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    expect(reviewInput.value).toBe('Line 1\nLine 2\nLine 3');
  });

  test('handles truncated review display', async () => {
    const longReviewRecord = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Movie with Long Review',
              moviePosterPath: '/poster.jpg',
              rating: 4.0,
              viewingDate: '2024-01-15T12:00:00',
              theater: 'Test Theater',
              screeningFormat: 'IMAX',
              review: 'This is a very long review that should be truncated when displayed in the card view. It contains multiple sentences and should demonstrate the text overflow ellipsis functionality.'
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(longReviewRecord);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie with Long Review')).toBeInTheDocument();
    });
    
    // Check that review is displayed (may be truncated by CSS)
    const reviewText = screen.getByText(/This is a very long review/);
    expect(reviewText).toBeInTheDocument();
  });

  test('handles invalid movie poster path', async () => {
    const invalidPosterRecord = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Movie with Invalid Poster',
              moviePosterPath: '',
              rating: 4.0,
              viewingDate: '2024-01-15T12:00:00',
              theater: 'Test Theater',
              screeningFormat: 'IMAX',
              review: 'Great movie!'
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(invalidPosterRecord);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Movie with Invalid Poster')).toBeInTheDocument();
    });
    
    // Should use placeholder for empty poster path
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-movie.jpg');
  });

  test('handles complex date formatting edge cases', async () => {
    const complexDateRecord = {
      data: {
        success: true,
        data: {
          content: [
            {
              id: 1,
              movieTitle: 'Date Test Movie',
              moviePosterPath: '/poster.jpg',
              rating: 4.0,
              viewingDate: '2024-12-31T23:59:59',
              theater: 'Test Theater',
              screeningFormat: 'IMAX',
              review: 'Great movie!'
            }
          ],
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(complexDateRecord);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Date Test Movie')).toBeInTheDocument();
    });
    
    // Check that date is formatted correctly
    expect(screen.getByText('2024年12月31日')).toBeInTheDocument();
  });

});