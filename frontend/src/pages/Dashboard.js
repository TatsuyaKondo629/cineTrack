import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Movie as MovieIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user statistics
      const statsResponse = await axios.get(`${API_BASE_URL}/viewing-records/stats`, { headers });
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent viewing records (limit to 6)
      const recordsResponse = await axios.get(`${API_BASE_URL}/viewing-records?page=0&size=6`, { headers });
      if (recordsResponse.data.success) {
        setRecentRecords(recordsResponse.data.data.content);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (posterPath) => {
    return posterPath ? `https://image.tmdb.org/t/p/w300${posterPath}` : '/placeholder-movie.jpg';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          おかえりなさい、<br />{user?.username}さん
        </Typography>
        <Typography variant="body1" color="text.secondary">
          あなたの映画ライフを確認しましょう
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: { xs: '8px', sm: '16px', md: '24px' },
          mb: 4,
          '@media (max-width: 375px)': {
            gap: '6px'
          }
        }}
      >
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ 
            textAlign: 'center', 
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2 }
          }}>
            <MovieIcon sx={{ 
              fontSize: { xs: 28, sm: 40 }, 
              color: 'primary.main', 
              mb: 1 
            }} />
            <Typography 
              variant="h5" 
              component="div" 
              gutterBottom
              sx={{ fontSize: { xs: '1.2rem', sm: '2rem' } }}
            >
              {stats?.totalMovies || 0}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              視聴した映画数
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ 
            textAlign: 'center', 
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2 }
          }}>
            <StarIcon sx={{ 
              fontSize: { xs: 28, sm: 40 }, 
              color: 'warning.main', 
              mb: 1 
            }} />
            <Typography 
              variant="h5" 
              component="div" 
              gutterBottom
              sx={{ fontSize: { xs: '1.2rem', sm: '2rem' } }}
            >
              {stats?.averageRating?.toFixed(1) || '0.0'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              平均評価
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ 
            textAlign: 'center', 
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2 }
          }}>
            <TrendingUpIcon sx={{ 
              fontSize: { xs: 28, sm: 40 }, 
              color: 'success.main', 
              mb: 1 
            }} />
            <Typography 
              variant="h5" 
              component="div" 
              gutterBottom
              sx={{ fontSize: { xs: '1.2rem', sm: '2rem' } }}
            >
              {recentRecords.length}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              最近の記録
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Viewing Records */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            最近の視聴記録
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/viewing-records')}
          >
            すべて見る
          </Button>
        </Box>

        {recentRecords.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              まだ視聴記録がありません
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              映画を観たら記録してみましょう！
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/movies')}
            >
              映画を探す
            </Button>
          </Card>
        ) : (
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(140px, 1fr))',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: { xs: '8px', sm: '16px', md: '24px' },
              '@media (max-width: 375px)': {
                gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
                gap: '6px'
              }
            }}
          >
            {recentRecords.map((record) => (
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => navigate('/viewing-records')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(record.moviePosterPath)}
                    alt={record.movieTitle}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {record.movieTitle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={`★ ${record.rating}`}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(record.viewingDate)}
                      </Typography>
                    </Box>

                    {record.theater && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📍 {record.theater}
                      </Typography>
                    )}

                    {record.screeningFormat && (
                      <Chip 
                        label={record.screeningFormat}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}

                    {record.review && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mt: 1
                        }}
                      >
                        {record.review}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          クイックアクション
        </Typography>
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          <Button
            variant="contained"
            sx={{ py: 2 }}
            onClick={() => navigate('/movies')}
          >
            映画を探す
          </Button>
          <Button
            variant="outlined"
            sx={{ py: 2 }}
            onClick={() => navigate('/viewing-records')}
          >
            視聴記録を見る
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;