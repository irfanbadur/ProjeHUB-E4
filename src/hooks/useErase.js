// src/hooks/useErase.js
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetOperation } from '../redux/operationSlice';
import { clearSelection } from '../redux/selectionSlice';

const useErase = (scene) => {
  const dispatch = useDispatch();
  const { commandType } = useSelector((state) => state.operation);
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);

  const eraseObjects = () => {
    if (!scene || selectedObjectIds.length === 0) return;
console.log("SELECTED IDS : ",selectedObjectIds)
    const toRemove = scene.children.filter(
      (obj) => selectedObjectIds.includes(obj.userData?.id)
    );
    console.log("SELECTED IDS toRemove: ",toRemove)

    toRemove.forEach((obj) => {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });

    dispatch(clearSelection());
    dispatch(resetOperation());
  };

  useEffect(() => {
    if (commandType === 'erase') {
      eraseObjects();
    }
  }, [commandType]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        eraseObjects();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scene, selectedObjectIds]);
};

export default useErase;
