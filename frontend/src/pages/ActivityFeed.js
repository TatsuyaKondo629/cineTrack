import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ActivityFeed = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/social/activities', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 50 }
      });
      
      if (response.data.success) {
        setActivities(response.data.data.content);
      } else {
        setError(response.data.message || 'アクティビティフィードの取得に失敗しました');
      }
    } catch (error) {
      console.error('Activities fetch error:', error);
      setError('アクティビティフィードの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'VIEW_MOVIE':
        return <MovieIcon color="primary" />;
      case 'ADD_TO_WISHLIST':
        return <FavoriteIcon color="secondary" />;
      case 'RATE_MOVIE':
        return <StarIcon color="warning" />;
      default:
        return <MovieIcon />;
    }
  };

  const getImageUrl = (posterPath) => {
    if (!posterPath) return 'https://via.placeholder.com/200x300/333/fff?text=No+Image';
    return posterPath.startsWith('http') 
      ? posterPath 
      : `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleShowReview = (activity) => {
    setSelectedActivity(activity);
    setReviewDialog(true);
  };

  const closeReviewDialog = () => {
    setReviewDialog(false);
    setSelectedActivity(null);
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleMovieClick = (movieId) => {
    // 映画詳細ページへのナビゲーション（実装予定）
    console.log('Movie clicked:', movieId);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          アクティビティを読み込み中...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon fontSize="large" />
          アクティビティフィード
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchActivities}
          disabled={loading}
        >
          更新
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {activities.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TimelineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              アクティビティがありません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              フォローしているユーザーの活動がここに表示されます
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/users')}
            >
              ユーザーを探す
            </Button>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <Card key={`${activity.userId}-${activity.movieId}-${index}`} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* ユーザーアバター */}
                  <Avatar
                    sx={{ 
                      bgcolor: 'primary.main', 
                      cursor: 'pointer',
                      width: 48,
                      height: 48 
                    }}
                    onClick={() => handleUserClick(activity.userId)}
                  >
                    {activity.displayName 
                      ? activity.displayName[0].toUpperCase() 
                      : activity.username[0].toUpperCase()}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    {/* アクティビティヘッダー */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getActivityIcon(activity.activityType)}
                      <Typography variant="body1">
                        <strong 
                          onClick={() => handleUserClick(activity.userId)}
                          style={{ cursor: 'pointer' }}
                        >
                          {activity.displayName || activity.username}
                        </strong>
                        {activity.activityType === 'VIEW_MOVIE' && ' が映画を視聴しました'}
                        {activity.activityType === 'ADD_TO_WISHLIST' && ' がウィッシュリストに追加しました'}
                        {activity.activityType === 'RATE_MOVIE' && ' が映画を評価しました'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(activity.createdAt)}
                      </Typography>
                    </Box>

                    {/* 映画情報 */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{ 
                          width: 80, 
                          height: 120, 
                          borderRadius: 1,
                          cursor: 'pointer',
                          objectFit: 'cover'
                        }}
                        image={getImageUrl(activity.moviePoster)}
                        alt={activity.movieTitle}
                        onClick={() => handleMovieClick(activity.movieId)}
                      />
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h3"
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => handleMovieClick(activity.movieId)}
                        >
                          {activity.movieTitle}
                        </Typography>
                        
                        {activity.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Rating value={activity.rating} precision={0.5} size="small" readOnly />
                            <Typography variant="body2">
                              {activity.rating}
                            </Typography>
                          </Box>
                        )}
                        
                        {activity.review && (
                          <Box sx={{ mt: 1 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {activity.review}
                            </Typography>
                            {activity.review.length > 100 && (
                              <Button
                                size="small"
                                onClick={() => handleShowReview(activity)}
                                sx={{ mt: 0.5 }}
                              >
                                全文を見る
                              </Button>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* アクション */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<PersonIcon />}
                        onClick={() => handleUserClick(activity.userId)}
                      >
                        プロフィール
                      </Button>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/users/${activity.userId}/viewing-records`)}
                      >
                        視聴記録
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* レビュー全文表示ダイアログ */}
      <Dialog open={reviewDialog} onClose={closeReviewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedActivity?.movieTitle} のレビュー
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {selectedActivity?.displayName 
                ? selectedActivity.displayName[0].toUpperCase() 
                : selectedActivity?.username[0].toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1">
              {selectedActivity?.displayName || selectedActivity?.username}
            </Typography>
            {selectedActivity?.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
                <Rating value={selectedActivity.rating} precision={0.5} size="small" readOnly />
                <Typography variant="body2">
                  {selectedActivity.rating}
                </Typography>
              </Box>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedActivity?.review}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActivityFeed;