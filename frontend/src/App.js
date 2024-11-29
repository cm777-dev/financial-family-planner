import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import theme from './theme';
import store from './store';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import FamilyMembers from './pages/FamilyMembers';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="budget" element={<Budget />} />
              <Route path="goals" element={<Goals />} />
              <Route path="family" element={<FamilyMembers />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
