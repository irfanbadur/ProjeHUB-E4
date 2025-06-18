// redux/snapSlice.js
import { createSlice } from '@reduxjs/toolkit';

const snapSlice = createSlice({
  name: 'snap',
  initialState: {
    snapPoints: []
  },
  reducers: {
    setSnapPoints: (state, action) => {
      state.snapPoints = action.payload;
    },
    clearSnapPoints: (state) => {
      state.snapPoints = [];
    }
  }
});

export const { setSnapPoints, clearSnapPoints } = snapSlice.actions;
export default snapSlice.reducer;
