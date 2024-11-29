import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  fetchBills,
  fetchUpcomingBills,
  addBill,
  updateBill,
  deleteBill,
  sendBillReminder
} from '../../store/slices/billSlice';

const Bills = () => {
  const dispatch = useDispatch();
  const { bills, upcomingBills, loading, error } = useSelector((state) => state.bills);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: null,
    category: '',
    isRecurring: false,
    frequency: 'monthly',
    reminders: []
  });

  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchUpcomingBills());
  }, [dispatch]);

  const handleOpenDialog = (bill = null) => {
    if (bill) {
      setSelectedBill(bill);
      setFormData({
        name: bill.name,
        amount: bill.amount,
        dueDate: new Date(bill.dueDate),
        category: bill.category,
        isRecurring: bill.isRecurring,
        frequency: bill.frequency || 'monthly',
        reminders: bill.reminders || []
      });
    } else {
      setSelectedBill(null);
      setFormData({
        name: '',
        amount: '',
        dueDate: null,
        category: '',
        isRecurring: false,
        frequency: 'monthly',
        reminders: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBill(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedBill) {
        await dispatch(updateBill({ id: selectedBill._id, updates: formData })).unwrap();
        setSnackbar({ open: true, message: 'Bill updated successfully', severity: 'success' });
      } else {
        await dispatch(addBill(formData)).unwrap();
        setSnackbar({ open: true, message: 'Bill added successfully', severity: 'success' });
      }
      handleCloseDialog();
      dispatch(fetchBills());
      dispatch(fetchUpcomingBills());
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An error occurred', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBill(id)).unwrap();
      setSnackbar({ open: true, message: 'Bill deleted successfully', severity: 'success' });
      dispatch(fetchBills());
      dispatch(fetchUpcomingBills());
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An error occurred', severity: 'error' });
    }
  };

  const handleSendReminder = async (id) => {
    try {
      await dispatch(sendBillReminder(id)).unwrap();
      setSnackbar({ open: true, message: 'Reminder sent successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to send reminder', severity: 'error' });
    }
  };

  const renderBillList = (bills, title) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {bills.map((bill) => (
        <Paper
          key={bill._id}
          elevation={2}
          sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="subtitle1">{bill.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Due: {new Date(bill.dueDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amount: ${bill.amount}
            </Typography>
            {bill.isRecurring && (
              <Chip
                label={`Recurring ${bill.frequency}`}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => handleSendReminder(bill._id)}
              title="Send reminder"
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(bill)}
              title="Edit bill"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(bill._id)}
              title="Delete bill"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}
      {bills.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          No bills found
        </Typography>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Bills</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Bill
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderBillList(bills, 'All Bills')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderBillList(upcomingBills, 'Upcoming Bills')}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBill ? 'Edit Bill' : 'Add New Bill'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Bill Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) => setFormData({ ...formData, dueDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
                required
              >
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="rent">Rent/Mortgage</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="subscription">Subscription</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Recurring</InputLabel>
              <Select
                value={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.value })}
                label="Recurring"
              >
                <MenuItem value={false}>No</MenuItem>
                <MenuItem value={true}>Yes</MenuItem>
              </Select>
            </FormControl>
            {formData.isRecurring && (
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  label="Frequency"
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBill ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Bills;
