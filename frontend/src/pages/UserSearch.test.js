import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import UserSearch from './UserSearch';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = () => {
  return render(<UserSearch />);
};

const mockUsersData = {
  data: {
    success: true,
    data: {
      content: [
        {
          id: 1,
          username: 'testuser1',
          displayName: 'Test User 1',
          followerCount: 5,
          totalMovieCount: 10,
          averageRating: 4.2,
          isFollowing: false,
          isMutualFollow: false
        },
        {
          id: 2,
          username: 'testuser2',
          displayName: 'Test User 2',
          followerCount: 3,
          totalMovieCount: 8,
          averageRating: 3.8,
          isFollowing: true,
          isMutualFollow: true
        },
        {
          id: 3,
          username: 'testuser3',
          displayName: null,
          followerCount: 0,
          totalMovieCount: 0,
          averageRating: null,
          isFollowing: false,
          isMutualFollow: false
        }
      ],
      totalPages: 2,
      totalElements: 15
    }
  }
};

const mockEmptyUsersData = {
  data: {
    success: true,
    data: {
      content: [],
      totalPages: 0,
      totalElements: 0
    }
  }
};

describe('UserSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    mockedAxios.get.mockResolvedValue(mockUsersData);
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders user search page', async () => {
    renderWithRouter();
    
    expect(screen.getByText('ユーザー検索')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ユーザー名で検索...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
  });

  test('loads users on mount', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/search',
        {
          headers: { Authorization: 'Bearer test-token' },
          params: { page: 0, size: 12 }
        }
      );
    });
  });

  test('displays users correctly', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('@testuser1')).toBeInTheDocument();
      expect(screen.getByText('5 フォロワー')).toBeInTheDocument();
      expect(screen.getByText('10 映画')).toBeInTheDocument();
      expect(screen.getByText('★4.2')).toBeInTheDocument();
    });
  });

  test('displays user without display name', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser3')).toBeInTheDocument();
      expect(screen.getByText('@testuser3')).toBeInTheDocument();
      expect(screen.getByText('0 フォロワー')).toBeInTheDocument();
      expect(screen.getByText('0 映画')).toBeInTheDocument();
    });
  });

  test('displays user without average rating', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('testuser3')).toBeInTheDocument();
      expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    });
  });

  test('displays mutual follow chip', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('相互フォロー')).toBeInTheDocument();
    });
  });

  test('performs search with query', async () => {
    renderWithRouter();
    
    const searchInput = screen.getByPlaceholderText('ユーザー名で検索...');
    const searchButton = screen.getByRole('button', { name: '検索' });
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/search',
        {
          headers: { Authorization: 'Bearer test-token' },
          params: { page: 0, size: 12, query: 'test' }
        }
      );
    });
  });

  test('performs search on form submit', async () => {
    renderWithRouter();
    
    const searchInput = screen.getByPlaceholderText('ユーザー名で検索...');
    const form = screen.getByRole('textbox').closest('form');
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/search',
        {
          headers: { Authorization: 'Bearer test-token' },
          params: { page: 0, size: 12, query: 'test' }
        }
      );
    });
  });

  test('handles empty search query', async () => {
    renderWithRouter();
    
    const searchInput = screen.getByPlaceholderText('ユーザー名で検索...');
    const searchButton = screen.getByRole('button', { name: '検索' });
    
    fireEvent.change(searchInput, { target: { value: '   ' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/search',
        {
          headers: { Authorization: 'Bearer test-token' },
          params: { page: 0, size: 12 }
        }
      );
    });
  });

  test('follows user successfully', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    const followButtons = screen.getAllByRole('button', { name: /フォロー/ });
    const followButton = followButtons.find(btn => btn.getAttribute('aria-label') === 'フォロー');
    
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/1/follow',
        undefined,
        {
          headers: { Authorization: 'Bearer test-token' }
        }
      );
    });
  });

  test('unfollows user successfully', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });
    
    const unfollowButtons = screen.getAllByRole('button', { name: /フォロー解除/ });
    const unfollowButton = unfollowButtons[0];
    
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/2/follow',
        {
          headers: { Authorization: 'Bearer test-token' }
        }
      );
    });
  });

  test('updates user state after follow', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    const followButtons = screen.getAllByRole('button', { name: /フォロー/ });
    const followButton = followButtons.find(btn => btn.getAttribute('aria-label') === 'フォロー');
    
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(screen.getByText('6 フォロワー')).toBeInTheDocument();
    });
  });

  test('updates user state after unfollow', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });
    
    const unfollowButtons = screen.getAllByRole('button', { name: /フォロー解除/ });
    const unfollowButton = unfollowButtons[0];
    
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(screen.getByText('2 フォロワー')).toBeInTheDocument();
    });
  });

  test('navigates to user profile on card click', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    const userCard = screen.getByText('Test User 1').closest('.MuiCard-root');
    fireEvent.click(userCard);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users/1');
  });

  test('prevents navigation when follow button is clicked', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    const followButtons = screen.getAllByRole('button', { name: /フォロー/ });
    const followButton = followButtons.find(btn => btn.getAttribute('aria-label') === 'フォロー');
    
    fireEvent.click(followButton);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('displays total elements count', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('15人のユーザーが見つかりました')).toBeInTheDocument();
    });
  });

  test('displays no users found message', async () => {
    mockedAxios.get.mockResolvedValue(mockEmptyUsersData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ユーザーが見つかりませんでした')).toBeInTheDocument();
    });
  });

  test('displays pagination when multiple pages exist', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  test('handles pagination page change', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
    
    const page2Button = screen.getByLabelText('Go to page 2');
    fireEvent.click(page2Button);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/search',
        {
          headers: { Authorization: 'Bearer test-token' },
          params: { page: 1, size: 12 }
        }
      );
    });
  });

  test('does not display pagination with single page', async () => {
    const singlePageData = {
      ...mockUsersData,
      data: {
        ...mockUsersData.data,
        data: {
          ...mockUsersData.data.data,
          totalPages: 1
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(singlePageData);
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('displays loading state', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByText('検索中...')).toBeInTheDocument();
  });

  test('handles API error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー検索中にエラーが発生しました')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful API response', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false, message: 'Search failed' }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful API response with default message', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー検索に失敗しました')).toBeInTheDocument();
    });
  });

  test('handles follow API error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Follow failed'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    const followButtons = screen.getAllByRole('button', { name: /フォロー/ });
    const followButton = followButtons.find(btn => btn.getAttribute('aria-label') === 'フォロー');
    
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(screen.getByText('フォローに失敗しました')).toBeInTheDocument();
    });
  });

  test('handles unfollow API error', async () => {
    mockedAxios.delete.mockRejectedValue(new Error('Unfollow failed'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });
    
    const unfollowButtons = screen.getAllByRole('button', { name: /フォロー解除/ });
    const unfollowButton = unfollowButtons[0];
    
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(screen.getByText('フォロー解除に失敗しました')).toBeInTheDocument();
    });
  });

  test('closes error alert', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー検索中にエラーが発生しました')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('ユーザー検索中にエラーが発生しました')).not.toBeInTheDocument();
  });

  test('displays user avatar with first letter', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User 1"
    });
  });

  test('displays user avatar with username first letter when no display name', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "testuser3"
    });
  });

  test('resets to page 1 when performing new search', async () => {
    renderWithRouter();
    
    // First load page 2
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
    
    const page2Button = screen.getByLabelText('Go to page 2');
    fireEvent.click(page2Button);
    
    // Then perform new search
    const searchInput = screen.getByPlaceholderText('ユーザー名で検索...');
    const searchButton = screen.getByRole('button', { name: '検索' });
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/social/users/search',
        {
          headers: { Authorization: 'Bearer test-token' },
          params: { page: 0, size: 12, query: 'test' }
        }
      );
    });
  });

  test('handles axios method configuration correctly', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
    
    const followButtons = screen.getAllByRole('button', { name: /フォロー/ });
    const followButton = followButtons.find(btn => btn.getAttribute('aria-label') === 'フォロー');
    
    fireEvent.click(followButton);
    
    await waitFor(() => {
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        url: 'http://localhost:8080/api/social/users/1/follow',
        headers: { Authorization: 'Bearer test-token' }
      });
    });
  });

  test('handles axios method configuration for unfollow', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });
    
    const unfollowButtons = screen.getAllByRole('button', { name: /フォロー解除/ });
    const unfollowButton = unfollowButtons[0];
    
    fireEvent.click(unfollowButton);
    
    await waitFor(() => {
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'delete',
        url: 'http://localhost:8080/api/social/users/2/follow',
        headers: { Authorization: 'Bearer test-token' }
      });
    });
  });
});