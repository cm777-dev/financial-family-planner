import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Header = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
          Financial Family Planner
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="primary">
            <NotificationsIcon />
          </IconButton>

          {user ? (
            <>
              <Button
                onClick={handleMenu}
                startIcon={
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    alt={`${user.firstName} ${user.lastName}`}
                    src={user.avatar}
                  >
                    {user.firstName[0]}
                  </Avatar>
                }
                sx={{ textTransform: 'none', color: 'text.primary' }}
              >
                {!isMobile && `${user.firstName} ${user.lastName}`}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="primary" variant="contained" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
