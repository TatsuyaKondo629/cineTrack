import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

// Mock the useAuth hook
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister
  })
}));

jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
};

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders register form with all required fields', () => {
    renderWithRouter();
    
    expect(screen.getByRole('heading', { name: '新規登録' })).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
    expect(screen.getByText('すでにアカウントをお持ちの方はこちら')).toBeInTheDocument();
  });

  test('updates form fields when user types', () => {
    renderWithRouter();
    
    const usernameInput = screen.getByLabelText('ユーザー名');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test('shows error when passwords do not match', async () => {
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });
    
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('shows error when password is too short', async () => {
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    });
    
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('calls register function with correct data on valid form submission', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    });
  });

  test('shows success message and navigates to login on successful registration', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByText('アカウントが作成されました。ログインページに移動します...')).toBeInTheDocument();
    });
    
    // Fast-forward the setTimeout
    jest.advanceTimersByTime(2000);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows error message on failed registration', async () => {
    mockRegister.mockResolvedValue({ success: false, message: 'ユーザー名が既に存在します' });
    
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByText('ユーザー名が既に存在します')).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows generic error message on registration exception', async () => {
    mockRegister.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByText('登録に失敗しました')).toBeInTheDocument();
    });
  });

  test('disables form fields and button during loading', async () => {
    // Mock register to simulate a slow response
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000)));
    
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    // Check that button shows loading text and form is disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '登録中...' })).toBeInTheDocument();
      expect(screen.getByLabelText('ユーザー名')).toBeDisabled();
      expect(screen.getByLabelText('メールアドレス')).toBeDisabled();
      expect(screen.getByLabelText('パスワード')).toBeDisabled();
      expect(screen.getByLabelText('パスワード（確認）')).toBeDisabled();
    });
  });

  test('clears error and success messages when form is resubmitted', async () => {
    mockRegister.mockResolvedValueOnce({ success: false, message: 'Error message' });
    
    renderWithRouter();
    
    // Fill form and submit to get error
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    // Mock successful response for second attempt
    mockRegister.mockResolvedValueOnce({ success: true });
    
    // Submit again
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    // Error message should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  test('prevents form submission when already loading', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000)));
    
    renderWithRouter();
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), { target: { value: 'password123' } });
    
    // Submit first time
    fireEvent.click(screen.getByRole('button', { name: '登録' }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '登録中...' })).toBeDisabled();
    });
    
    // Try to submit again while loading
    fireEvent.click(screen.getByRole('button', { name: '登録中...' }));
    
    // Should only call register once
    expect(mockRegister).toHaveBeenCalledTimes(1);
  });
});