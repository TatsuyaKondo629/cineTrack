import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Container
} from '@mui/material';

/**
 * 映画カード用のスケルトンローダー
 */
export const MovieCardSkeleton = ({ count = 6 }) => {
  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 映画ポスター部分 */}
            <Skeleton
              variant="rectangular"
              height={300}
              sx={{ bgcolor: 'grey.300' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              {/* 映画タイトル */}
              <Skeleton
                variant="text"
                height={28}
                sx={{ mb: 1 }}
              />
              {/* リリース日 */}
              <Skeleton
                variant="text"
                height={20}
                width="60%"
                sx={{ mb: 1 }}
              />
              {/* 評価 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
              {/* 概要 */}
              <Skeleton variant="text" height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" height={16} width="80%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

/**
 * 統計カード用のスケルトンローダー
 */
export const StatsCardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <Card
          key={index}
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* アイコン */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          {/* 数値 */}
          <Skeleton
            variant="text"
            height={32}
            width="50%"
            sx={{ mx: 'auto', mb: 0.5 }}
          />
          {/* ラベル */}
          <Skeleton
            variant="text"
            height={20}
            width="80%"
            sx={{ mx: 'auto' }}
          />
        </Card>
      ))}
    </>
  );
};

/**
 * アクティビティリスト用のスケルトンローダー
 */
export const ActivityListSkeleton = ({ count = 5 }) => {
  return (
    <Box>
      {Array.from(new Array(count)).map((_, index) => (
        <Card key={index} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* ユーザーアバター */}
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ mr: 2, flexShrink: 0 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              {/* ユーザー名とアクション */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="text" width="30%" height={20} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              {/* 映画タイトル */}
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              {/* 評価やコメント */}
              <Skeleton variant="text" width="90%" height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={16} sx={{ mb: 1 }} />
              {/* タイムスタンプ */}
              <Skeleton variant="text" width="25%" height={14} />
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

/**
 * ユーザープロフィール用のスケルトンローダー
 */
export const UserProfileSkeleton = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {/* プロフィール画像 */}
          <Skeleton
            variant="circular"
            width={80}
            height={80}
            sx={{ mr: 3 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            {/* ユーザー名 */}
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
            {/* メールアドレス */}
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
            {/* フォロー統計 */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
        </Box>
        
        {/* 統計セクション */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 2,
          mb: 3
        }}>
          {Array.from(new Array(4)).map((_, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <Skeleton variant="text" width="100%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto' }} />
            </Box>
          ))}
        </Box>
      </Card>
      
      {/* 最近の活動 */}
      <Card sx={{ p: 3 }}>
        <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
        <ActivityListSkeleton count={3} />
      </Card>
    </Container>
  );
};

/**
 * チャート用のスケルトンローダー
 */
export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      {/* チャートタイトル */}
      <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
      {/* チャート領域 */}
      <Skeleton
        variant="rectangular"
        height={height}
        sx={{ borderRadius: 1 }}
      />
    </Card>
  );
};

/**
 * テーブル用のスケルトンローダー
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {Array.from(new Array(columns)).map((_, index) => (
          <Box key={index} sx={{ flex: 1, mr: index < columns - 1 ? 2 : 0 }}>
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        ))}
      </Box>
      
      {/* 行 */}
      {Array.from(new Array(rows)).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', mb: 1.5 }}>
          {Array.from(new Array(columns)).map((_, colIndex) => (
            <Box key={colIndex} sx={{ flex: 1, mr: colIndex < columns - 1 ? 2 : 0 }}>
              <Skeleton 
                variant="text" 
                width={colIndex === 0 ? "60%" : "90%"} 
                height={16} 
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

/**
 * 汎用ページスケルトンローダー
 */
export const PageSkeleton = ({ 
  showHeader = true, 
  showStats = false, 
  showContent = true,
  contentType = 'cards' // 'cards', 'list', 'table'
}) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ページヘッダー */}
      {showHeader && (
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="50%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={20} />
        </Box>
      )}
      
      {/* 統計セクション */}
      {showStats && (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 3,
          mb: 4
        }}>
          <StatsCardSkeleton count={3} />
        </Box>
      )}
      
      {/* コンテンツセクション */}
      {showContent && (
        <>
          {contentType === 'cards' && (
            <Grid container spacing={3}>
              <MovieCardSkeleton count={8} />
            </Grid>
          )}
          {contentType === 'list' && <ActivityListSkeleton count={6} />}
          {contentType === 'table' && <TableSkeleton rows={8} />}
        </>
      )}
    </Container>
  );
};

export default {
  MovieCardSkeleton,
  StatsCardSkeleton,
  ActivityListSkeleton,
  UserProfileSkeleton,
  ChartSkeleton,
  TableSkeleton,
  PageSkeleton
};