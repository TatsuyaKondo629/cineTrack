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
  Avatar
} from '@mui/material';
import { 
  Movie as MovieIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <MovieIcon sx={{ mr: 2 }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 0, 
            mr: 4,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/')}
        >
          CineTrack
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
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
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  ダッシュボード
                </MenuItem>
                <MenuItem onClick={() => { navigate('/viewing-records'); handleMenuClose(); }}>
                  <ListIcon sx={{ mr: 1 }} />
                  視聴記録
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  ログアウト
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
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
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;