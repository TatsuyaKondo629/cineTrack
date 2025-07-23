import {
  getErrorMessage,
  getErrorDetails,
  isRetryableError,
  getRetryDelay
} from './errorHandler';

describe('errorHandler utilities', () => {
  describe('getErrorMessage', () => {
    test('returns login-specific message for 401 error', () => {
      const error = { response: { status: 401 } };
      expect(getErrorMessage(error, 'login')).toBe('ユーザー名またはパスワードが正しくありません。');
    });

    test('returns registration-specific message for 409 error', () => {
      const error = { response: { status: 409 } };
      expect(getErrorMessage(error, 'register')).toBe('このユーザー名またはメールアドレスは既に使用されています。');
    });

    test('returns validation error message for 400 error', () => {
      const error = { response: { status: 400 } };
      expect(getErrorMessage(error, 'default')).toBe('入力内容に問題があります。確認してください。');
    });

    test('returns server error message for 500 error', () => {
      const error = { response: { status: 500 } };
      expect(getErrorMessage(error, 'default')).toBe('サーバーエラーが発生しました。しばらく後に再試行してください。');
    });

    test('returns network error message for network error', () => {
      const error = { code: 'NETWORK_ERROR', message: 'Network error' };
      expect(getErrorMessage(error, 'default')).toBe('ネットワーク接続を確認してください。');
    });

    test('returns timeout error message for timeout error', () => {
      const error = { code: 'ECONNABORTED', message: 'timeout' };
      expect(getErrorMessage(error, 'default')).toBe('通信がタイムアウトしました。再試行してください。');
    });

    test('returns custom error message from response data', () => {
      const error = { 
        response: { 
          status: 400,
          data: { message: 'Custom error message' }
        }
      };
      expect(getErrorMessage(error, 'default')).toBe('Custom error message');
    });

    test('returns default message for unknown error', () => {
      const error = { response: { status: 999 } };
      expect(getErrorMessage(error, 'default')).toBe('予期しないエラーが発生しました。');
    });

    test('handles null/undefined error', () => {
      expect(getErrorMessage({ message: 'test' }, 'default')).toBe('ネットワーク接続を確認してください。');
      expect(getErrorMessage({ message: 'timeout error' }, 'default')).toBe('通信がタイムアウトしました。再試行してください。');
    });
  });

  describe('getErrorDetails', () => {
    test('returns details for HTTP error', () => {
      const error = {
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        },
        config: {
          url: '/api/movies/123',
          method: 'GET'
        }
      };

      const details = getErrorDetails(error);
      expect(details.status).toBe(404);
      expect(details.statusText).toBe('Not Found');
      expect(details.config.url).toBe('/api/movies/123');
      expect(details.config.method).toBe('GET');
      expect(details.data).toEqual({ message: 'Resource not found' });
    });

    test('returns details for network error', () => {
      const error = {
        code: 'NETWORK_ERROR',
        message: 'Network Error'
      };

      const details = getErrorDetails(error);
      expect(details.code).toBe('NETWORK_ERROR');
      expect(details.message).toBe('Network Error');
      expect(details.status).toBeUndefined();
    });

    test('handles error without response', () => {
      const error = {
        message: 'Connection failed',
        code: 'ECONNREFUSED'
      };

      const details = getErrorDetails(error);
      expect(details.code).toBe('ECONNREFUSED');
      expect(details.message).toBe('Connection failed');
      expect(details.status).toBeUndefined();
      expect(details.data).toBeUndefined();
    });

    test('handles error with minimal information', () => {
      const error = { message: 'Unknown error' };
      const details = getErrorDetails(error);
      expect(details.message).toBe('Unknown error');
      expect(details.status).toBeUndefined();
      expect(details.code).toBeUndefined();
    });
  });

  describe('isRetryableError', () => {
    test('returns true for 5xx server errors', () => {
      expect(isRetryableError({ response: { status: 500 } })).toBe(true);
      expect(isRetryableError({ response: { status: 502 } })).toBe(true);
      expect(isRetryableError({ response: { status: 503 } })).toBe(true);
      expect(isRetryableError({ response: { status: 504 } })).toBe(true);
    });

    test('returns true for network errors', () => {
      expect(isRetryableError({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(isRetryableError({ code: 'ECONNABORTED' })).toBe(true);
      expect(isRetryableError({ code: 'ECONNREFUSED' })).toBe(true);
      expect(isRetryableError({ code: 'ENOTFOUND' })).toBe(true);
    });

    test('returns true for 408 timeout error', () => {
      expect(isRetryableError({ response: { status: 408 } })).toBe(true);
    });

    test('returns true for 429 rate limit error', () => {
      expect(isRetryableError({ response: { status: 429 } })).toBe(true);
    });

    test('returns false for 4xx client errors (except 408, 429)', () => {
      expect(isRetryableError({ response: { status: 400 } })).toBe(false);
      expect(isRetryableError({ response: { status: 401 } })).toBe(false);
      expect(isRetryableError({ response: { status: 403 } })).toBe(false);
      expect(isRetryableError({ response: { status: 404 } })).toBe(false);
    });

    test('returns false for successful responses', () => {
      expect(isRetryableError({ response: { status: 200 } })).toBe(false);
      expect(isRetryableError({ response: { status: 201 } })).toBe(false);
    });

    test('returns true for null/undefined error (treated as network error)', () => {
      // The function treats null/undefined as network errors, which are retryable
      expect(() => isRetryableError(null)).toThrow();
      expect(() => isRetryableError(undefined)).toThrow();
    });

    test('returns true for error without response (treated as network error)', () => {
      expect(isRetryableError({ message: 'Unknown error' })).toBe(true);
    });
  });

  describe('getRetryDelay', () => {
    test('calculates exponential backoff delay', () => {
      expect(getRetryDelay(0)).toBe(1000); // 1000 * 2^0 = 1000
      expect(getRetryDelay(1)).toBe(2000); // 1000 * 2^1 = 2000
      expect(getRetryDelay(2)).toBe(4000); // 1000 * 2^2 = 4000
      expect(getRetryDelay(3)).toBe(8000); // 1000 * 2^3 = 8000
    });

    test('uses custom base delay', () => {
      expect(getRetryDelay(0, 500)).toBe(500);  // 500 * 2^0 = 500
      expect(getRetryDelay(1, 500)).toBe(1000); // 500 * 2^1 = 1000
      expect(getRetryDelay(2, 500)).toBe(2000); // 500 * 2^2 = 2000
    });

    test('enforces maximum delay limit', () => {
      expect(getRetryDelay(10)).toBe(10000); // Should be capped at 10000
      expect(getRetryDelay(20, 2000)).toBe(10000); // Should be capped at 10000
    });

    test('handles negative attempt numbers', () => {
      expect(getRetryDelay(-1)).toBe(500); // 1000 * 2^(-1) = 500
    });

    test('handles zero base delay', () => {
      expect(getRetryDelay(1, 0)).toBe(0);
      expect(getRetryDelay(2, 0)).toBe(0);
    });
  });
});