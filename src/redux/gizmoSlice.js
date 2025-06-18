// redux/gizmoSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gizmoPoints: [],        // List of all gizmo points
  activeGizmo: null,      // Currently active (dragged) gizmo
  gizmoClicked: false,    // Whether the gizmo is clicked or not
};

const gizmoSlice = createSlice({
  name: 'gizmo',
  initialState,
  reducers: {
    // Set gizmo points
    setGizmos: (state, action) => {
      state.gizmoPoints = action.payload;
    },
    // Set active gizmo
    setActiveGizmo: (state, action) => {
      state.activeGizmo = action.payload;
    },
    // Set gizmo clicked status
    setGizmoClicked: (state, action) => {
      state.gizmoClicked = action.payload;
    },
  },
});

export const { setGizmos, setActiveGizmo, setGizmoClicked } = gizmoSlice.actions;

export default gizmoSlice.reducer;
