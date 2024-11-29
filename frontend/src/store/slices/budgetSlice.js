import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchBudget = createAsyncThunk(
  'budget/fetchBudget',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/budget/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/budget`, budgetData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async ({ budgetId, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/budget/${budgetId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  currentBudget: null,
  budgetHistory: [],
  loading: false,
  error: null,
  categories: [
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Savings',
    'Entertainment',
    'Education',
    'Shopping'
  ]
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearBudgetError: (state) => {
      state.error = null;
    },
    addCategory: (state, action) => {
      state.categories.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budget
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBudget = action.payload;
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch budget';
      })
      // Create Budget
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBudget = action.payload;
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create budget';
      })
      // Update Budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBudget = action.payload;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update budget';
      });
  }
});

export const { clearBudgetError, addCategory } = budgetSlice.actions;
export default budgetSlice.reducer;
