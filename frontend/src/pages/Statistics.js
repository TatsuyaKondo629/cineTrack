import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
// Charts are now replaced with custom UI components
import {
  TrendingUp as TrendingUpIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    overall: null,
    monthly: [],
    genres: [],
    ratings: []
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  const fetchStatistics = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching statistics from:', `${API_BASE_URL}/stats/summary`);
      const response = await axios.get(`${API_BASE_URL}/stats/summary`, { headers });
      console.log('Statistics response:', response.data);
      
      if (response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // カラーパレット
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  // 月別データをチャート用にフォーマット
  const formatMonthlyData = (monthlyData) => {
    return monthlyData.map(item => ({
      month: item.month,
      movies: item.count
    }));
  };

  // 評価分布データをチャート用にフォーマット
  const formatRatingData = (ratingData) => {
    return ratingData.map(item => ({
      rating: `★${item.rating}`,
      count: item.count
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const { overall, monthly, genres, ratings } = statsData;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        統計・分析
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        あなたの映画視聴データを詳しく分析します
      </Typography>

      {/* 概要統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MovieIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {overall?.totalMovies || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                総視聴映画数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {overall?.averageRating?.toFixed(1) || '0.0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均評価
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {overall?.moviesPerMonth?.toFixed(1) || '0.0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                月あたり視聴数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {overall?.viewingDays || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                視聴期間（日）
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* お気に入りジャンル */}
      {overall?.favoriteGenre && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            お気に入りジャンル
          </Typography>
          <Chip 
            label={overall.favoriteGenre} 
            color="primary" 
            variant="filled" 
            size="large"
          />
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* チャートセクション */}
      <Grid container spacing={3}>
        {/* 月別視聴数 */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                月別視聴数
              </Typography>
              <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                {formatMonthlyData(monthly).map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2.5, 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-1px)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {item.month}
                      </Typography>
                      <Chip 
                        label={`${item.movies}本`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }} 
                      />
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      bgcolor: 'grey.100', 
                      borderRadius: 1.5, 
                      height: 6,
                      overflow: 'hidden'
                    }}>
                      <Box
                        sx={{
                          width: `${Math.max((item.movies / Math.max(...formatMonthlyData(monthly).map(d => d.movies))) * 100, 3)}%`,
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          height: '100%',
                          borderRadius: 1.5,
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ジャンル分布 */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                ジャンル分布
              </Typography>
              <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                {genres.slice(0, 8).map((genre, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2.5, 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: `${COLORS[index % COLORS.length]}08`,
                      border: '1px solid',
                      borderColor: `${COLORS[index % COLORS.length]}30`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${COLORS[index % COLORS.length]}20`,
                        transform: 'translateY(-2px)',
                        borderColor: COLORS[index % COLORS.length]
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: COLORS[index % COLORS.length],
                            mr: 1.5,
                            boxShadow: `0 2px 4px ${COLORS[index % COLORS.length]}40`
                          }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {genre.genre}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          {genre.count}本
                        </Typography>
                        <Chip 
                          label={`${genre.percentage.toFixed(1)}%`} 
                          size="small" 
                          sx={{ 
                            bgcolor: COLORS[index % COLORS.length], 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            minWidth: '50px'
                          }} 
                        />
                      </Box>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      bgcolor: 'grey.100', 
                      borderRadius: 1.5, 
                      height: 6,
                      overflow: 'hidden'
                    }}>
                      <Box
                        sx={{
                          width: `${genre.percentage}%`,
                          background: `linear-gradient(45deg, ${COLORS[index % COLORS.length]} 30%, ${COLORS[index % COLORS.length]}CC 90%)`,
                          height: '100%',
                          borderRadius: 1.5,
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: `0 2px 4px ${COLORS[index % COLORS.length]}40`
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 評価分布 */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                評価分布
              </Typography>
              <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                {formatRatingData(ratings).reverse().map((item, index) => {
                  const starColor = item.rating.includes('5') ? '#FFD700' : 
                                   item.rating.includes('4') ? '#FFA500' : 
                                   item.rating.includes('3') ? '#FF6B6B' : 
                                   item.rating.includes('2') ? '#FF8E8E' : '#FFB3B3';
                  return (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2.5, 
                        p: 2.5, 
                        borderRadius: 3, 
                        bgcolor: `${starColor}08`,
                        border: '1px solid',
                        borderColor: `${starColor}30`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${starColor}20`,
                          transform: 'translateY(-2px)',
                          borderColor: starColor
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: starColor, fontSize: '1.3rem', mr: 1 }}>
                            {item.rating}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${item.count}本`} 
                          size="small" 
                          sx={{ 
                            bgcolor: starColor, 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        bgcolor: 'grey.100', 
                        borderRadius: 1.5, 
                        height: 6,
                        overflow: 'hidden'
                      }}>
                        <Box
                          sx={{
                            width: `${Math.max((item.count / Math.max(...formatRatingData(ratings).map(d => d.count))) * 100, 3)}%`,
                            background: `linear-gradient(45deg, ${starColor} 30%, ${starColor}CC 90%)`,
                            height: '100%',
                            borderRadius: 1.5,
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 2px 4px ${starColor}40`
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 視聴傾向（統計サマリー） */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                視聴統計サマリー
              </Typography>
              <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'success.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, opacity: 0.9 }}>
                      最も視聴の多い月
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatMonthlyData(monthly).reduce((max, item) => item.movies > max.movies ? item : max, formatMonthlyData(monthly)[0])?.month || '-'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'info.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, opacity: 0.9 }}>
                      最も人気のジャンル
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {genres[0]?.genre || '-'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'warning.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, opacity: 0.9 }}>
                      最も多い評価
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatRatingData(ratings).reduce((max, item) => item.count > max.count ? item : max, formatRatingData(ratings)[0])?.rating || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 詳細情報 */}
      {overall && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              詳細情報
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  初回視聴日: {overall.firstViewingDate || 'データなし'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  最新視聴日: {overall.lastViewingDate || 'データなし'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Statistics;