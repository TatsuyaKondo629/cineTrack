import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Grid,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Groups as GroupsIcon,
  Movie as MovieIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfileSkeleton } from '../components/common/SkeletonLoader';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/social/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError(response.data.message || 'ユーザー情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('User profile fetch error:', error);
      if (error.response?.status === 404) {
        setError('ユーザーが見つかりません');
      } else {
        setError('ユーザー情報の取得中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
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
    }
  };

  const fetchFollowing = async () => {
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
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = user.isFollowing ? 'delete' : 'post';
      
      await axios({
        method,
        url: `${API_BASE_URL}/social/users/${userId}/follow`,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(prevUser => ({
        ...prevUser,
        isFollowing: !prevUser.isFollowing,
        followerCount: prevUser.isFollowing 
          ? prevUser.followerCount - 1 
          : prevUser.followerCount + 1
      }));
    } catch (error) {
      console.error('Follow toggle error:', error);
      setError(user.isFollowing ? 'フォロー解除に失敗しました' : 'フォローに失敗しました');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && followers.length === 0) {
      fetchFollowers();
    } else if (newValue === 2 && following.length === 0) {
      fetchFollowing();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderUserList = (userList) => (
    <List>
      {userList.length === 0 ? (
        <ListItem>
          <ListItemText 
            primary="ユーザーがいません" 
            sx={{ textAlign: 'center' }}
          />
        </ListItem>
      ) : (
        userList.map((user) => (
          <ListItem 
            key={user.id}
            button
            onClick={() => navigate(`/users/${user.id}`)}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.displayName || user.username}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip size="small" label={`${user.followerCount || 0} フォロワー`} />
                  <Chip size="small" label={`${user.totalMovieCount || 0} 映画`} />
                  {user.isMutualFollow && (
                    <Chip size="small" label="相互フォロー" color="success" />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))
      )}
    </List>
  );

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">ユーザーが見つかりません</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* プロフィール情報 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}
                </Avatar>
                
                <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                  {user.displayName || user.username}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  @{user.username}
                </Typography>

                {user.isMutualFollow && (
                  <Chip
                    label="相互フォロー"
                    color="success"
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                )}

                {user.isFollowing !== null && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant={user.isFollowing ? "outlined" : "contained"}
                      color={user.isFollowing ? "secondary" : "primary"}
                      startIcon={user.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={handleFollowToggle}
                    >
                      {user.isFollowing ? 'フォロー解除' : 'フォロー'}
                    </Button>
                    
                    {(user.isFollowing || user.isFollowedBy) && (
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/users/${userId}/viewing-records`)}
                      >
                        視聴記録
                      </Button>
                    )}
                  </Box>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* 統計情報 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  統計情報
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <GroupsIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6">{user.followerCount || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        フォロワー
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">{user.followingCount || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        フォロー中
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <MovieIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6">{user.totalMovieCount || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        視聴映画
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <StarIcon color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h6">
                        {user.averageRating ? user.averageRating.toFixed(1) : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        平均評価
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* ユーザー情報 */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  ユーザー情報
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formatDate(user.createdAt)}に参加
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* タブコンテンツ */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="プロフィール" />
                <Tab label={`フォロワー (${user.followerCount || 0})`} />
                <Tab label={`フォロー中 (${user.followingCount || 0})`} />
              </Tabs>
            </Box>

            <CardContent>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    プロフィール
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {user.bio || 'プロフィールが設定されていません。'}
                  </Typography>
                  
                  {/* 将来的に視聴記録一覧などを表示 */}
                  <Typography variant="body2" color="text.secondary">
                    視聴記録や詳細な統計情報は今後のアップデートで追加予定です。
                  </Typography>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    フォロワー
                  </Typography>
                  {renderUserList(followers)}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    フォロー中
                  </Typography>
                  {renderUserList(following)}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;