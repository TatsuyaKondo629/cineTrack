import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

/**
 * エラー表示用のアラートコンポーネント
 * リトライ機能と詳細表示機能を持つ
 */
const ErrorAlert = ({
  error,
  message,
  onRetry,
  onClose,
  showDetails = false,
  retryLabel = '再試行',
  className
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (onRetry && !isRetrying) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (!error && !message) {
    return null;
  }

  const displayMessage = message || error?.message || 'エラーが発生しました';

  return (
    <Alert
      severity="error"
      className={className}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              disabled={isRetrying}
              startIcon={<RefreshIcon />}
              sx={{
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {isRetrying ? '実行中...' : retryLabel}
            </Button>
          )}
          {showDetails && error && (
            <IconButton
              size="small"
              onClick={handleToggleExpanded}
              sx={{ color: 'inherit' }}
              aria-label={expanded ? '詳細を閉じる' : '詳細を表示'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'inherit' }}
              aria-label="閉じる"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      }
    >
      <AlertTitle>エラー</AlertTitle>
      <Typography variant="body2">
        {displayMessage}
      </Typography>
      
      {showDetails && error && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              詳細情報:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ 
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error.response ? (
                `ステータス: ${error.response.status} ${error.response.statusText || ''}\n` +
                `URL: ${error.config?.url || 'N/A'}\n` +
                `メソッド: ${error.config?.method?.toUpperCase() || 'N/A'}\n` +
                (error.response.data ? `レスポンス: ${JSON.stringify(error.response.data, null, 2)}` : '')
              ) : (
                `エラーコード: ${error.code || 'N/A'}\n` +
                `メッセージ: ${error.message || 'N/A'}`
              )}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Alert>
  );
};

export default ErrorAlert;