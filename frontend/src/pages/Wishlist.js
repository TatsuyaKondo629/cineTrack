import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import TheaterSearch from '../components/TheaterSearch';
import axios from 'axios';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingRecordDialogOpen, setViewingRecordDialogOpen] = useState(false);
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

  const fetchWishlist = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('認証が必要です');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlist(response.data.data);
      } else {
        setError('ウィッシュリストの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('ウィッシュリストの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (tmdbMovieId) => {
    try {
      setRemoving(tmdbMovieId);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_BASE_URL}/wishlist/remove/${tmdbMovieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlist(prev => prev.filter(item => item.tmdbMovieId !== tmdbMovieId));
      } else {
        setError('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('削除に失敗しました');
    } finally {
      setRemoving(null);
    }
  };

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_BASE_URL}/wishlist/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlist([]);
        setClearDialogOpen(false);
      } else {
        setError('クリアに失敗しました');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setError('クリアに失敗しました');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  const handleMovieClick = (item) => {
    // ウィッシュリストアイテムを映画オブジェクト形式に変換
    const movie = {
      id: item.tmdbMovieId,
      title: item.movieTitle,
      original_title: item.movieTitle,
      overview: item.movieOverview,
      poster_path: item.moviePosterPath,
      release_date: item.movieReleaseDate,
      vote_average: item.movieVoteAverage,
      vote_count: 0, // ウィッシュリストには投票数が保存されていない
      popularity: 0,
      original_language: 'ja'
    };
    setSelectedMovie(movie);
    setDetailsDialogOpen(true);
  };

  const handleAddToViewingRecord = (movie) => {
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
    setViewingRecordDialogOpen(true);
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
        setViewingRecordDialogOpen(false);
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

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ウィッシュリスト
          </Typography>
          <Typography variant="body1" color="text.secondary">
            気になる映画をお気に入りリストで管理しましょう
          </Typography>
        </Box>
        {wishlist.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={() => setClearDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            すべてクリア
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {wishlist.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8, backgroundColor: 'grey.50' }}>
          <CardContent>
            <FavoriteBorderIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ウィッシュリストは空です
            </Typography>
            <Typography variant="body2" color="text.secondary">
              映画を検索してお気に入りに追加してみましょう
            </Typography>
          </CardContent>
        </Card>
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
          {wishlist.map((item) => (
            <Box key={item.id}>
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
                    '& .delete-button': {
                      opacity: 1
                    }
                  }
                }}
                onClick={() => handleMovieClick(item)}
              >
                <CardMedia
                  className="movie-poster"
                  component="img"
                  image={getPosterUrl(item.moviePosterPath)}
                  alt={item.movieTitle}
                  sx={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2,
                    transition: 'box-shadow 0.3s ease'
                  }}
                />
                
                <Button
                  className="delete-button"
                  variant="contained"
                  color="error"
                  startIcon={
                    removing === item.tmdbMovieId ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteIcon />
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item.tmdbMovieId);
                  }}
                  disabled={removing === item.tmdbMovieId}
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
                  削除
                </Button>

                <FavoriteIcon
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    color: 'error.main',
                    fontSize: 28
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
                    {item.movieTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="rgba(255,255,255,0.8)">
                      {formatDate(item.movieReleaseDate)}
                    </Typography>
                    {item.movieVoteAverage && (
                      <Chip 
                        label={`★ ${item.movieVoteAverage.toFixed(1)}`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(229,9,20,0.8)',
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ClearIcon sx={{ mr: 1, color: 'error.main' }} />
            ウィッシュリストをクリア
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            すべてのウィッシュリストアイテムを削除しますか？
            この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={clearWishlist} 
            color="error" 
            variant="contained"
            startIcon={<ClearIcon />}
          >
            クリア
          </Button>
        </DialogActions>
      </Dialog>

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
                    src={getPosterUrl(selectedMovie.poster_path)}
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
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                閉じる
              </Button>
              <Button 
                onClick={() => handleAddToViewingRecord(selectedMovie)} 
                variant="contained"
                startIcon={<AddIcon />}
              >
                視聴記録に追加
              </Button>
              <Button 
                onClick={() => {
                  removeFromWishlist(selectedMovie.id);
                  setDetailsDialogOpen(false);
                }} 
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={removing === selectedMovie.id}
              >
                ウィッシュリストから削除
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Viewing Record Dialog */}
      <Dialog open={viewingRecordDialogOpen} onClose={() => setViewingRecordDialogOpen(false)} maxWidth="sm" fullWidth>
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
                src={getPosterUrl(selectedMovie.poster_path)}
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
          <Button onClick={() => setViewingRecordDialogOpen(false)}>
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
    </Container>
  );
};

export default Wishlist;