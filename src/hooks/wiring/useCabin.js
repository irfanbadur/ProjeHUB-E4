import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetOperation,
  setCommandMessage,
} from '../../redux/operationSlice';
import { createCabin } from '../../symbolDrawings/createCabin';
//---------------------KOFRE -----------------------------
export const useCabin = (scene, camera, renderer) => {
  const previewPanelRef = useRef(null);
  const rotationPanelRef = useRef(false);
  const polylinePointsRef = useRef([]);
  const previewLineRef = useRef(null);

  const dispatch = useDispatch();
  const { commandType } = useSelector((state) => state.operation);
  const utils = useSelector((state) => state.utils) || {};
  const basePoint = utils.lastBasePoint || { x: 0, y: 0, z: 0 };

  const mousePosRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (commandType !== 'drawCabin' || !scene || !camera || !renderer) return;

    dispatch(setCommandMessage('Mouse konumunu ayarla, tıkla → polyline, Enter ile MainPanel yerleştir'));

    const domElement = renderer.domElement;

    // Polyline preview initialize
    const polylineGeometry = new THREE.BufferGeometry();
    const polylineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const polylineLine = new THREE.Line(polylineGeometry, polylineMaterial);
    previewLineRef.current = polylineLine;
    scene.add(polylineLine);

    // Başlangıç: basePoint
    const startPoint = new THREE.Vector3(basePoint.x, basePoint.y, basePoint.z);
    polylinePointsRef.current = [startPoint.clone()];

    const updatePolyline = (mousePos) => {
      // Kalıcı noktalar + geçici mouse noktası
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

    const getMouseWorldPosition = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);
      return point;
    };

    const handleMouseMove = (event) => {
      const mousePos = getMouseWorldPosition(event);
      mousePosRef.current.copy(mousePos);
      updatePolyline(mousePos);

      if (previewPanelRef.current) {
        previewPanelRef.current.position.copy(mousePos);
      } else {
        const panel = createCabin(scene, mousePos, "KOFRE");
        previewPanelRef.current = panel;
        scene.add(panel);
      }
    };

    const handleMouseClick = (event) => {
      const mousePos = getMouseWorldPosition(event);
      polylinePointsRef.current.push(mousePos.clone());
      updatePolyline(mousePos);
    };

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    const mousePos = mousePosRef.current.clone();
    console.log("MainPanel yerleştiriliyor:", mousePos);

    // ✅ 1) Final polyline'ı sahneye kalıcı ekle:
    if (previewLineRef.current) {
      // Yeni bir Line klonu oluştur
      const finalGeometry = previewLineRef.current.geometry.clone();
      const finalMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
      const finalLine = new THREE.Line(finalGeometry, finalMaterial);
      scene.add(finalLine);
    }

    // ✅ 2) Preview paneli sil
    if (previewPanelRef.current) {
      scene.remove(previewPanelRef.current);
      previewPanelRef.current.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      previewPanelRef.current = null;
    }

    // ✅ 3) MainPanel oluştur
    const newPanel = createCabin(scene, mousePos, "KOFRE");
    scene.add(newPanel);

    // ✅ 4) Preview polyline cleanup (orijinali)
    if (previewLineRef.current) {
      scene.remove(previewLineRef.current);
      previewLineRef.current.geometry.dispose();
      previewLineRef.current.material.dispose();
      previewLineRef.current = null;
    }

    // ✅ 5) Durum reset
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
    console.log("R: Rotation toggled:", rotationPanelRef.current);
  }
};


    const cleanup = () => {
      if (previewPanelRef.current) {
        scene.remove(previewPanelRef.current);
        previewPanelRef.current.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        previewPanelRef.current = null;
      }

      if (previewLineRef.current) {
        scene.remove(previewLineRef.current);
        previewLineRef.current.geometry.dispose();
        previewLineRef.current.material.dispose();
        previewLineRef.current = null;
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
  }, [commandType, scene, camera, renderer, dispatch, basePoint]);
};
