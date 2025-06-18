import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snapMode: false,
  objectSnap: false,
  orthoMode: false, // Yeni eklendi
};

const modsSlice = createSlice({
  name: "mods",
  initialState,
  reducers: {
    toggleSnapMode: (state) => {
      state.snapMode = !state.snapMode;
    },
    setSnapMode: (state, action) => {
      state.snapMode = action.payload;
    },
    toggleObjectSnap: (state) => {
      state.objectSnap = !state.objectSnap;
    },
    setObjectSnap: (state, action) => {
      state.objectSnap = action.payload;
    },
    // Yeni ortho mod reducerları:
    toggleOrthoMode: (state) => {
      state.orthoMode = !state.orthoMode;
    },
    setOrthoMode: (state, action) => {
      state.orthoMode = action.payload;
    },
  }
});

export const {
  toggleSnapMode,
  setSnapMode,
  toggleObjectSnap,
  setObjectSnap,
  toggleOrthoMode,
  setOrthoMode, // Yeni eklenenler
} = modsSlice.actions;

export default modsSlice.reducer;
