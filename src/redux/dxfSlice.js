// src/redux/slices/dxfSlice.js
import { createSlice } from '@reduxjs/toolkit';

const dxfSlice = createSlice({
  name: 'dxf',
  initialState: {
    data: null, // DXF JSON verisi
  },
  reducers: {
    
    setDxfData: (state, action) => {
  console.log("DXF dxfSlice : ",action.payload)  

      state.data = action.payload;
    },
    clearDxfData: (state) => {
      state.data = null;
    },
  },
});

export const { setDxfData, clearDxfData } = dxfSlice.actions;
export default dxfSlice.reducer;
