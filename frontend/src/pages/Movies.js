import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardMedia,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import TheaterSearch from '../components/TheaterSearch';
import axios from 'axios';

const Movies = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [viewingRecord, setViewingRecord] = useState({
    rating: 0,
    viewingDate: new Date().toISOString().slice(0, 10),
    theater: '',
    screeningFormat: '',
    review: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    if (tabValue === 0) {
      fetchTrendingMovies();
    } else if (tabValue === 1) {
      fetchPopularMovies();
    } else if (tabValue === 2) {
      fetchNowPlayingMovies();
    }
  }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated && movies.length > 0) {
      checkWishlistStatus();
    }
  }, [movies, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-search when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchMovies();
      }, 500); // 500ms debounce
      
      return () => clearTimeout(timeoutId);
    } else {
      // If search query is empty, show current tab content
      if (tabValue === 0) {
        fetchTrendingMovies();
      } else if (tabValue === 1) {
        fetchPopularMovies();
      } else if (tabValue === 2) {
        fetchNowPlayingMovies();
      }
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrendingMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/trending?timeWindow=day&page=1`);
      if (response.data.success) {
        setMovies(response.data.data.results);
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/popular?page=1`);
      if (response.data.success) {
        setMovies(response.data.data.results);
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNowPlayingMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/now-playing?page=1`);
      if (response.data.success) {
        setMovies(response.data.data.results);
      }
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(searchQuery)}&page=1`);
      if (response.data.success) {
        setMovies(response.data.data.results);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery('');
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setDetailsDialogOpen(true);
  };

  const handleAddToWatchlist = (movie) => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'ログインしてください',
        severity: 'warning'
      });
      return;
    }
    
    setSelectedMovie(movie);
    setSelectedTheater(null);
    setViewingRecord({
      rating: 0,
      viewingDate: new Date().toISOString().slice(0, 10),
      theater: '',
      screeningFormat: '',
      review: ''
    });
    setDetailsDialogOpen(false);
    setDialogOpen(true);
  };

  const handleSaveViewingRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'ログインが必要です',
          severity: 'error'
        });
        return;
      }

      const recordData = {
        tmdbMovieId: selectedMovie.id,
        movieTitle: selectedMovie.title,
        moviePosterPath: selectedMovie.poster_path,
        viewingDate: viewingRecord.viewingDate + 'T12:00:00', // 日付を日時に変換
        rating: viewingRecord.rating,
        theater: selectedTheater ? (selectedTheater.displayName || selectedTheater.name) : viewingRecord.theater || null,
        theaterId: selectedTheater ? selectedTheater.id : null, // 劇場IDを追加
        screeningFormat: viewingRecord.screeningFormat || null,
        review: viewingRecord.review || null
      };

      const response = await axios.post(`${API_BASE_URL}/viewing-records`, recordData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: '視聴記録を保存しました',
          severity: 'success'
        });
        setDialogOpen(false);
        setSelectedTheater(null);
        setViewingRecord({
          rating: 0,
          viewingDate: new Date().toISOString().slice(0, 10),
          theater: '',
          screeningFormat: '',
          review: ''
        });
      }
    } catch (error) {
      console.error('Error saving viewing record:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || '保存に失敗しました',
        severity: 'error'
      });
    }
  };

  const getImageUrl = (posterPath) => {
    return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '/placeholder-movie.jpg';
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const checkWishlistStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const statusPromises = movies.map(async (movie) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/wishlist/check/${movie.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { movieId: movie.id, inWishlist: response.data.data };
        } catch (error) {
          console.error(`Error checking wishlist status for movie ${movie.id}:`, error);
          return { movieId: movie.id, inWishlist: false };
        }
      });
      
      const results = await Promise.all(statusPromises);
      const statusMap = {};
      results.forEach(({ movieId, inWishlist }) => {
        statusMap[movieId] = inWishlist;
      });
      setWishlistStatus(statusMap);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async (movie) => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'ログインしてください',
        severity: 'warning'
      });
      return;
    }

    const movieId = movie.id;
    const isInWishlist = wishlistStatus[movieId];
    
    setWishlistLoading(prev => ({ ...prev, [movieId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await axios.delete(`${API_BASE_URL}/wishlist/remove/${movieId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setWishlistStatus(prev => ({ ...prev, [movieId]: false }));
          setSnackbar({
            open: true,
            message: 'ウィッシュリストから削除しました',
            severity: 'success'
          });
        }
      } else {
        // Add to wishlist
        const wishlistData = {
          tmdbMovieId: movieId,
          movieTitle: movie.title,
          moviePosterPath: movie.poster_path,
          movieOverview: movie.overview,
          movieReleaseDate: movie.release_date,
          movieVoteAverage: movie.vote_average
        };
        
        const response = await axios.post(`${API_BASE_URL}/wishlist/add`, wishlistData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          setWishlistStatus(prev => ({ ...prev, [movieId]: true }));
          setSnackbar({
            open: true,
            message: 'ウィッシュリストに追加しました',
            severity: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'エラーが発生しました',
        severity: 'error'
      });
    } finally {
      setWishlistLoading(prev => ({ ...prev, [movieId]: false }));
    }
  };

  return (
    <Box sx={{ 
      mt: { xs: 2, sm: 4 }, 
      mb: 4, 
      px: { xs: '8px', sm: '16px', md: '24px' },
      maxWidth: '1200px',
      mx: 'auto',
      width: '100%',
      minWidth: 0
    }}>
      <Typography variant="h4" component="h1" gutterBottom>
        映画を探す
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="映画を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="トレンド" />
          <Tab label="人気作品" />
          <Tab label="上映中" />
        </Tabs>
      </Box>

      {/* Movies Grid */}
      {loading ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(140px, 1fr))',
            sm: 'repeat(3, minmax(160px, 1fr))',
            md: 'repeat(4, minmax(180px, 1fr))',
            lg: 'repeat(5, minmax(200px, 1fr))'
          },
          gap: { xs: 1, sm: 2 },
          mt: 2
        }}>
          <MovieCardSkeleton count={10} />
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(140px, 1fr))',
            sm: 'repeat(2, minmax(160px, 1fr))',
            md: 'repeat(4, minmax(180px, 1fr))',
            lg: 'repeat(4, minmax(200px, 1fr))',
            xl: 'repeat(4, minmax(220px, 1fr))'
          },
          gap: { xs: '8px', sm: '12px', md: '16px' },
          width: '100%',
          justifyContent: 'center',
          '@media (max-width: 320px)': {
            gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
            gap: '6px'
          }
        }}>
          {movies.map((movie) => (
            <Box key={movie.id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  aspectRatio: '2/3',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: 'none',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  height: 'auto',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    zIndex: 10,
                    '& .movie-poster': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    },
                    '& .add-button': {
                      opacity: 1
                    },
                    '& .wishlist-button': {
                      opacity: 1
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
                
                {isAuthenticated && (
                  <>
                    <Button
                      className="add-button"
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWatchlist(movie);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        fontSize: '0.75rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'auto'
                      }}
                    >
                      記録
                    </Button>
                    <Button
                      className="wishlist-button"
                      variant="contained"
                      color={wishlistStatus[movie.id] ? "error" : "secondary"}
                      startIcon={
                        wishlistLoading[movie.id] ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : wishlistStatus[movie.id] ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(movie);
                      }}
                      disabled={wishlistLoading[movie.id]}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        fontSize: '0.75rem',
                        px: 1,
                        py: 0.5,
                        minWidth: 'auto'
                      }}
                    >
                      {wishlistStatus[movie.id] ? '削除' : '追加'}
                    </Button>
                  </>
                )}

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
              {isAuthenticated && (
                <>
                  <Button 
                    onClick={() => handleWishlistToggle(selectedMovie)} 
                    variant="outlined"
                    color={wishlistStatus[selectedMovie.id] ? "error" : "secondary"}
                    startIcon={
                      wishlistLoading[selectedMovie.id] ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : wishlistStatus[selectedMovie.id] ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )
                    }
                    disabled={wishlistLoading[selectedMovie.id]}
                  >
                    {wishlistStatus[selectedMovie.id] ? 'ウィッシュリストから削除' : 'ウィッシュリストに追加'}
                  </Button>
                  <Button 
                    onClick={() => handleAddToWatchlist(selectedMovie)} 
                    variant="contained"
                    startIcon={<AddIcon />}
                  >
                    視聴記録に追加
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Viewing Record Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          視聴記録を追加
          {selectedMovie && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedMovie.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedMovie && (
            <Box sx={{ pt: 1, pb: 2, display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
              <img
                src={getImageUrl(selectedMovie.poster_path)}
                alt={selectedMovie.title}
                style={{
                  width: '60px',
                  height: '90px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {selectedMovie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatReleaseDate(selectedMovie.release_date)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`★ ${selectedMovie.vote_average?.toFixed(1) || 'N/A'}`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(229,9,20,0.8)',
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    TMDb評価
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography component="legend" gutterBottom>
                あなたの評価 *
              </Typography>
              <Rating
                value={viewingRecord.rating}
                onChange={(event, newValue) => {
                  setViewingRecord(prev => ({ ...prev, rating: newValue }));
                }}
                precision={0.5}
                size="large"
              />
            </Box>
            
            <TextField
              label="視聴日"
              type="date"
              value={viewingRecord.viewingDate}
              onChange={(e) => setViewingRecord(prev => ({ ...prev, viewingDate: e.target.value }))}
              fullWidth
              required
            />
            
            <TheaterSearch
              selectedTheater={selectedTheater}
              onTheaterSelect={(theater) => {
                setSelectedTheater(theater);
                setViewingRecord(prev => ({ 
                  ...prev, 
                  theater: theater ? (theater.displayName || theater.name) : ''
                }));
              }}
              variant="dropdown"
              label="映画館を選択"
            />
            
            <FormControl fullWidth>
              <InputLabel>上映形式</InputLabel>
              <Select
                value={viewingRecord.screeningFormat}
                onChange={(e) => setViewingRecord(prev => ({ ...prev, screeningFormat: e.target.value }))}
                label="上映形式"
              >
                <MenuItem value="">選択なし</MenuItem>
                <MenuItem value="2D">2D</MenuItem>
                <MenuItem value="3D">3D</MenuItem>
                <MenuItem value="IMAX">IMAX</MenuItem>
                <MenuItem value="4DX">4DX</MenuItem>
                <MenuItem value="Dolby Cinema">Dolby Cinema</MenuItem>
                <MenuItem value="その他">その他</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <TextField
                label="レビュー・感想"
                value={viewingRecord.review}
                onChange={(e) => setViewingRecord(prev => ({ ...prev, review: e.target.value }))}
                fullWidth
                multiline
                rows={4}
                placeholder="この映画はどうでしたか？好きなシーン、印象的だった点、感じたことなど自由に記録してください..."
                helperText="後で見返した時に、その時の気持ちを思い出せるような感想を残しましょう"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveViewingRecord} 
            variant="contained"
            disabled={viewingRecord.rating === 0}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Movies;