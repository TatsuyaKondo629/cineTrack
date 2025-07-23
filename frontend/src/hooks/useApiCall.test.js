import { renderHook, act } from '@testing-library/react';
import useApiCall from './useApiCall';

// Mock errorHandler utilities
jest.mock('../utils/errorHandler', () => ({
  getErrorMessage: jest.fn().mockReturnValue('Error message for test'),
  isRetryableError: jest.fn((error) => error.status >= 500),
  getRetryDelay: jest.fn((attempt) => attempt * 100)
}));

const mockApiFunction = jest.fn();

describe('useApiCall Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFunction.mockClear();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useApiCall());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  test('successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiFunction.mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useApiCall());
    
    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute(mockApiFunction, 'arg1', 'arg2');
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(mockData);
    expect(returnedData).toBe(mockData);
    expect(mockApiFunction).toHaveBeenCalledWith('arg1', 'arg2');
  });

  test('API call with error (non-retryable)', async () => {
    const mockError = { status: 400, message: 'Bad Request' };
    mockApiFunction.mockRejectedValue(mockError);
    
    const { getErrorMessage } = require('../utils/errorHandler');
    getErrorMessage.mockReturnValue('Error message for test');
    
    const { result } = renderHook(() => useApiCall({ operation: 'test' }));
    
    await act(async () => {
      try {
        await result.current.execute(mockApiFunction);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual({
      original: mockError,
      message: 'Error message for test',
      attempts: 4 // maxRetries + 1
    });
    expect(result.current.data).toBe(null);
    expect(mockApiFunction).toHaveBeenCalledTimes(1); // No retries for non-retryable error
  });

  test('API call with retryable error (eventually fails)', async () => {
    const mockError = { status: 500, message: 'Server Error' };
    mockApiFunction.mockRejectedValue(mockError);
    
    // Mock isRetryableError to return true for this error
    const { isRetryableError } = require('../utils/errorHandler');
    isRetryableError.mockReturnValue(true);
    
    const { result } = renderHook(() => useApiCall({ maxRetries: 2 }));
    
    await act(async () => {
      try {
        await result.current.execute(mockApiFunction);
      } catch (error) {
        // Expected to throw after retries
      }
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(mockApiFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  test('API call with retryable error (eventually succeeds)', async () => {
    const mockError = { status: 500, message: 'Server Error' };
    const mockData = { success: true };
    
    mockApiFunction
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(mockData);
    
    // Mock isRetryableError to return true for this error
    const { isRetryableError } = require('../utils/errorHandler');
    isRetryableError.mockReturnValue(true);
    
    const { result } = renderHook(() => useApiCall({ maxRetries: 3 }));
    
    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute(mockApiFunction);
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(mockData);
    expect(returnedData).toBe(mockData);
    expect(mockApiFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  test('reset function clears state', async () => {
    const mockData = { id: 1 };
    mockApiFunction.mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useApiCall());
    
    await act(async () => {
      await result.current.execute(mockApiFunction);
    });
    
    expect(result.current.data).toBe(mockData);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  test('clearError function clears only error', async () => {
    const mockError = { status: 400 };
    mockApiFunction.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApiCall());
    
    await act(async () => {
      try {
        await result.current.execute(mockApiFunction);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.error).toBeTruthy();
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false); // Other state unchanged
  });

  test('retry function calls execute again', async () => {
    const mockData = { id: 1 };
    mockApiFunction.mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useApiCall());
    
    await act(async () => {
      await result.current.retry(mockApiFunction, 'arg1');
    });
    
    expect(result.current.data).toBe(mockData);
    expect(mockApiFunction).toHaveBeenCalledWith('arg1');
  });

  test('loading state is true during execution', async () => {
    let resolvePromise;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockApiFunction.mockReturnValue(pendingPromise);
    
    const { result } = renderHook(() => useApiCall());
    
    act(() => {
      result.current.execute(mockApiFunction);
    });
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      resolvePromise({ data: 'test' });
      await pendingPromise;
    });
    
    expect(result.current.loading).toBe(false);
  });

  test('uses custom maxRetries option', async () => {
    const mockError = { status: 500 };
    mockApiFunction.mockRejectedValue(mockError);
    
    const { isRetryableError } = require('../utils/errorHandler');
    isRetryableError.mockReturnValue(true);
    
    const { result } = renderHook(() => useApiCall({ maxRetries: 1 }));
    
    await act(async () => {
      try {
        await result.current.execute(mockApiFunction);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(mockApiFunction).toHaveBeenCalledTimes(2); // Initial + 1 retry
  });

  test('uses custom operation for error messages', async () => {
    const mockError = { status: 400 };
    mockApiFunction.mockRejectedValue(mockError);
    
    const { getErrorMessage } = require('../utils/errorHandler');
    
    const { result } = renderHook(() => useApiCall({ operation: 'customOp' }));
    
    await act(async () => {
      try {
        await result.current.execute(mockApiFunction);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(getErrorMessage).toHaveBeenCalledWith(mockError, 'customOp');
  });
});