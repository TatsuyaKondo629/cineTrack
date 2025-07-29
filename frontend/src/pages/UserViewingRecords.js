import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Grid,
  Rating,
  Chip,
  Pagination,
  Alert,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Theaters as TheatersIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const UserViewingRecords = () => {
  const { userId } = useParams();
  const [viewingRecords, setViewingRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/social/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('User profile fetch error:', error);
    }
  };

  const fetchViewingRecords = async (page = 0) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/social/users/${userId}/viewing-records`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size: 12 }
      });
      
      if (response.data.success) {
        setViewingRecords(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements);
      } else {
        setError(response.data.message || '視聴記録の取得に失敗しました');
      }
    } catch (error) {
      console.error('Viewing records fetch error:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setError('このユーザーの視聴記録を閲覧する権限がありません');
      } else {
        setError('視聴記録の取得中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    fetchViewingRecords(page - 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (posterPath) => {
    if (!posterPath) return 'https://via.placeholder.com/300x450/333/fff?text=No+Image';
    return posterPath.startsWith('http') 
      ? posterPath 
      : `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchViewingRecords(0);
    }
  }, [userId]);

  if (loading && viewingRecords.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ユーザー情報ヘッダー */}
      {user && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                mr: 3,
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {user.displayName || user.username} の視聴記録
              </Typography>
              <Typography variant="body1" color="text.secondary">
                @{user.username}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Chip
                  icon={<StarIcon />}
                  label={`${totalElements} 件の記録`}
                  variant="outlined"
                />
                {user.averageRating && (
                  <Chip
                    icon={<StarIcon />}
                    label={`平均評価: ${user.averageRating.toFixed(1)}`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {viewingRecords && viewingRecords.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            視聴記録がありません
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {viewingRecords && viewingRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={record.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, elevation 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      elevation: 8
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={getImageUrl(record.moviePosterPath)}
                    alt={record.movieTitle}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {record.movieTitle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating
                        value={record.rating}
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {record.rating}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(record.viewingDate)}
                      </Typography>
                    </Box>

                    {record.theater && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {record.theater}
                        </Typography>
                      </Box>
                    )}

                    {record.screeningFormat && (
                      <Box sx={{ mb: 1 }}>
                        <Chip 
                          label={record.screeningFormat} 
                          size="small" 
                          variant="outlined"
                          icon={<TheatersIcon />}
                        />
                      </Box>
                    )}

                    {record.review && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {record.review}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default UserViewingRecords;