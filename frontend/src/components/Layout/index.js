import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from '../Sidebar';
import Header from '../Header';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onMenuClick={toggleSidebar} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: 'background.default',
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
