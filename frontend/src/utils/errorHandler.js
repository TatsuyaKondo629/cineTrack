/**
 * エラーハンドリングユーティリティ
 * APIエラーレスポンスから適切なメッセージを抽出し、ユーザーフレンドリーなメッセージを提供
 */

// エラーコードとメッセージのマッピング
const ERROR_MESSAGES = {
  // 認証関連
  401: 'ログインが必要です。再度ログインしてください。',
  403: 'この操作を実行する権限がありません。',
  
  // リクエスト関連
  400: '入力内容に問題があります。確認してください。',
  404: '要求されたデータが見つかりません。',
  409: 'データが重複しています。',
  422: '入力データの形式が正しくありません。',
  
  // サーバー関連
  500: 'サーバーエラーが発生しました。しばらく後に再試行してください。',
  502: 'サーバーに接続できません。',
  503: 'サービスが一時的に利用できません。',
  504: 'サーバーの応答がタイムアウトしました。',
  
  // ネットワーク関連
  'NETWORK_ERROR': 'ネットワーク接続を確認してください。',
  'TIMEOUT': '通信がタイムアウトしました。再試行してください。',
  'ECONNABORTED': '通信がタイムアウトしました。再試行してください。',
};

// 操作別のカスタムメッセージ
const OPERATION_MESSAGES = {
  login: {
    default: 'ログインに失敗しました。',
    401: 'ユーザー名またはパスワードが正しくありません。',
    429: 'ログイン試行回数が上限に達しました。しばらく後に再試行してください。',
  },
  register: {
    default: 'アカウント作成に失敗しました。',
    409: 'このユーザー名またはメールアドレスは既に使用されています。',
    422: '入力内容を確認してください。',
  },
  fetch: {
    default: 'データの取得に失敗しました。',
    404: 'データが見つかりません。',
  },
  create: {
    default: 'データの作成に失敗しました。',
    409: '既に同じデータが存在します。',
  },
  update: {
    default: 'データの更新に失敗しました。',
    404: '更新対象のデータが見つかりません。',
    409: 'データが他のユーザーによって変更されています。',
  },
  delete: {
    default: 'データの削除に失敗しました。',
    404: '削除対象のデータが見つかりません。',
  },
};

/**
 * エラーレスポンスから適切なメッセージを抽出
 * @param {Error} error - エラーオブジェクト
 * @param {string} operation - 操作の種類 ('login', 'register', 'fetch', etc.)
 * @returns {string} ユーザーフレンドリーなエラーメッセージ
 */
export const getErrorMessage = (error, operation = 'default') => {
  // ネットワークエラーの場合
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message;
  
  // サーバーからの具体的なメッセージがある場合は優先
  if (serverMessage && typeof serverMessage === 'string') {
    return serverMessage;
  }

  // 操作別のカスタムメッセージをチェック
  if (OPERATION_MESSAGES[operation]) {
    const operationMessages = OPERATION_MESSAGES[operation];
    if (operationMessages[status]) {
      return operationMessages[status];
    }
    if (operationMessages.default) {
      return operationMessages.default;
    }
  }

  // 汎用的なステータスコードメッセージ
  if (ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }

  // フォールバック
  return '予期しないエラーが発生しました。';
};

/**
 * エラーの詳細情報を抽出（デバッグ用）
 * @param {Error} error - エラーオブジェクト
 * @returns {Object} エラーの詳細情報
 */
export const getErrorDetails = (error) => {
  return {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    code: error.code,
    config: {
      url: error.config?.url,
      method: error.config?.method,
    }
  };
};

/**
 * エラーがリトライ可能かどうかを判定
 * @param {Error} error - エラーオブジェクト
 * @returns {boolean} リトライ可能かどうか
 */
export const isRetryableError = (error) => {
  // ネットワークエラーはリトライ可能
  if (!error.response) {
    return true;
  }

  const status = error.response.status;
  
  // 5xx系エラー（サーバーエラー）はリトライ可能
  if (status >= 500) {
    return true;
  }
  
  // 429（Too Many Requests）もリトライ可能
  if (status === 429) {
    return true;
  }
  
  // 408（Request Timeout）もリトライ可能
  if (status === 408) {
    return true;
  }
  
  return false;
};

/**
 * リトライ遅延時間を計算（指数バックオフ）
 * @param {number} attempt - 試行回数（0から開始）
 * @param {number} baseDelay - 基準遅延時間（ミリ秒）
 * @returns {number} 遅延時間（ミリ秒）
 */
export const getRetryDelay = (attempt, baseDelay = 1000) => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // 最大10秒
};