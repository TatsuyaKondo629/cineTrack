import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Groups as GroupsIcon,
  PersonRemove as PersonRemoveIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const FollowManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: '' });

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCurrentUser(response.data.data);
        return response.data.data.id;
      }
    } catch (error) {
      console.error('Current user fetch error:', error);
      setError('ユーザー情報の取得に失敗しました');
    }
    return null;
  };

  const fetchFollowers = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/social/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFollowers(response.data.data);
      }
    } catch (error) {
      console.error('Followers fetch error:', error);
      setError('フォロワー情報の取得に失敗しました');
    }
  };

  const fetchFollowing = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/social/users/${userId}/following`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFollowing(response.data.data);
      }
    } catch (error) {
      console.error('Following fetch error:', error);
      setError('フォロー中ユーザー情報の取得に失敗しました');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/social/users/${userId}/follow`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // フォロー中リストから削除
      setFollowing(prev => prev.filter(user => user.id !== userId));
      setConfirmDialog({ open: false, user: null, action: '' });
    } catch (error) {
      console.error('Unfollow error:', error);
      setError('フォロー解除に失敗しました');
    }
  };

  const handleRemoveFollower = async (userId) => {
    // この機能は通常のSNSでは実装されませんが、
    // 必要に応じてブロック機能として実装可能
    setConfirmDialog({ open: false, user: null, action: '' });
    setError('フォロワーの削除機能は現在実装されていません');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const openConfirmDialog = (user, action) => {
    setConfirmDialog({ open: true, user, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, user: null, action: '' });
  };

  const executeAction = () => {
    const { user, action } = confirmDialog;
    if (action === 'unfollow') {
      handleUnfollow(user.id);
    } else if (action === 'remove') {
      handleRemoveFollower(user.id);
    }
  };

  const filteredFollowers = followers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFollowing = following.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderUserList = (userList, isFollowing = false) => (
    <List>
      {userList.length === 0 ? (
        <ListItem>
          <ListItemText 
            primary={
              searchQuery 
                ? "検索結果が見つかりません" 
                : isFollowing 
                  ? "フォロー中のユーザーがいません" 
                  : "フォロワーがいません"
            }
            sx={{ textAlign: 'center' }}
          />
        </ListItem>
      ) : (
        userList.map((user) => (
          <ListItem 
            key={user.id}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
                onClick={() => navigate(`/users/${user.id}`)}
              >
                {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    {user.displayName || user.username}
                  </Typography>
                  {user.isMutualFollow && (
                    <Chip size="small" label="相互フォロー" color="success" />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    @{user.username}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip 
                      size="small" 
                      icon={<GroupsIcon />}
                      label={`${user.followerCount || 0} フォロワー`} 
                    />
                    <Chip 
                      size="small" 
                      icon={<MovieIcon />}
                      label={`${user.totalMovieCount || 0} 映画`} 
                    />
                    {user.averageRating && (
                      <Chip 
                        size="small" 
                        icon={<StarIcon />}
                        label={`★${user.averageRating.toFixed(1)}`} 
                      />
                    )}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/users/${user.id}/viewing-records`)}
                  title="視聴記録を見る"
                >
                  <VisibilityIcon />
                </IconButton>
                {isFollowing ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<PersonRemoveIcon />}
                    onClick={() => openConfirmDialog(user, 'unfollow')}
                  >
                    フォロー解除
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<PersonRemoveIcon />}
                    onClick={() => openConfirmDialog(user, 'remove')}
                    disabled
                  >
                    削除
                  </Button>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      )}
    </List>
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userId = await fetchCurrentUser();
      if (userId) {
        await Promise.all([
          fetchFollowers(userId),
          fetchFollowing(userId)
        ]);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography>読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupsIcon fontSize="large" />
        フォロー管理
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 統計情報 */}
      {currentUser && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <Box>
                <Typography variant="h4" color="primary">
                  {followers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  フォロワー
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h4" color="primary">
                  {following.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  フォロー中
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h4" color="success.main">
                  {following.filter(user => user.isMutualFollow).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  相互フォロー
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 検索フィールド */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="ユーザーを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={`フォロワー (${filteredFollowers.length})`} />
            <Tab label={`フォロー中 (${filteredFollowing.length})`} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {activeTab === 0 && renderUserList(filteredFollowers, false)}
          {activeTab === 1 && renderUserList(filteredFollowing, true)}
        </CardContent>
      </Card>

      {/* 確認ダイアログ */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog.action === 'unfollow' ? 'フォロー解除の確認' : 'フォロワー削除の確認'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.user && (
              <>
                {confirmDialog.action === 'unfollow' 
                  ? `${confirmDialog.user.displayName || confirmDialog.user.username} のフォローを解除しますか？`
                  : `${confirmDialog.user.displayName || confirmDialog.user.username} をフォロワーから削除しますか？`
                }
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>キャンセル</Button>
          <Button 
            onClick={executeAction} 
            color={confirmDialog.action === 'unfollow' ? 'secondary' : 'error'}
            variant="contained"
          >
            {confirmDialog.action === 'unfollow' ? 'フォロー解除' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FollowManagement;