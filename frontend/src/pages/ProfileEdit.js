import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [originalData, setOriginalData] = useState({});

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        const profileData = {
          username: userData.username || '',
          email: userData.email || '',
          displayName: userData.displayName || '',
          bio: userData.bio || '',
          avatarUrl: userData.avatarUrl || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        setFormData(profileData);
        setOriginalData(profileData);
      } else {
        setError(response.data.message || 'プロフィールの取得に失敗しました');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('プロフィールの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('ユーザー名は必須です');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('メールアドレスは必須です');
      return false;
    }
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません');
      return false;
    }
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const updateData = {
        username: formData.username,
        email: formData.email,
        displayName: formData.displayName || null,
        bio: formData.bio || null,
        avatarUrl: formData.avatarUrl || null
      };
      
      // パスワード変更がある場合のみ追加
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }
      
      const response = await axios.put(`${API_BASE_URL}/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccess('プロフィールを更新しました');
        setUser(response.data.data);
        
        // パスワード関連フィールドをクリア
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        setPasswordDialogOpen(false);
        
        // 3秒後にユーザー検索ページにリダイレクト
        setTimeout(() => {
          navigate('/users');
        }, 2000);
      } else {
        setError(response.data.message || 'プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.status === 400) {
        setError(error.response.data.message || 'プロフィールの更新に失敗しました');
      } else {
        setError('プロフィールの更新中にエラーが発生しました');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setError('');
    setSuccess('');
    setPasswordDialogOpen(false);
  };

  const openPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  useEffect(() => {
    fetchUserProfile();
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
        <EditIcon fontSize="large" />
        プロフィール編集
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* プロフィール写真 */}
            <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={formData.avatarUrl}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  {formData.displayName ? formData.displayName[0].toUpperCase() : formData.username[0].toUpperCase()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: -8,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                  size="small"
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                label="アバター画像URL"
                value={formData.avatarUrl}
                onChange={handleInputChange('avatarUrl')}
                sx={{ mt: 2 }}
                placeholder="画像のURLを入力してください"
              />
            </Grid>

            {/* 基本情報 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ユーザー名"
                value={formData.username}
                onChange={handleInputChange('username')}
                required
                helperText="3文字以上20文字以下"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="表示名"
                value={formData.displayName}
                onChange={handleInputChange('displayName')}
                helperText="プロフィールに表示される名前（50文字以下）"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="プロフィール"
                multiline
                rows={4}
                value={formData.bio}
                onChange={handleInputChange('bio')}
                helperText="自己紹介文（500文字以下）"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="h6">パスワード変更</Typography>
                <Button
                  variant="outlined"
                  onClick={openPasswordDialog}
                  startIcon={<EditIcon />}
                >
                  パスワードを変更
                </Button>
              </Box>
            </Grid>

            {/* 操作ボタン */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                >
                  キャンセル
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={<SaveIcon />}
                >
                  {saving ? '保存中...' : '保存'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* パスワード変更ダイアログ */}
      <Dialog open={passwordDialogOpen} onClose={closePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>パスワード変更</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="現在のパスワード"
              type={showPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="新しいパスワード"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              margin="normal"
              helperText="6文字以上で入力してください"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="新しいパスワード（確認）"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              margin="normal"
              error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== ''}
              helperText={
                formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== ''
                  ? 'パスワードが一致しません'
                  : ''
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog}>キャンセル</Button>
          <Button 
            onClick={() => setPasswordDialogOpen(false)} 
            variant="contained"
            disabled={!formData.currentPassword || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
          >
            設定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileEdit;