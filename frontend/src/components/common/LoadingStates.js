import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Fade,
  Container
} from '@mui/material';
import { keyframes } from '@mui/material/styles';

// アニメーション定義
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * 基本的な中央揃えローディング
 */
export const CenteredLoading = ({ 
  message = 'ロード中...', 
  size = 40, 
  showMessage = true,
  minHeight = '200px',
  color = 'primary'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        animation: `${fadeIn} 0.3s ease-out`
      }}
    >
      <CircularProgress size={size} color={color} />
      {showMessage && (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ animation: `${pulse} 2s ease-in-out infinite` }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * フルスクリーンローディング（オーバーレイ）
 */
export const FullScreenLoading = ({ 
  message = 'ロード中...', 
  open = true,
  showMessage = true 
}) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        gap: 2
      }}
      open={open}
    >
      <CircularProgress color="inherit" size={60} />
      {showMessage && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Backdrop>
  );
};

/**
 * プログレスバー付きローディング
 */
export const ProgressLoading = ({ 
  message = 'ロード中...', 
  progress = null, // null の場合は不定、数値の場合は進捗表示
  showPercentage = false 
}) => {
  return (
    <Box sx={{ width: '100%', py: 4 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        {message}
      </Typography>
      
      {progress !== null ? (
        <>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 6, borderRadius: 3 }}
          />
          {showPercentage && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 1, textAlign: 'center' }}
            >
              {Math.round(progress)}%
            </Typography>
          )}
        </>
      ) : (
        <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
      )}
    </Box>
  );
};

/**
 * ボタン内ローディング
 */
export const ButtonLoading = ({ 
  loading = false, 
  children, 
  size = 20, 
  color = 'inherit',
  ...buttonProps 
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {React.cloneElement(children, {
        ...buttonProps,
        disabled: loading || children.props.disabled,
        sx: {
          ...children.props.sx,
          ...(loading && { color: 'transparent' })
        }
      })}
      {loading && (
        <CircularProgress
          size={size}
          color={color}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: `-${size/2}px`,
            marginLeft: `-${size/2}px`,
          }}
        />
      )}
    </Box>
  );
};

/**
 * カード内ローディング
 */
export const CardLoading = ({ 
  message = 'データを読み込み中...', 
  height = 200,
  showSpinner = true 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        gap: 2,
        animation: `${pulse} 2s ease-in-out infinite`
      }}
    >
      {showSpinner && <CircularProgress size={30} />}
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );
};

/**
 * リスト項目ローディング
 */
export const ListItemLoading = ({ count = 5, height = 60 }) => {
  return (
    <Box>
      {Array.from(new Array(count)).map((_, index) => (
        <Box
          key={index}
          sx={{
            height,
            bgcolor: 'action.hover',
            borderRadius: 1,
            mb: 1,
            animation: `${pulse} 2s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </Box>
  );
};

/**
 * データテーブルローディング
 */
export const TableLoading = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => {
  return (
    <Box>
      {showHeader && (
        <Box sx={{ display: 'flex', mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {Array.from(new Array(columns)).map((_, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: 20,
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                mr: index < columns - 1 ? 1 : 0,
                animation: `${pulse} 2s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </Box>
      )}
      
      {Array.from(new Array(rows)).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', mb: 1 }}>
          {Array.from(new Array(columns)).map((_, colIndex) => (
            <Box
              key={colIndex}
              sx={{
                flex: 1,
                height: 16,
                bgcolor: 'action.hover',
                borderRadius: 0.5,
                mr: colIndex < columns - 1 ? 1 : 0,
                animation: `${pulse} 2s ease-in-out infinite`,
                animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

/**
 * 段階的ローディング（複数段階の読み込み表示）
 */
export const StageLoading = ({ 
  stages = ['データを準備中...', '読み込み中...', '完了間近...'], 
  currentStage = 0,
  showProgress = true 
}) => {
  const progress = ((currentStage + 1) / stages.length) * 100;
  
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <CircularProgress size={50} />
      </Box>
      
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: 'center', 
          mb: 2,
          animation: `${fadeIn} 0.5s ease-out`
        }}
      >
        {stages[currentStage] || stages[stages.length - 1]}
      </Typography>
      
      {showProgress && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1, textAlign: 'center' }}
          >
            ステップ {Math.min(currentStage + 1, stages.length)} / {stages.length}
          </Typography>
        </Box>
      )}
      
      {/* ステージインジケーター */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
        {stages.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: index <= currentStage ? 'primary.main' : 'action.disabled',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </Box>
    </Container>
  );
};

/**
 * スマートローディング（データの種類に応じて適切なローディングを表示）
 */
export const SmartLoading = ({ 
  type = 'default', // 'default', 'list', 'cards', 'table', 'chart', 'profile'
  message,
  ...props 
}) => {
  const getLoadingByType = () => {
    switch (type) {
      case 'list':
        return <ListItemLoading {...props} />;
      case 'table':
        return <TableLoading {...props} />;
      case 'cards':
        return <CenteredLoading message={message || 'カードを読み込み中...'} {...props} />;
      case 'chart':
        return <CardLoading message={message || 'チャートを生成中...'} height={300} {...props} />;
      case 'profile':
        return <CenteredLoading message={message || 'プロフィールを読み込み中...'} {...props} />;
      default:
        return <CenteredLoading message={message} {...props} />;
    }
  };

  return (
    <Fade in timeout={300}>
      <div>{getLoadingByType()}</div>
    </Fade>
  );
};

export default {
  CenteredLoading,
  FullScreenLoading,
  ProgressLoading,
  ButtonLoading,
  CardLoading,
  ListItemLoading,
  TableLoading,
  StageLoading,
  SmartLoading
};