import { useState, useCallback } from 'react';
import { getErrorMessage, isRetryableError, getRetryDelay } from '../utils/errorHandler';

/**
 * API呼び出し用のカスタムフック
 * エラーハンドリング、リトライ機能、ローディング状態管理を提供
 */
const useApiCall = (options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    operation = 'default'
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * API呼び出しを実行
   * @param {Function} apiFunction - 実行するAPI関数
   * @param {...any} args - API関数に渡すパラメータ
   * @returns {Promise} API呼び出しの結果
   */
  const execute = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiFunction(...args);
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        lastError = err;
        
        // 最後の試行でない場合、リトライ可能かチェック
        if (attempt < maxRetries && isRetryableError(err)) {
          const delay = getRetryDelay(attempt, baseDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // リトライ不可能または最後の試行の場合は終了
        break;
      }
    }

    // すべての試行が失敗した場合
    const errorMessage = getErrorMessage(lastError, operation);
    setError({
      original: lastError,
      message: errorMessage,
      attempts: maxRetries + 1
    });
    setLoading(false);
    throw lastError;
  }, [maxRetries, baseDelay, operation]);

  /**
   * 手動でリトライを実行
   * @param {Function} apiFunction - 実行するAPI関数
   * @param {...any} args - API関数に渡すパラメータ
   */
  const retry = useCallback(async (apiFunction, ...args) => {
    return execute(apiFunction, ...args);
  }, [execute]);

  /**
   * 状態をリセット
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    retry,
    reset,
    clearError
  };
};

export default useApiCall;