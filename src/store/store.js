import { configureStore } from '@reduxjs/toolkit';
import allCasesReducer from './allCasesSlice';

export const store = configureStore({
  reducer: {
    cases: allCasesReducer,
  },
});