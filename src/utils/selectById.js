// utils/selection/selectById.js
import store from '../../redux/store';
import { setSelectedObjectIds } from '../../redux/selectionSlice';

export function selectById(scene, id) {
  const object = scene.getObjectByProperty('userData.id', id);
  if (object) {
    store.dispatch(setSelectedObjectIds([id]));
    return object;
  }
  return null;
}
