import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import budgetReducer from './slices/budgetSlice';
import transactionsReducer from './slices/transactionsSlice';
import goalsReducer from './slices/goalsSlice';
import familyReducer from './slices/familySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    budget: budgetReducer,
    transactions: transactionsReducer,
    goals: goalsReducer,
    family: familyReducer,
  },
});

export default store;
