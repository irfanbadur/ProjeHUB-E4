// dxfSelectors.js
import { createSelector } from '@reduxjs/toolkit';

const selectDxfData = (state) => state?.dxf?.data;

export const selectDxfEntities = createSelector(
  [selectDxfData],
  (data) => data?.entities || []
);
 
export const selectDxfBlocks = createSelector(
  [selectDxfData],
  (data) => data?.blocks || []
);
