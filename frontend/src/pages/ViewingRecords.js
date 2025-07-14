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
  TextField,
  Button,
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
  Snackbar,
  IconButton,
  Menu,
  Pagination
} from '@mui/material';
import { 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import axios from 'axios';

const ViewingRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRecordId, setMenuRecordId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchViewingRecords();
  }, [page]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, records]);

  const fetchViewingRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('ログインが必要です', 'error');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/viewing-records?page=${page - 1}&size=${ITEMS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setRecords(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching viewing records:', error);
      showSnackbar(error.response?.data?.message || '記録の取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record =>
      record.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.theater && record.theater.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (record.review && record.review.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredRecords(filtered);
  };

  const handleMenuOpen = (event, recordId) => {
    setAnchorEl(event.currentTarget);
    setMenuRecordId(recordId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRecordId(null);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setEditData({
      rating: record.rating,
      viewingDate: record.viewingDate.slice(0, 10), // Format for date input
      theater: record.theater || '',
      screeningFormat: record.screeningFormat || '',
      review: record.review || ''
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteRecord = (record) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const saveEditedRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('ログインが必要です', 'error');
        return;
      }

      const dataToSend = {
        ...editData,
        viewingDate: editData.viewingDate + 'T12:00:00' // 日付を日時に変換
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/viewing-records/${selectedRecord.id}`,
        dataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        showSnackbar('記録を更新しました', 'success');
        setEditDialogOpen(false);
        fetchViewingRecords();
      }
    } catch (error) {
      console.error('Error updating record:', error);
      showSnackbar(error.response?.data?.message || '更新に失敗しました', 'error');
    }
  };

  const confirmDeleteRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('ログインが必要です', 'error');
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/viewing-records/${selectedRecord.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        showSnackbar('記録を削除しました', 'success');
        setDeleteDialogOpen(false);
        fetchViewingRecords();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      showSnackbar(error.response?.data?.message || '削除に失敗しました', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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

  if (loading && records.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        視聴記録
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="映画タイトル、映画館、レビューで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? '検索結果が見つかりません' : 'まだ視聴記録がありません'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? '別のキーワードで検索してみてください' : '映画を観たら記録してみましょう！'}
          </Typography>
          {!searchQuery && (
            <Button variant="contained" href="/movies">
              映画を探す
            </Button>
          )}
        </Card>
      ) : (
        <>
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
            {filteredRecords.map((record) => (
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)' }}
                    onClick={(e) => handleMenuOpen(e, record.id)}
                  >
                    <MoreVertIcon sx={{ color: 'white' }} />
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="300"
                    image={getImageUrl(record.moviePosterPath)}
                    alt={record.movieTitle}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {record.movieTitle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                        sx={{ mb: 2 }}
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
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {record.review}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const record = records.find(r => r.id === menuRecordId);
          handleEditRecord(record);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          編集
        </MenuItem>
        <MenuItem onClick={() => {
          const record = records.find(r => r.id === menuRecordId);
          handleDeleteRecord(record);
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          削除
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          視聴記録を編集
          {selectedRecord && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedRecord.movieTitle}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography component="legend" gutterBottom>
                評価 *
              </Typography>
              <Rating
                value={editData.rating}
                onChange={(event, newValue) => {
                  setEditData(prev => ({ ...prev, rating: newValue }));
                }}
                precision={0.5}
                size="large"
              />
            </Box>
            
            <TextField
              label="視聴日"
              type="date"
              value={editData.viewingDate}
              onChange={(e) => setEditData(prev => ({ ...prev, viewingDate: e.target.value }))}
              fullWidth
              required
            />
            
            <TextField
              label="映画館"
              value={editData.theater}
              onChange={(e) => setEditData(prev => ({ ...prev, theater: e.target.value }))}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>上映形式</InputLabel>
              <Select
                value={editData.screeningFormat}
                onChange={(e) => setEditData(prev => ({ ...prev, screeningFormat: e.target.value }))}
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
            
            <TextField
              label="レビュー・感想"
              value={editData.review}
              onChange={(e) => setEditData(prev => ({ ...prev, review: e.target.value }))}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={saveEditedRecord} 
            variant="contained"
            disabled={editData.rating === 0}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>記録を削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{selectedRecord?.movieTitle}」の視聴記録を削除しますか？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={confirmDeleteRecord} 
            variant="contained" 
            color="error"
          >
            削除
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

export default ViewingRecords;