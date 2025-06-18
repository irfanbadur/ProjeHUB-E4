/* // redux/selectionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const selectionSlice = createSlice({
  name: 'selection',
  initialState: {
    selectedId: null,
  },
  reducers: {
    selectObject: (state, action) => {
      state.selectedId = action.payload;
    },
    clearSelection: (state) => {
      state.selectedId = null;
    },
  },
});

export const { selectObject, clearSelection } = selectionSlice.actions;
export default selectionSlice.reducer;
 */
// redux/selectionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const selectionSlice = createSlice({
  name: 'selection',
  initialState: {
    selectedId: null,
    selectedObjectIds: [],    // Added this for selected object IDs
    selectedObjects: [],      // Added this for selected objects
  },
  reducers: {
    selectObject: (state, action) => {
      state.selectedId = action.payload;
    },
    clearSelection: (state) => {
      state.selectedId = null;
      state.selectedObjectIds = [];    // Clear selected object IDs
      state.selectedObjects = [];      // Clear selected objects
    },
    // Add the new action for adding a selected object ID
    addSelectedObjectID: (state, action) => {
      state.selectedObjectIds.push(action.payload); // Add the object ID to the array
    },
    // Add the new action for adding a selected object
    addSelectedObject: (state, action) => {
      state.selectedObjects.push(action.payload); // Add the object to the array
    },
    // Add the new action for removing a selected object by ID
    removeSelectedObject: (state, action) => {
      // Remove the object ID from the selectedObjectIds array
      state.selectedObjectIds = state.selectedObjectIds.filter(
        (id) => id !== action.payload
      );
      // Remove the object from the selectedObjects array
      state.selectedObjects = state.selectedObjects.filter(
        (obj) => obj.userData.id !== action.payload
      );
    },
  },
});

export const {
  selectObject,
  clearSelection,
  addSelectedObjectID,
  addSelectedObject,
  removeSelectedObject,
} = selectionSlice.actions;

export default selectionSlice.reducer;
