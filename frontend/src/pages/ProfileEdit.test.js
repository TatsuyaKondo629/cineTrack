import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ProfileEdit from './ProfileEdit';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockUserData = {
  data: {
    success: true,
    data: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      bio: 'Test bio',
      avatarUrl: 'https://example.com/avatar.jpg'
    }
  }
};

describe('ProfileEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    mockedAxios.get.mockResolvedValue(mockUserData);
    mockedAxios.put.mockResolvedValue({ data: { success: true, data: mockUserData.data.data } });
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders profile edit page', async () => {
    render(<ProfileEdit />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('プロフィール編集')).toBeInTheDocument();
    });
  });

  test('loads user profile on mount', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/profile',
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  test('displays user profile data', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/avatar.jpg')).toBeInTheDocument();
    });
  });

  test('handles input changes', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    expect(screen.getByDisplayValue('newusername')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: '' } });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー名は必須です')).toBeInTheDocument();
    });
  });

  test('validates email field', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
    
    const emailInput = screen.getByDisplayValue('test@example.com');
    fireEvent.change(emailInput, { target: { value: '' } });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('メールアドレスは必須です')).toBeInTheDocument();
    });
  });

  test('saves profile successfully', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/profile',
        {
          username: 'newusername',
          email: 'test@example.com',
          displayName: 'Test User',
          bio: 'Test bio',
          avatarUrl: 'https://example.com/avatar.jpg'
        },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  test('shows success message after save', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールを更新しました')).toBeInTheDocument();
    });
  });

  test('handles save error', async () => {
    mockedAxios.put.mockRejectedValue(new Error('Save failed'));
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールの更新中にエラーが発生しました')).toBeInTheDocument();
    });
  });

  test('handles 400 error response', async () => {
    mockedAxios.put.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'Invalid data' }
      }
    });
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful save response', async () => {
    mockedAxios.put.mockResolvedValue({
      data: { success: false, message: 'Update failed' }
    });
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  test('cancels changes', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);
    
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
  });

  test('opens password dialog', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    expect(screen.getByText('パスワード変更')).toBeInTheDocument();
    expect(screen.getByLabelText('現在のパスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード（確認）')).toBeInTheDocument();
  });

  test('closes password dialog', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('パスワード変更')).not.toBeInTheDocument();
  });

  test('validates password length', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    fireEvent.change(newPasswordInput, { target: { value: '123' } });
    
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    
    const settingsButton = screen.getByRole('button', { name: '設定' });
    fireEvent.click(settingsButton);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    });
  });

  test('validates password confirmation', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    
    const settingsButton = screen.getByRole('button', { name: '設定' });
    fireEvent.click(settingsButton);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('新しいパスワードと確認用パスワードが一致しません')).toBeInTheDocument();
    });
  });

  test('shows password confirmation error in dialog', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    
    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
  });

  test('toggles password visibility', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const currentPasswordInput = screen.getByLabelText('現在のパスワード');
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    
    const visibilityButtons = screen.getAllByTestId('VisibilityIcon');
    fireEvent.click(visibilityButtons[0]);
    
    expect(currentPasswordInput).toHaveAttribute('type', 'text');
  });

  test('toggles new password visibility', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    
    const visibilityButtons = screen.getAllByTestId('VisibilityIcon');
    fireEvent.click(visibilityButtons[1]);
    
    expect(newPasswordInput).toHaveAttribute('type', 'text');
  });

  test('sends password change data', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const currentPasswordInput = screen.getByLabelText('現在のパスワード');
    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    const settingsButton = screen.getByRole('button', { name: '設定' });
    fireEvent.click(settingsButton);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/profile',
        {
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          bio: 'Test bio',
          avatarUrl: 'https://example.com/avatar.jpg',
          newPassword: 'newpassword123',
          currentPassword: 'oldpassword'
        },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  test('clears password fields after save', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const currentPasswordInput = screen.getByLabelText('現在のパスワード');
    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    const settingsButton = screen.getByRole('button', { name: '設定' });
    fireEvent.click(settingsButton);
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールを更新しました')).toBeInTheDocument();
    });
    
    // Open password dialog again to check if fields are cleared
    const passwordButtonAgain = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButtonAgain);
    
    expect(screen.getByLabelText('現在のパスワード')).toHaveValue('');
    expect(screen.getByLabelText('新しいパスワード')).toHaveValue('');
    expect(screen.getByLabelText('新しいパスワード（確認）')).toHaveValue('');
  });

  test('navigates to users page after save', async () => {
    jest.useFakeTimers();
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールを更新しました')).toBeInTheDocument();
    });
    
    jest.advanceTimersByTime(2000);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users');
    
    jest.useRealTimers();
  });

  test('handles fetch error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Fetch failed'));
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールの取得中にエラーが発生しました')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful fetch response', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false, message: 'Fetch failed' }
    });
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful fetch response with default message', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false }
    });
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('displays avatar with display name initial', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User"
    });
  });

  test('displays avatar with username initial when no display name', async () => {
    const userWithoutDisplayName = {
      ...mockUserData,
      data: {
        ...mockUserData.data,
        data: {
          ...mockUserData.data.data,
          displayName: ''
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(userWithoutDisplayName);
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByText('t')).toBeInTheDocument(); // First letter of "testuser"
    });
  });

  test('closes error alert', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Fetch failed'));
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールの取得中にエラーが発生しました')).toBeInTheDocument();
    });
    
    const alertElement = screen.getByRole('alert');
    const closeButton = alertElement.querySelector('[data-testid="CloseIcon"]');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('プロフィールの取得中にエラーが発生しました')).not.toBeInTheDocument();
    });
  });

  test('closes success alert', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールを更新しました')).toBeInTheDocument();
    });
    
    const alertElement = screen.getByRole('alert');
    const closeButton = alertElement.querySelector('[data-testid="CloseIcon"]');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('プロフィールを更新しました')).not.toBeInTheDocument();
    });
  });

  test('disables save button during saving', async () => {
    let resolvePromise;
    const savePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockedAxios.put.mockReturnValue(savePromise);
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled();
    
    resolvePromise({ data: { success: true, data: mockUserData.data.data } });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '保存' })).not.toBeDisabled();
    });
  });

  test('password dialog settings button is disabled when fields are invalid', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const passwordButton = screen.getByRole('button', { name: 'パスワードを変更' });
    fireEvent.click(passwordButton);
    
    const settingsButton = screen.getByRole('button', { name: '設定' });
    expect(settingsButton).toBeDisabled();
    
    const currentPasswordInput = screen.getByLabelText('現在のパスワード');
    fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
    
    expect(settingsButton).toBeDisabled();
    
    const newPasswordInput = screen.getByLabelText('新しいパスワード');
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    
    expect(settingsButton).toBeDisabled();
    
    const confirmPasswordInput = screen.getByLabelText('新しいパスワード（確認）');
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    expect(settingsButton).not.toBeDisabled();
  });

  test('handles null values in user data', async () => {
    const userWithNullValues = {
      data: {
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: null,
          bio: null,
          avatarUrl: null
        }
      }
    };
    
    mockedAxios.get.mockResolvedValue(userWithNullValues);
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
    
    // Check that empty string fields are displayed properly
    const displayNameInput = screen.getByLabelText('表示名');
    expect(displayNameInput).toHaveValue('');
    
    const bioInput = screen.getByLabelText('プロフィール');
    expect(bioInput).toHaveValue('');
    
    const avatarUrlInput = screen.getByLabelText('アバター画像URL');
    expect(avatarUrlInput).toHaveValue('');
  });

  test('saves profile with null values', async () => {
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const displayNameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(displayNameInput, { target: { value: '' } });
    
    const bioInput = screen.getByDisplayValue('Test bio');
    fireEvent.change(bioInput, { target: { value: '' } });
    
    const avatarUrlInput = screen.getByDisplayValue('https://example.com/avatar.jpg');
    fireEvent.change(avatarUrlInput, { target: { value: '' } });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/profile',
        {
          username: 'testuser',
          email: 'test@example.com',
          displayName: null,
          bio: null,
          avatarUrl: null
        },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  test('handles 400 error response without message', async () => {
    mockedAxios.put.mockRejectedValue({
      response: {
        status: 400,
        data: {}
      }
    });
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールの更新に失敗しました')).toBeInTheDocument();
    });
  });

  test('handles unsuccessful save response without message', async () => {
    mockedAxios.put.mockResolvedValue({
      data: { success: false }
    });
    
    render(<ProfileEdit />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: '保存' });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('プロフィールの更新に失敗しました')).toBeInTheDocument();
    });
  });
});