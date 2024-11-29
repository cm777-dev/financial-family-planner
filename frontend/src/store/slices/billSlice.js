import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchBills = createAsyncThunk(
  'bills/fetchBills',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUpcomingBills = createAsyncThunk(
  'bills/fetchUpcomingBills',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bills/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addBill = createAsyncThunk(
  'bills/addBill',
  async (billData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/bills`, billData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBill = createAsyncThunk(
  'bills/updateBill',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/bills/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteBill = createAsyncThunk(
  'bills/deleteBill',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendBillReminder = createAsyncThunk(
  'bills/sendReminder',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/bills/${id}/remind`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  bills: [],
  upcomingBills: [],
  loading: false,
  error: null
};

const billSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bills
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bills';
      })
      // Fetch Upcoming Bills
      .addCase(fetchUpcomingBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingBills.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingBills = action.payload;
      })
      .addCase(fetchUpcomingBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch upcoming bills';
      })
      // Add Bill
      .addCase(addBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills.push(action.payload);
      })
      .addCase(addBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add bill';
      })
      // Update Bill
      .addCase(updateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bills.findIndex(bill => bill._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update bill';
      })
      // Delete Bill
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.filter(bill => bill._id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete bill';
      })
      // Send Reminder
      .addCase(sendBillReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendBillReminder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendBillReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send reminder';
      });
  }
});

export const { clearError } = billSlice.actions;
export default billSlice.reducer;
