import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvestments, addInvestment, updateInvestment, deleteInvestment } from '../../store/slices/investmentSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const InvestmentForm = ({ open, handleClose, investment, handleSubmit }) => {
  const [formData, setFormData] = useState(investment || {
    type: '',
    symbol: '',
    name: '',
    quantity: '',
    purchasePrice: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = () => {
    handleSubmit(formData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{investment ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
          >
            {['stocks', 'bonds', 'mutualFunds', 'etfs', 'crypto', 'realEstate', 'other'].map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            value={formData.purchasePrice}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {investment ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Investments = () => {
  const dispatch = useDispatch();
  const { investments, portfolio, loading } = useSelector((state) => state.investments);
  const [openForm, setOpenForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  const handleAddInvestment = (data) => {
    dispatch(addInvestment(data));
  };

  const handleUpdateInvestment = (data) => {
    dispatch(updateInvestment({ id: selectedInvestment._id, updates: data }));
    setSelectedInvestment(null);
  };

  const handleDeleteInvestment = (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      dispatch(deleteInvestment(id));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Investment Portfolio</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add Investment
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Portfolio Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Portfolio Value
              </Typography>
              <Typography variant="h5">
                {formatCurrency(portfolio?.totalValue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Return
              </Typography>
              <Typography variant="h5" color={portfolio?.totalReturn >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(portfolio?.totalReturn || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Return Percentage
              </Typography>
              <Typography variant="h5" color={portfolio?.totalReturnPercentage >= 0 ? 'success.main' : 'error.main'}>
                {formatPercentage(portfolio?.totalReturnPercentage || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Distribution
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={Object.entries(portfolio?.byType || {}).map(([type, data]) => ({
                    name: type,
                    value: data.value
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {Object.entries(portfolio?.byType || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Investment Performance Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Investment Performance
            </Typography>
            <ResponsiveContainer>
              <LineChart
                data={investments}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="purchaseDate" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="currentValue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Investments Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">Return</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment._id}>
                    <TableCell>{investment.type}</TableCell>
                    <TableCell>{investment.symbol}</TableCell>
                    <TableCell>{investment.name}</TableCell>
                    <TableCell align="right">{investment.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.purchasePrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.currentPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.currentValue)}</TableCell>
                    <TableCell align="right" sx={{
                      color: investment.totalReturn >= 0 ? 'success.main' : 'error.main'
                    }}>
                      {formatPercentage(investment.returnPercentage)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedInvestment(investment);
                          setOpenForm(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteInvestment(investment._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <InvestmentForm
        open={openForm}
        handleClose={() => {
          setOpenForm(false);
          setSelectedInvestment(null);
        }}
        investment={selectedInvestment}
        handleSubmit={selectedInvestment ? handleUpdateInvestment : handleAddInvestment}
      />
    </Box>
  );
};

export default Investments;
