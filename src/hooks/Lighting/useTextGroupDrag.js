import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Sahnedeki tüm 'textGroup' named grupları fare ile sürüklemek için hook,
 * ancak her bir textGroup, kendi parent grubunun world konumundan
 * maxDistance biriminden fazla uzaklaşamaz.
 */
export function useTextGroupDrag({ scene, camera, renderer, maxDistance = 50 }) {
  const dragging = useRef(false);
  const dragGroup = useRef(null);
  const offset = useRef(new THREE.Vector3());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!scene || !camera || !renderer) return;
    const dom = renderer.domElement;

    function toNDC(event) {
      const rect = dom.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function getPlaneIntersect() {
      raycaster.current.setFromCamera(mouse.current, camera);
      const pt = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, pt);
      return pt;
    }

    function findTextGroup(obj) {
      while (obj) {
        if (obj.name === 'textGroup' && obj instanceof THREE.Group) return obj;
        obj = obj.parent;
      }
      return null;
    }

    function onMouseDown(e) {
      toNDC(e);
      raycaster.current.setFromCamera(mouse.current, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      for (let h of hits) {
        const tg = findTextGroup(h.object);
        if (tg) {
          dragging.current = true;
          dragGroup.current = tg;
          const worldPos = new THREE.Vector3();
          tg.getWorldPosition(worldPos);
          const pt = getPlaneIntersect();
          offset.current.copy(pt).sub(worldPos);
          break;
        }
      }
    }

    function onMouseMove(e) {
      if (!dragging.current || !dragGroup.current) return;
      toNDC(e);
      let desiredWorld = getPlaneIntersect().sub(offset.current);

      // Clamp distance from parent world position
      const parent = dragGroup.current.parent;
      if (parent) {
        const parentWorldPos = new THREE.Vector3();
        parent.getWorldPosition(parentWorldPos);
        const v = new THREE.Vector3().subVectors(desiredWorld, parentWorldPos);
        if (v.length() > maxDistance) {
          v.setLength(maxDistance);
          desiredWorld = parentWorldPos.clone().add(v);
        }
      }

      // Convert to local coordinate
      if (parent) {
        const local = parent.worldToLocal(desiredWorld.clone());
        dragGroup.current.position.copy(local);
      } else {
        dragGroup.current.position.copy(desiredWorld);
      }
    }

    function onMouseUp() {
      dragging.current = false;
      dragGroup.current = null;
    }

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [scene, camera, renderer, maxDistance]);
}