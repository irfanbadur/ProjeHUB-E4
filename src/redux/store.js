import { configureStore } from '@reduxjs/toolkit';
import operationReducer from './operationSlice';
import modsReducer from './modsSlice'
import selectionReducer from './selectionSlice'
import gizmoReducer from './gizmoSlice'
import snapReducer from './snapSlice'
import dxfReducer from './dxfSlice'
import layerReducer from './layerSlice'
import operationHistoryReducer from './operationHistorySlice'
// diğer reducer'lar varsa ekle

export const store = configureStore({
  reducer: {
    operation : operationReducer,
    mods      : modsReducer,
    selection :selectionReducer,
    gizmo     :gizmoReducer,
    snap      :snapReducer,
    dxf       :dxfReducer,
    layer     :layerReducer,
    operationHistory: operationHistoryReducer,

    // diğer reducer'lar
  },
});
