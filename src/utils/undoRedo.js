import { applySceneAction } from "./sceneAction";
import { undoAction,redoAction } from '../redux/operationHistorySlice';


export function undo(scene, dispatch, getState, renderer, camera) {
    console.log('✅ undo() çağrıldı');
    const previous = getState().operationHistory.past.slice(-1)[0];
    if (!previous) return;
  
    applySceneAction(previous, scene, 'backward');
  
    dispatch(undoAction());
  
    // 👇 Sahneyi zorla yeniden çiz
    renderer.render(scene, camera);
  }
  
  export function redo(scene, dispatch, getState, renderer, camera) {
    const next = getState().operationHistory.future[0];
    if (!next) return;
    console.log("🔁 Redo action:", next);
 
    applySceneAction(next, scene, 'forward');
  
    dispatch(redoAction());
  
    // 👇 Sahneyi zorla yeniden çiz
    renderer.render(scene, camera);
  }
  