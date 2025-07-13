import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    fetchTrendingMovies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrendingMovies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/trending?timeWindow=day&page=1`);
      if (response.data.success) {
        setTrendingMovies(response.data.data.results.slice(0, 8)); // Show only first 8 movies
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (posterPath) => {
    return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '/placeholder-movie.jpg';
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setDetailsDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          CineTrack
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          あなたの映画体験を記録し、管理しよう
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          観た映画を記録し、評価やレビューを残すことで、あなたの映画ライフをより豊かにします。
          TMDbの豊富な映画データベースと連携して、簡単に映画を検索・記録できます。
        </Typography>
        
        {!isAuthenticated ? (
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                px: 4, 
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              今すぐ始める
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                px: 4, 
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              ログイン
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/movies')}
              sx={{ 
                px: 4, 
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              映画を探す
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                px: 4, 
                py: 1.5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              ダッシュボード
            </Button>
          </Box>
        )}
      </Box>

      {/* Trending Movies Section */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          今日のトレンド映画
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(4, 1fr)'
            },
            gap: 2
          }}>
            {trendingMovies.map((movie) => (
              <Box key={movie.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    aspectRatio: '2/3', // ポスター比率
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      zIndex: 10,
                      '& .movie-poster': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                      }
                    }
                  }}
                  onClick={() => handleMovieClick(movie)}
                >
                  <CardMedia
                    className="movie-poster"
                    component="img"
                    image={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 2,
                      transition: 'box-shadow 0.3s ease'
                    }}
                  />
                  
                  {/* オーバーレイで映画情報を表示 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                      color: 'white',
                      p: 2,
                      borderRadius: '0 0 8px 8px',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '.MuiCard-root:hover &': {
                        opacity: 1
                      }
                    }}
                  >
                    <Typography variant="subtitle2" component="h3" fontWeight="bold" gutterBottom>
                      {movie.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="rgba(255,255,255,0.8)">
                        {formatReleaseDate(movie.release_date)}
                      </Typography>
                      <Chip 
                        label={`★ ${movie.vote_average?.toFixed(1)}`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(229,9,20,0.8)',
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/movies')}
            size="large"
          >
            もっと映画を見る
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          主な機能
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom color="primary">
                📽️ 映画検索
              </Typography>
              <Typography variant="body1" color="text.secondary">
                TMDbの豊富なデータベースから映画を検索し、詳細情報を確認できます
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom color="primary">
                📝 視聴記録
              </Typography>
              <Typography variant="body1" color="text.secondary">
                観た映画を記録し、評価やレビュー、視聴場所などを残せます
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom color="primary">
                📊 統計表示
              </Typography>
              <Typography variant="body1" color="text.secondary">
                視聴した映画の統計や傾向を確認し、映画体験を振り返れます
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Movie Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedMovie && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" fontWeight="bold">
                {selectedMovie.title}
              </Typography>
              {selectedMovie.original_title !== selectedMovie.title && (
                <Typography variant="subtitle1" color="text.secondary">
                  {selectedMovie.original_title}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Movie Poster */}
                <Box sx={{ flexShrink: 0 }}>
                  <img
                    src={getImageUrl(selectedMovie.poster_path)}
                    alt={selectedMovie.title}
                    style={{
                      width: '200px',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                
                {/* Movie Details */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" paragraph>
                      {selectedMovie.overview || '概要が提供されていません。'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        公開日
                      </Typography>
                      <Typography variant="body1">
                        {selectedMovie.release_date || '未定'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        評価
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={`★ ${selectedMovie.vote_average?.toFixed(1) || 'N/A'}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(229,9,20,0.8)',
                            color: 'white'
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({selectedMovie.vote_count || 0} 票)
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        人気度
                      </Typography>
                      <Typography variant="body1">
                        {selectedMovie.popularity?.toFixed(0) || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        言語
                      </Typography>
                      <Typography variant="body1">
                        {selectedMovie.original_language?.toUpperCase() || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedMovie.genre_ids && selectedMovie.genre_ids.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ジャンル
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedMovie.genre_ids.map((genreId) => (
                          <Chip 
                            key={genreId}
                            label={`Genre ${genreId}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                閉じる
              </Button>
              <Button 
                onClick={() => {
                  setDetailsDialogOpen(false);
                  navigate('/movies');
                }}
                variant="contained"
              >
                映画ページで詳細を見る
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Home;