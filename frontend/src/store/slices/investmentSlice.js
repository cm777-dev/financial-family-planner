import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchInvestments = createAsyncThunk(
  'investments/fetchInvestments',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addInvestment = createAsyncThunk(
  'investments/addInvestment',
  async (investmentData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/investments`, investmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateInvestment = createAsyncThunk(
  'investments/updateInvestment',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/investments/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteInvestment = createAsyncThunk(
  'investments/deleteInvestment',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/investments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPortfolioSummary = createAsyncThunk(
  'investments/fetchPortfolioSummary',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/investments/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  investments: [],
  portfolio: null,
  loading: false,
  error: null
};

const investmentSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Investments
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch investments';
      })
      // Add Investment
      .addCase(addInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.investments.push(action.payload);
      })
      .addCase(addInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add investment';
      })
      // Update Investment
      .addCase(updateInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investments.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.investments[index] = action.payload;
        }
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update investment';
      })
      // Delete Investment
      .addCase(deleteInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = state.investments.filter(inv => inv._id !== action.payload);
      })
      .addCase(deleteInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete investment';
      })
      // Fetch Portfolio Summary
      .addCase(fetchPortfolioSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolioSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch portfolio summary';
      });
  }
});

export const { clearError } = investmentSlice.actions;
export default investmentSlice.reducer;
