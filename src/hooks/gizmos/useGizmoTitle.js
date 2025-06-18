// src/hooks/useGizmoTitle.js
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function closestPointOnSegment(A, B, P) {
  const AP = new THREE.Vector3().subVectors(P, A);
  const AB = new THREE.Vector3().subVectors(B, A);
  const magnitudeAB = AB.lengthSq();
  const ABAPproduct = AP.dot(AB);
  const distance = ABAPproduct / magnitudeAB;
  if (distance < 0) return A.clone();
  else if (distance > 1) return B.clone();
  else return A.clone().add(AB.multiplyScalar(distance));
}

export const useGizmoTitle = (scene, camera, renderer, selectedObjects) => {
  const isDragging = useRef(false);
  const selectedRef = useRef(null);
  const startInfo = useRef({});
  const lastMouse = useRef(new THREE.Vector2());
  const flipFactorRef = useRef(1);
  useEffect(() => {
    if (!scene || !camera || !renderer) return;
    const domElement = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const getMouseWorldPosition = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      return { intersection, ndc: new THREE.Vector2(x, y) };
    };

    const onMouseDown = (event) => {
      const { intersection, ndc } = getMouseWorldPosition(event);
      lastMouse.current.copy(ndc);
      flipFactorRef.current = 1;

      raycaster.setFromCamera(ndc, camera);
      const intersects = raycaster.intersectObjects(selectedObjects, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && obj.type !== 'Scene') {
          if (obj.userData?.type === 'wireTitle') {
            selectedRef.current = obj;
            isDragging.current = true;

            const vertices = obj.userData.wireVertices;
            let minDist = Infinity;
            let bestSegment = null;
            let closest = null;
            for (let i = 0; i < vertices.length - 1; i++) {
              const p1 = vertices[i];
              const p2 = vertices[i + 1];
              const candidate = closestPointOnSegment(p1, p2, intersection);
              const dist = intersection.distanceTo(candidate);
              if (dist < minDist) {
                minDist = dist;
                bestSegment = { p1, p2 };
                closest = candidate;
              }
            }

            if (closest && bestSegment) {
              const dir = new THREE.Vector3().subVectors(bestSegment.p2, bestSegment.p1).normalize();
              const perp = new THREE.Vector3(-dir.y, dir.x, 0);

              const mouseOffset = intersection.clone().sub(closest);
              const alongComponent = mouseOffset.clone().projectOnVector(dir);
              const offset = obj.position.clone().sub(closest.clone().add(alongComponent));
              const startStretchDistance = mouseOffset.dot(perp);

              const baseLength = obj.userData.lineLength || 30;
              startInfo.current = {
                basePoint: closest,
                segment: bestSegment,
                titleOffset: offset,
                baseLength,
                startStretchDistance,
              };
            }
            break;
          }
          obj = obj.parent;
        }
      }
    };

    const onMouseMove = (event) => {
      if (!isDragging.current || !selectedRef.current) return;
      const obj = selectedRef.current;
      const { intersection, ndc } = getMouseWorldPosition(event);

      const dx = ndc.x - lastMouse.current.x;
      const dy = ndc.y - lastMouse.current.y;
      lastMouse.current.copy(ndc);

      const vertices = obj.userData.wireVertices;
      let minDist = Infinity;
      let bestSegment = null;
      let closest = null;

      for (let i = 0; i < vertices.length - 1; i++) {
        const p1 = vertices[i];
        const p2 = vertices[i + 1];
        const candidate = closestPointOnSegment(p1, p2, intersection);
        const dist = intersection.distanceTo(candidate);
        if (dist < minDist) {
          minDist = dist;
          bestSegment = { p1, p2 };
          closest = candidate;
        }
      }

      const dir = new THREE.Vector3().subVectors(bestSegment.p2, bestSegment.p1).normalize();
      const perp = new THREE.Vector3(-dir.y, dir.x, 0);

      const offsetAlong = startInfo.current.titleOffset.clone().projectOnVector(dir);

      const projected = intersection.clone().sub(bestSegment.p1);
      const t = THREE.MathUtils.clamp(projected.dot(dir), 0, bestSegment.p2.clone().sub(bestSegment.p1).length());
      const closestOnWire = bestSegment.p1.clone().add(dir.clone().multiplyScalar(t));
      const basePos = closestOnWire.clone().add(offsetAlong);

      obj.position.copy(basePos);

      const currentStretchDistance = intersection.clone().sub(closestOnWire).dot(perp);
      const deltaStretch = (currentStretchDistance - startInfo.current.startStretchDistance) * flipFactorRef.current;
      const stretched = THREE.MathUtils.clamp(startInfo.current.baseLength + deltaStretch, 10, 150);

      obj.children.forEach((child) => {
        if (child.name === 'titleLine') {
          child.geometry.dispose();
          child.geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, stretched, 0),
            new THREE.Vector3(0, 0, 0),
          ]);
        }
        if (child.name === 'titleLabel' || child.name === 'titleInnerCircle') {
          child.position.set(0, stretched + 10, 0);
        }
        if (child.name === 'titleCircle') {
          const newShape = new THREE.Shape();
          newShape.absarc(0, stretched + 10, 10, 0, Math.PI * 2, false);
          child.geometry.dispose();
          child.geometry = new THREE.BufferGeometry().setFromPoints(newShape.getPoints(64));
          child.computeLineDistances();
        }
      });

      obj.rotation.z = Math.atan2(perp.y, perp.x) - Math.PI / 2 + (flipFactorRef.current === -1 ? Math.PI : 0);
      obj.userData.lineLength = stretched;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      selectedRef.current = null;
    };
    const onKeyDown = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        if (isDragging.current) {
          flipFactorRef.current *= -1;
        }
      }
    };
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [scene, camera, renderer, selectedObjects]);
};