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
              const offset = obj.position.clone().sub(closest);
              const baseLength = obj.userData.lineLength || 30;
              startInfo.current = {
                basePoint: closest,
                segment: bestSegment,
                titleOffset: offset,
                baseLength,
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
      lastMouse.current.copy(ndc);
      
      // 🔥 HAREKET SIRASINDA EN YAKIN SEGMENTİ YENİDEN BUL
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
      
      // 🔥 Artık bestSegment ve closest elimizde!
      const dir = new THREE.Vector3().subVectors(bestSegment.p2, bestSegment.p1).normalize();
      const perp = new THREE.Vector3(-dir.y, dir.x, 0);
      
      const offsetAlong = startInfo.current.titleOffset.clone().projectOnVector(dir);
      const offsetPerp = startInfo.current.titleOffset.clone().projectOnVector(perp);
      
      // 🔥 Tel boyunca base pozisyonu
      const projected = intersection.clone().sub(bestSegment.p1);
      const t = THREE.MathUtils.clamp(projected.dot(dir), 0, bestSegment.p2.clone().sub(bestSegment.p1).length());
      const closestOnWire = bestSegment.p1.clone().add(dir.clone().multiplyScalar(t));
      const basePos = closestOnWire.clone().add(offsetAlong);
      
      obj.position.copy(basePos);
      
      // 🔥 Stretch işlemi
      const stretchAmount = intersection.clone().sub(closestOnWire).dot(perp);
      const stretched = THREE.MathUtils.clamp(startInfo.current.baseLength + stretchAmount, 10, 150);
      
      // çocukları güncelle (line, circle, label stretch)
      
      

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

      obj.userData.lineLength = stretched;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      selectedRef.current = null;
    };

    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [scene, camera, renderer, selectedObjects]);
};