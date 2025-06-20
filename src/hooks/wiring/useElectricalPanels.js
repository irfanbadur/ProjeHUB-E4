import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetOperation,
  setCommandMessage,
} from '../../redux/operationSlice';
import { createPanel } from '../../symbolDrawings/createPanel';

export const useElectricalPanels = (scene, camera, renderer) => {
  const previewPanelRef = useRef(null);
  const previewPolylineRef = useRef(null); // polyline preview
  const polylinePointsRef = useRef([]);
  const rotationPanelRef = useRef(false);
  const dispatch = useDispatch();
  const symmetricalOffset =0// 26;

  const { commandType } = useSelector((state) => state.operation);
  const utils = useSelector((state) => state.utils) || {};
  const basePoint = utils.lastBasePoint || { x: 0, y: 0, z: 0 };

  useEffect(() => {
    if (commandType !== 'drawPanel' || !scene || !camera || !renderer) return;
    dispatch(setCommandMessage('Panel yerleştirme noktasını seçin'));

    const domElement = renderer.domElement;

    // === Yardımcılar ===

function findClosestLine(scene, mousePos, threshold = 20) {
  let closest = null;
  let minDistance = threshold;

  scene.traverse((object) => {
    if (object.isLine) {
      if (object.userData.isPanelPart) return;

      const geometry = object.geometry;
      if (!geometry) return;

      const positionAttr = geometry.attributes?.position;
      if (!positionAttr || !positionAttr.array) return;

      const positions = positionAttr.array;

      for (let i = 0; i < positions.length - 3; i += 3) {
        const start = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        const end = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);

        const closestPoint = closestPointOnLineSegment(start, end, mousePos);
        const dist = mousePos.distanceTo(closestPoint);

        if (dist < minDistance) {
          minDistance = dist;
          closest = { object, start, end, distance: dist };
        }
      }
    }
  });

  return closest;
}

function closestPointOnLineSegment(start, end, point) {
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      dir.normalize();

      const v = new THREE.Vector3().subVectors(point, start);
      const d = v.dot(dir);

      if (d < 0) return start;
      if (d > len) return end;

      return new THREE.Vector3().addVectors(start, dir.multiplyScalar(d));
}

    const getMouseWorldPosition = (event) => {
      const rect = domElement?.getBoundingClientRect?.();
      if (!rect) return new THREE.Vector3();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z=0 düzlemi
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);

      return point;
    };

    const updatePolyline = (mousePos) => {
      const polylineGeometry = previewPolylineRef.current.geometry;
      const points = [...polylinePointsRef.current, mousePos.clone()];
      const positions = new Float32Array(points.length * 3);
      points.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      });
      polylineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      polylineGeometry.setDrawRange(0, points.length);
      polylineGeometry.attributes.position.needsUpdate = true;
    };

    // === Başlangıç ===
   polylinePointsRef.current = [
  new THREE.Vector3(basePoint.x, basePoint.y, basePoint.z)
];
    const polylineGeometry = new THREE.BufferGeometry();
    const polylineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const polylineLine = new THREE.Line(polylineGeometry, polylineMaterial);
    previewPolylineRef.current = polylineLine;
    scene.add(polylineLine);

    // === Mouse Hareketi ===
    const handleMouseMove = (event) => {
      let mousePos = getMouseWorldPosition(event);
      const closestLine = findClosestLine(scene, mousePos);

      let angleRadians = 0;

      if (closestLine) {
        const { start, end } = closestLine;

        const dir = new THREE.Vector2(end.x - start.x, end.y - start.y).normalize();
        angleRadians = Math.atan2(dir.y, dir.x) + Math.PI / 2;

        const projectionPoint = closestPointOnLineSegment(start, end, mousePos);
        let normal = new THREE.Vector3(-dir.y, dir.x, 0);
        normal.applyAxisAngle(new THREE.Vector3(0, 0, 1), angleRadians);
        const offsetVector = normal.multiplyScalar(0);
        mousePos = projectionPoint.clone().add(offsetVector);
      }

      // Polyline güncelle
      updatePolyline(mousePos);

      // Panel Preview güncelle
      let createPanelDirection = rotationPanelRef.current ? -1 : 1;

      if (previewPanelRef.current) {
        scene.remove(previewPanelRef.current);
        previewPanelRef.current.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }

      const tempGroup = createPanel(scene, mousePos, createPanelDirection, symmetricalOffset, true);
      previewPanelRef.current = tempGroup;
      tempGroup.rotation.z = angleRadians;

      scene.add(tempGroup);
    };

    // === Mouse Click ===
// === MOUSE CLICK ===
// SADECE vertex ekle, panel OLUŞTURMA!
const handleMouseClick = (event) => {
  let mousePos = getMouseWorldPosition(event);
  const closestLine = findClosestLine(scene, mousePos);

  if (closestLine) {
    const { start, end } = closestLine;
    const dir = new THREE.Vector2(end.x - start.x, end.y - start.y).normalize();
    const projectionPoint = closestPointOnLineSegment(start, end, mousePos);
    let normal = new THREE.Vector3(-dir.y, dir.x, 0);
    const angleRadians = Math.atan2(dir.y, dir.x) + Math.PI / 2;
    normal.applyAxisAngle(new THREE.Vector3(0, 0, 1), angleRadians);
    const offsetVector = normal.multiplyScalar(0);
    mousePos = projectionPoint.clone().add(offsetVector);
  }

  // ✅ SADECE vertex ekle:
  polylinePointsRef.current.push(mousePos.clone());
  updatePolyline(mousePos);
};

// === ENTER KEY ===
// Panel oluştur + polyline finalize + cleanup
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    let mousePos = new THREE.Vector3();
    if (previewPanelRef.current) {
      mousePos.copy(previewPanelRef.current.position);
    }

    // Final polyline sahnede kalsın:
    if (previewPolylineRef.current) {
      const finalGeometry = previewPolylineRef.current.geometry.clone();
      const finalMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
      const finalLine = new THREE.Line(finalGeometry, finalMaterial);
      scene.add(finalLine);
    }

    // Panel oluştur:
    let createPanelDirection = rotationPanelRef.current ? -1 : 1;
    let panels = [];
    scene.traverse(obj => {
      if (obj.userData.type === "electricalPanel") panels.push(obj);
    });
    const panelKatPlanNo = panels.length;

    const tempGroup = createPanel(scene, mousePos, createPanelDirection, symmetricalOffset, true, panelKatPlanNo);
    scene.add(tempGroup);

    // Previewleri sil:
    cleanup();

    dispatch(resetOperation());
    dispatch(setCommandMessage(''));
  }

  if (e.key === 'Escape') {
    cleanup();
    dispatch(resetOperation());
    dispatch(setCommandMessage(''));
  }

  if (e.key === 'r') {
    rotationPanelRef.current = !rotationPanelRef.current;
    console.log("R tuşu: rotationPanelRef =", rotationPanelRef.current);
  }
};


    // === Enter → Polyline finalize ===



    const cleanup = () => {
      if (previewPanelRef.current) {
        scene.remove(previewPanelRef.current);
        previewPanelRef.current.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        previewPanelRef.current = null;
      }

      if (previewPolylineRef.current) {
        scene.remove(previewPolylineRef.current);
        previewPolylineRef.current.geometry.dispose();
        previewPolylineRef.current.material.dispose();
        previewPolylineRef.current = null;
      }
    };

    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('click', handleMouseClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('click', handleMouseClick);
      window.removeEventListener('keydown', handleKeyDown);
      cleanup();
    };
  }, [commandType, scene, camera, renderer, dispatch]);
};
