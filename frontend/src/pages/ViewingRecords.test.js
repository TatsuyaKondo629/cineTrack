import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ViewingRecords from './ViewingRecords';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => mockNavigate
}));

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
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }
        }
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

  test('opens context menu when more button is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Click the first more button (MoreVert icon button)
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => button.querySelector('svg[data-testid="MoreVertIcon"]'));
    fireEvent.click(moreButton || moreButtons[moreButtons.length - 1]);
    
    await waitFor(() => {
      expect(screen.getByText('編集')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
  });

  test('opens edit dialog when edit menu item is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open context menu and click edit
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('編集')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4.5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Theater')).toBeInTheDocument();
    });
  });

  test('opens delete confirmation dialog when delete menu item is clicked', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open context menu and click delete
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
      expect(screen.getByText('「Test Movie 1」の視聴記録を削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('この操作は取り消せません。')).toBeInTheDocument();
    });
  });

  test('saves edited record successfully', async () => {
    const updateResponse = { data: { success: true } };
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.put.mockResolvedValue(updateResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Modify theater field
    const theaterInput = screen.getByDisplayValue('Test Theater');
    fireEvent.change(theaterInput, { target: { value: 'Updated Theater' } });
    
    // Save changes
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/viewing-records/1',
        expect.objectContaining({
          theater: 'Updated Theater'
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
      expect(screen.getByText('記録を更新しました')).toBeInTheDocument();
    });
  });

  test('deletes record successfully', async () => {
    const deleteResponse = { data: { success: true } };
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.delete.mockResolvedValue(deleteResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open delete dialog
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByText('記録を削除')).toBeInTheDocument();
    });
    
    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: '削除' }));
    
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

  test('disables save button when rating is 0 in edit dialog', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByText('視聴記録を編集')).toBeInTheDocument();
    });
    
    // Set rating to 0
    const ratingStars = screen.getAllByRole('radio');
    fireEvent.click(ratingStars[0]); // 0 stars
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    });
  });

  test('handles edit errors gracefully', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.put.mockRejectedValue({
      response: { data: { message: 'Update failed' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open edit dialog and save
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('編集'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  test('handles delete errors gracefully', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    mockedAxios.delete.mockRejectedValue({
      response: { data: { message: 'Delete failed' } }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });
    
    // Open delete dialog and confirm
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    fireEvent.click(screen.getByText('削除'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: '削除' }));
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  test('formats dates correctly', async () => {
    mockedAxios.get.mockResolvedValue(mockRecordsResponse);
    
    renderWithRouter();
    
    await waitFor(() => {
      // Check if dates are formatted as Japanese locale
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });
});