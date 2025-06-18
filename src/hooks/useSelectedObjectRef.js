// src/hooks/useSelectedObjectRef.js
import { useRef } from 'react';

let selectedObjectRef = null;

export function useSelectedObjectRef() {
  if (!selectedObjectRef) {
    selectedObjectRef = { current: null };
  }
  return selectedObjectRef;
}
