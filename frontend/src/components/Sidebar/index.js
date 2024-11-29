import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BudgetIcon,
  TrackChanges as GoalsIcon,
  People as FamilyIcon,
  Receipt as TransactionsIcon,
  Person as ProfileIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Budget', icon: <BudgetIcon />, path: '/budget' },
  { text: 'Goals', icon: <GoalsIcon />, path: '/goals' },
  { text: 'Family', icon: <FamilyIcon />, path: '/family' },
  { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile' }
];

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          Family Finance
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: 'background.paper'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
