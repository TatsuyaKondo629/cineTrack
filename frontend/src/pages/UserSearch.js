import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Avatar,
  Button,
  Chip,
  Grid,
  IconButton,
  Pagination,
  Alert,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Groups as GroupsIcon,
  Movie as MovieIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  const searchUsers = async (query = searchQuery, page = 0) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const params = { page, size: 12 };
      if (query && query.trim()) {
        params.query = query.trim();
      }
      
      const response = await axios.get(`${API_BASE_URL}/social/users/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setUsers(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements);
      } else {
        setError(response.data.message || 'ユーザー検索に失敗しました');
      }
    } catch (error) {
      console.error('User search error:', error);
      setError('ユーザー検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem('token');
      const method = isFollowing ? 'delete' : 'post';
      
      await axios({
        method,
        url: `${API_BASE_URL}/social/users/${userId}/follow`,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ユーザーリストを更新
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                isFollowing: !isFollowing,
                followerCount: isFollowing ? user.followerCount - 1 : user.followerCount + 1
              }
            : user
        )
      );
    } catch (error) {
      console.error('Follow toggle error:', error);
      setError(isFollowing ? 'フォロー解除に失敗しました' : 'フォローに失敗しました');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchUsers(searchQuery, 0);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    searchUsers(searchQuery, page - 1);
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  useEffect(() => {
    searchUsers('', 0);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="large" />
          ユーザー検索
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="ユーザー名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button type="submit" variant="contained" size="small">
                    検索
                  </Button>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {totalElements > 0 ? `${totalElements}人のユーザーが見つかりました` : 'ユーザーが見つかりませんでした'}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>検索中...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, elevation 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    elevation: 4
                  }
                }}
                onClick={() => handleUserClick(user.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mr: 2,
                        bgcolor: 'primary.main'
                      }}
                    >
                      {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" noWrap>
                        {user.displayName || user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<GroupsIcon />}
                      label={`${user.followerCount || 0} フォロワー`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<MovieIcon />}
                      label={`${user.totalMovieCount || 0} 映画`}
                      variant="outlined"
                      size="small"
                    />
                    {user.averageRating && (
                      <Chip
                        icon={<StarIcon />}
                        label={`★${user.averageRating.toFixed(1)}`}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  {user.isMutualFollow && (
                    <Chip
                      label="相互フォロー"
                      color="success"
                      variant="filled"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title={user.isFollowing ? 'フォロー解除' : 'フォロー'}>
                      <IconButton
                        color={user.isFollowing ? "secondary" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(user.id, user.isFollowing);
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: user.isFollowing 
                              ? 'rgba(244, 67, 54, 0.1)' 
                              : 'rgba(25, 118, 210, 0.1)'
                          }
                        }}
                      >
                        {user.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
    </Container>
  );
};

export default UserSearch;