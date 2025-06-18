// src/redux/slices/layerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const layerSlice = createSlice({
  name: 'layers',
  initialState: {
    allLayers: [],
  },
  reducers: {
    setLayers: (state, action) => {
      state.allLayers = action.payload;
    },
    clearLayers: (state) => {
      state.allLayers = [];
    },
  },
});

export const { setLayers, clearLayers } = layerSlice.actions;
export default layerSlice.reducer;
