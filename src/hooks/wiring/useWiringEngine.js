import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as THREE from 'three';

function findClosestPointOnObjects(mouseWorldPos, objects, threshold = 10) {
  let closestPoint = null;
  let closestDistance = threshold;

  objects.forEach(obj => {
    if (!obj.geometry || !obj.geometry.attributes?.position) return;
    const positions = obj.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const point = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      point.applyMatrix4(obj.matrixWorld);
      const dist = mouseWorldPos.distanceTo(point);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestPoint = point.clone();
      }
    }
  });
  return closestPoint;
}

export function useWiringEngine(scene, camera, renderer,snapPoints, targetPlanes) {
  const { commandType } = useSelector((state) => state.operation);

  const isWiringActive = useRef(false);
  const isDrawing = useRef(false);
  const wireVertices = useRef([]);
  const tempLine = useRef(null);
  const snapMarker = useRef(null);
  const lastSnapPos = useRef(null);
  const offsetDirection = useRef(null); // 🔥 Offset yönü

  const snapMode = useSelector((state) => state.mods.snapMode);

  useEffect(() => {
    if (commandType === 'drawSocket') {
      isWiringActive.current = true;
    } else {
      isWiringActive.current = false;
    }
  }, [commandType]);

  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    const domElement = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const getMouseWorldPosition = (event) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      return intersection;
    };

    const updateTempLine = () => {
      if (wireVertices.current.length < 1 || !tempLine.current) return;

      const points = [...wireVertices.current];
      if (lastSnapPos.current) {
        points.push(lastSnapPos.current.clone());
      }

      const newGeometry = new THREE.BufferGeometry().setFromPoints(points);
      tempLine.current.geometry.dispose();
      tempLine.current.geometry = newGeometry;
    };

    const createSnapMarker = (position) => {
      if (!snapMarker.current) {
        const geometry = new THREE.CircleGeometry(3, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        snapMarker.current = new THREE.Mesh(geometry, material);
        snapMarker.current.rotation.x = -Math.PI / 2;
        scene.add(snapMarker.current);
      }
      snapMarker.current.visible = true;
      snapMarker.current.position.copy(position);
    };

    const hideSnapMarker = () => {
      if (snapMarker.current) {
        snapMarker.current.visible = false;
      }
    };

    const applyOffsetToPosition = (position) => {
      if (!offsetDirection.current) return position.clone();
      const offset = 10; // 🔥 Offset mesafesi: 10 birim
      const offsetVec = new THREE.Vector3();
      if (offsetDirection.current === 'up') offsetVec.set(0, offset, 0);
      if (offsetDirection.current === 'down') offsetVec.set(0, -offset, 0);
      if (offsetDirection.current === 'left') offsetVec.set(-offset, 0, 0);
      if (offsetDirection.current === 'right') offsetVec.set(offset, 0, 0);
      return position.clone().add(offsetVec);
    };

    const onMouseDown = (event) => {
      if (!isWiringActive.current) return;
      if (event.button !== 0) return; // 🚫 Sağ tık engellendi, sadece sol tık (button === 0)

      const worldPos = getMouseWorldPosition(event);
      const snapPos = findClosestPointOnObjects(worldPos, targetPlanes, 10);
      const finalPos = snapPos || worldPos;

      const adjustedPos = applyOffsetToPosition(finalPos);

      if (!isDrawing.current) {
        isDrawing.current = true;
        wireVertices.current = [adjustedPos.clone()];

        const geometry = new THREE.BufferGeometry().setFromPoints([adjustedPos, adjustedPos]);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
        tempLine.current = new THREE.Line(geometry, material);
        scene.add(tempLine.current);
      } else {
        wireVertices.current.push(adjustedPos.clone());
      }
    };

    const onMouseMove = (event) => {
      if (!isWiringActive.current) return;

      const worldPos = getMouseWorldPosition(event);
      const snapPos = findClosestPointOnObjects(worldPos, targetPlanes, 10);

      if (snapPos) {
        createSnapMarker(snapPos);
        lastSnapPos.current = snapPos.clone();
      } else {
        hideSnapMarker();
        lastSnapPos.current = worldPos.clone();
      }

      if (isDrawing.current) {
        updateTempLine();
      }
    };

    const onKeyDown = (event) => {
      if (!isWiringActive.current) return;

      switch (event.key.toLowerCase()) {
        case 'w':
          offsetDirection.current = 'up';
          console.log('W: Offset yukarı');
          break;
        case 's':
          offsetDirection.current = 'down';
          console.log('S: Offset aşağı');
          break;
        case 'a':
          offsetDirection.current = 'left';
          console.log('A: Offset sola');
          break;
        case 'd':
          offsetDirection.current = 'right';
          console.log('D: Offset sağa');
          break;
        case ' ':
          console.log('Space: Yeni bileşen ekle (şu an boş)');
          break;
        case 'enter':
          console.log('Enter: Çizimi tamamla');
          finishWiring();
          break;
        case 'escape':
          console.log('Escape: İptal');
          cancelWiring();
          break;
        default:
          break;
      }
    };

    const finishWiring = () => {
      if (wireVertices.current.length >= 2) {
        const finalGeometry = new THREE.BufferGeometry().setFromPoints(wireVertices.current);
        const finalMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const finalLine = new THREE.Line(finalGeometry, finalMaterial);

        scene.add(finalLine);
      }
      cleanup();
    };

    const cancelWiring = () => {
      cleanup();
    };

    const cleanup = () => {
      isDrawing.current = false;
      wireVertices.current = [];
      if (tempLine.current) {
        scene.remove(tempLine.current);
        tempLine.current.geometry.dispose();
        tempLine.current.material.dispose();
        tempLine.current = null;
      }
      hideSnapMarker();
      offsetDirection.current = null;
    };

    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [scene, camera, renderer, targetPlanes]);
}
