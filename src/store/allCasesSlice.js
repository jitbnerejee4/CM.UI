
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAllCases = createAsyncThunk(
  'cases/fetchAllCases',
  async () => {
    const response = await axios.get('https://localhost:7288/api/allcases');  
    return response.data;
  }
);

const allCasesSlice = createSlice({
  name: 'cases',
  initialState: {
    data: [],
    status: 'idle', 
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCases.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllCases.fulfilled, (state, action) => {
        state.status = 'succeeded';

        state.data = action.payload; 
      })
      .addCase(fetchAllCases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default allCasesSlice.reducer;
