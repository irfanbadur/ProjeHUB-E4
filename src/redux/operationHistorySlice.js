import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  past: [],
  present: null,
  future: [],
};

const operationHistorySlice = createSlice({
  name: 'operationHistory',
  initialState,
  reducers: {
    addAction: (state, action) => {
        if (state.present !== null) {
          state.past.push(state.present);
        }
        state.present = action.payload;
        state.future = [];
      },
      
    undoAction: (state) => {
      if (state.past.length === 0) return;
      const previous = state.past.pop();
      if (state.present) state.future.unshift(state.present);
      state.present = previous;
    },
    redoAction: (state) => {
      if (state.future.length === 0) return;
      const next = state.future.shift();
      if (state.present) state.past.push(state.present);
      state.present = next;
    },
  },
});

export const { addAction, undoAction, redoAction } = operationHistorySlice.actions;
export default operationHistorySlice.reducer;
