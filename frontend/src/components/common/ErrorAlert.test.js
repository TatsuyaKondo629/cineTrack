import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorAlert from './ErrorAlert';

describe('ErrorAlert Component', () => {
  const mockError = {
    message: 'Test error message',
    response: {
      status: 400,
      statusText: 'Bad Request',
      data: { message: 'Server error message' }
    },
    config: {
      url: '/api/test',
      method: 'POST'
    }
  };

  test('renders nothing when no error or message provided', () => {
    const { container } = render(<ErrorAlert />);
    expect(container.firstChild).toBeNull();
  });

  test('renders error message', () => {
    render(<ErrorAlert message="Test error message" />);
    
    expect(screen.getByText('エラー')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('renders error object message', () => {
    const error = { message: 'Error from object' };
    render(<ErrorAlert error={error} />);
    
    expect(screen.getByText('Error from object')).toBeInTheDocument();
  });

  test('prefers explicit message over error object message', () => {
    const error = { message: 'Error from object' };
    render(<ErrorAlert error={error} message="Explicit message" />);
    
    expect(screen.getByText('Explicit message')).toBeInTheDocument();
    expect(screen.queryByText('Error from object')).not.toBeInTheDocument();
  });

  test('renders retry button when onRetry provided', () => {
    const onRetry = jest.fn();
    render(<ErrorAlert message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('再試行');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('renders close button when onClose provided', () => {
    const onClose = jest.fn();
    render(<ErrorAlert message="Test error" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: '閉じる' });
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('shows loading state for retry button', async () => {
    const onRetry = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<ErrorAlert message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('再試行');
    fireEvent.click(retryButton);
    
    expect(screen.getByText('実行中...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });
  });

  test('displays details when showDetails is true and error provided', () => {
    render(<ErrorAlert error={mockError} message="Test error" showDetails={true} />);
    
    const expandButton = screen.getByRole('button', { name: '詳細を表示' });
    expect(expandButton).toBeInTheDocument();
    
    fireEvent.click(expandButton);
    
    expect(screen.getByText('詳細情報:')).toBeInTheDocument();
    expect(screen.getByText(/ステータス: 400/)).toBeInTheDocument();
    expect(screen.getByText(/URL: \/api\/test/)).toBeInTheDocument();
    expect(screen.getByText(/メソッド: POST/)).toBeInTheDocument();
  });

  test('toggles detail expansion', async () => {
    render(<ErrorAlert error={mockError} message="Test error" showDetails={true} />);
    
    const expandButton = screen.getByRole('button', { name: '詳細を表示' });
    fireEvent.click(expandButton);
    
    expect(screen.getByText('詳細情報:')).toBeInTheDocument();
    
    const collapseButton = screen.getByRole('button', { name: '詳細を閉じる' });
    fireEvent.click(collapseButton);
    
    // Wait for collapse animation to complete
    await waitFor(() => {
      expect(screen.queryByText('詳細情報:')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('displays network error details when no response', () => {
    const networkError = {
      message: 'Network Error',
      code: 'ECONNABORTED'
    };
    
    render(<ErrorAlert error={networkError} message="Test error" showDetails={true} />);
    
    const expandButton = screen.getByRole('button', { name: '詳細を表示' });
    fireEvent.click(expandButton);
    
    expect(screen.getByText(/エラーコード: ECONNABORTED/)).toBeInTheDocument();
    expect(screen.getByText(/メッセージ: Network Error/)).toBeInTheDocument();
  });

  test('uses custom retry label', () => {
    const onRetry = jest.fn();
    render(<ErrorAlert message="Test error" onRetry={onRetry} retryLabel="もう一度試す" />);
    
    expect(screen.getByText('もう一度試す')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<ErrorAlert message="Test error" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('shows fallback message when error has no message', () => {
    render(<ErrorAlert error={{}} />);
    
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });
});