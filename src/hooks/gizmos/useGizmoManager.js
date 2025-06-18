// useGizmoManager.js
import useSocketGizmo from './useSocketGizmo';
import useSocketGizmoEvents from './useSocketGizmoEvents';
import useFixtureGizmo from '../Lighting/useFixtureGizmo';
import useFixtureGizmoEvents from '../Lighting/useFixtureGizmoEvents';
import useLightSwitchGizmo from './useLightSwitchGizmo';
import useLightingGizmoEvents from './useLightingGizmoEvents';
import { useSelector } from 'react-redux';
import { useGizmoTitle} from './useGizmoTitle';

export default function useGizmoManager(scene, camera, renderer) {
  const selectedObjectIds = useSelector(state => state.selection.selectedObjectIds);
  const selectedObjects = useSelector((state) => state.selection.selectedObjects);

  useSocketGizmo(scene, selectedObjectIds);
  useSocketGizmoEvents({ scene, camera, renderer });
  useFixtureGizmo(scene, selectedObjectIds);
  useFixtureGizmoEvents({ scene, camera, renderer });
  useLightSwitchGizmo(scene, selectedObjectIds);
  useLightingGizmoEvents({ scene, camera, renderer });
//  useGizmoTitle(scene, camera, renderer, selectedObjects.map(id => scene.getObjectById(id)));
}
