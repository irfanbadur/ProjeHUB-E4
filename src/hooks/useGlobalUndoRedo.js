import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { undo,redo } from '../utils/undoRedo';// mevcut undo/redo fonksiyonların

const useGlobalUndoRedo = (scene, camera, renderer) => {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        console.log('🔁 Global Ctrl+Z');
        undo(scene, dispatch, store.getState, renderer, camera);
      }
      if (e.ctrlKey && e.key === 'y') {
        console.log('🔁 Global Ctrl+Y');
        redo(scene, dispatch, store.getState, renderer, camera);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scene, camera, renderer]);
};

export default useGlobalUndoRedo;
