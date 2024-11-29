import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBudget } from '../../store/slices/budgetSlice';

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentBudget, loading } = useSelector((state) => state.budget);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchBudget({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear()
    }));
  }, [dispatch, currentDate]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const categoryData = currentBudget?.categories.map(cat => ({
    name: cat.name,
    budget: cat.limit,
    spent: cat.spent
  })) || [];

  const spendingData = categoryData.map(cat => ({
    name: cat.name,
    value: cat.spent
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h5">
                ${currentBudget?.totalBudget?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h5">
                ${categoryData.reduce((acc, curr) => acc + curr.spent, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h5">
                ${(currentBudget?.totalBudget - 
                   categoryData.reduce((acc, curr) => acc + curr.spent, 0))
                   ?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget vs Spending Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Spending by Category
            </Typography>
            <ResponsiveContainer>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill={theme.palette.primary.main} name="Budget" />
                <Bar dataKey="spent" fill={theme.palette.secondary.main} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Spending Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending Distribution
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={spendingData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
