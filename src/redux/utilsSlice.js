// src/redux/utilsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const utilsSlice = createSlice({
  name: 'utils',
  initialState: {
    lastBasePoint: { x: 0, y: 0 },
  },
  reducers: {
    setLastBasePoint: (state, action) => {
      state.lastBasePoint = action.payload;
    },
 
  },
});

export const { setLastBasePoint } = utilsSlice.actions;
export default utilsSlice.reducer;
