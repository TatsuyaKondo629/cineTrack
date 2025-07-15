import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Movie as MovieIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  List as ListIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Favorite as FavoriteIcon,
  Analytics as AnalyticsIcon,
  LocationOn as TheaterIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    setDrawerOpen(false);
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleDrawerClose();
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { text: '映画を探す', path: '/movies', icon: <SearchIcon /> },
    { text: '映画館検索', path: '/theaters', icon: <TheaterIcon /> },
    ...(isAuthenticated ? [
      { text: 'ダッシュボード', path: '/dashboard', icon: <DashboardIcon /> },
      { text: '視聴記録', path: '/viewing-records', icon: <ListIcon /> },
      { text: 'ウィッシュリスト', path: '/wishlist', icon: <FavoriteIcon /> },
      { text: '統計・分析', path: '/statistics', icon: <AnalyticsIcon /> },
      { text: 'ユーザー検索', path: '/users', icon: <PeopleIcon /> },
      { text: 'フォロー管理', path: '/follow-management', icon: <GroupIcon /> },
      { text: 'アクティビティ', path: '/activity-feed', icon: <TimelineIcon /> }
    ] : []),
    ...(!isAuthenticated ? [
      { text: 'ログイン', path: '/login', icon: <LoginIcon /> },
      { text: '新規登録', path: '/register', icon: <PersonAddIcon /> }
    ] : [])
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* ハンバーガーメニューボタン（モバイル・タブレット） */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* ロゴとタイトル */}
          <MovieIcon sx={{ mr: 2 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => navigate('/')}
          >
            CineTrack
          </Typography>

          {/* デスクトップ用ナビゲーション */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/movies')}
                sx={{ 
                  fontWeight: isActive('/movies') ? 'bold' : 'normal',
                  textDecoration: isActive('/movies') ? 'underline' : 'none'
                }}
              >
                映画を探す
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/theaters')}
                startIcon={<TheaterIcon />}
                sx={{ 
                  fontWeight: isActive('/theaters') ? 'bold' : 'normal',
                  textDecoration: isActive('/theaters') ? 'underline' : 'none'
                }}
              >
                映画館検索
              </Button>
              
              {isAuthenticated && (
                <>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/dashboard')}
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                      textDecoration: isActive('/dashboard') ? 'underline' : 'none'
                    }}
                  >
                    ダッシュボード
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/viewing-records')}
                    startIcon={<ListIcon />}
                    sx={{ 
                      fontWeight: isActive('/viewing-records') ? 'bold' : 'normal',
                      textDecoration: isActive('/viewing-records') ? 'underline' : 'none'
                    }}
                  >
                    視聴記録
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/statistics')}
                    startIcon={<AnalyticsIcon />}
                    sx={{ 
                      fontWeight: isActive('/statistics') ? 'bold' : 'normal',
                      textDecoration: isActive('/statistics') ? 'underline' : 'none'
                    }}
                  >
                    統計・分析
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/wishlist')}
                    startIcon={<FavoriteIcon />}
                    sx={{ 
                      fontWeight: isActive('/wishlist') ? 'bold' : 'normal',
                      textDecoration: isActive('/wishlist') ? 'underline' : 'none'
                    }}
                  >
                    ウィッシュリスト
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/users')}
                    startIcon={<PeopleIcon />}
                    sx={{ 
                      fontWeight: isActive('/users') ? 'bold' : 'normal',
                      textDecoration: isActive('/users') ? 'underline' : 'none'
                    }}
                  >
                    ユーザー検索
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/follow-management')}
                    startIcon={<GroupIcon />}
                    sx={{ 
                      fontWeight: isActive('/follow-management') ? 'bold' : 'normal',
                      textDecoration: isActive('/follow-management') ? 'underline' : 'none'
                    }}
                  >
                    フォロー管理
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/activity-feed')}
                    startIcon={<TimelineIcon />}
                    sx={{ 
                      fontWeight: isActive('/activity-feed') ? 'bold' : 'normal',
                      textDecoration: isActive('/activity-feed') ? 'underline' : 'none'
                    }}
                  >
                    アクティビティ
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* ユーザーメニュー */}
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                    <DashboardIcon sx={{ mr: 1 }} />
                    ダッシュボード
                  </MenuItem>
                )}
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/viewing-records'); handleMenuClose(); }}>
                    <ListIcon sx={{ mr: 1 }} />
                    視聴記録
                  </MenuItem>
                )}
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/statistics'); handleMenuClose(); }}>
                    <AnalyticsIcon sx={{ mr: 1 }} />
                    統計・分析
                  </MenuItem>
                )}
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/wishlist'); handleMenuClose(); }}>
                    <FavoriteIcon sx={{ mr: 1 }} />
                    ウィッシュリスト
                  </MenuItem>
                )}
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/users'); handleMenuClose(); }}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    ユーザー検索
                  </MenuItem>
                )}
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/follow-management'); handleMenuClose(); }}>
                    <GroupIcon sx={{ mr: 1 }} />
                    フォロー管理
                  </MenuItem>
                )}
                {isMobile && (
                  <MenuItem onClick={() => { navigate('/activity-feed'); handleMenuClose(); }}>
                    <TimelineIcon sx={{ mr: 1 }} />
                    アクティビティ
                  </MenuItem>
                )}
                <MenuItem onClick={() => { navigate('/profile/edit'); handleMenuClose(); }}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  プロフィール編集
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  ログアウト
                </MenuItem>
              </Menu>
            </>
          ) : (
            !isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    fontWeight: isActive('/login') ? 'bold' : 'normal'
                  }}
                >
                  ログイン
                </Button>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/register')}
                  sx={{ 
                    fontWeight: isActive('/register') ? 'bold' : 'normal'
                  }}
                >
                  新規登録
                </Button>
              </Box>
            )
          )}
        </Toolbar>
      </AppBar>

      {/* ハンバーガーメニュー用Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240 
          },
        }}
      >
        <Box sx={{ width: 240, pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="ログアウト" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;