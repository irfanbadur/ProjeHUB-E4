import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  setOperationStep,
  setOperationData,
  resetOperation,
  setCommandMessage
} from '../redux/operationSlice';
import { generateUniqueId } from '../utils/generateUniqueId';
import { createSnapMarker } from '../utils/createSnapMarker';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { useInputText } from '../utils/useInputText';

const useDrawCircle = (scene, camera, renderer,snapPoints) => {
  const tempCircleRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const inputBuffer = useRef('');
  const lastMouse = useRef({ x: 0, y: 0 });
  const snapMode = useSelector((state) => state.mods.snapMode);

  const dispatch = useDispatch();
  const inputText = useInputText(scene, camera);

  const { commandType, step, data } = useSelector(state => state.operation);
  const gridSnap = useSelector(state => state.mods.gridSnap);
  const objectSnap = useSelector(state => state.mods.objectSnap); 
  const gridSize = 10;

  const applyGridSnap = (point) => {
    return new THREE.Vector3(
      Math.round(point.x / gridSize) * gridSize,
      Math.round(point.y / gridSize) * gridSize,
      0
    );
  };

  const getMousePointOnPlane = (mouseNDC) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseNDC, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Z=0 düzlemi
    const worldPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, worldPoint);
    return worldPoint;
  };

  useEffect(() => {
    if (commandType !== 'drawCircle' || !scene || !camera || !renderer) return;

    const domElement = renderer.domElement;

    dispatch(setCommandMessage("Merkez noktasını seçin"));

    const handleClick = (e) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = getMousePointOnPlane(mouseNDC);

      const { finalPoint, snapped, snapSource } = getSnappedPoint(
        mouseNDC,
        worldPoint,
        snapPoints,
        camera,
        renderer,
        { snapMode }
      );
            if (!finalPoint && gridSnap) finalPoint = applyGridSnap(worldPoint);
      if (!finalPoint) finalPoint = worldPoint;

      if (step === 0) {
        dispatch(setOperationData({ center: { x: finalPoint.x, y: finalPoint.y, z: finalPoint.z } }));
        dispatch(setOperationStep(1));
        dispatch(setCommandMessage("Yarıçap için nokta seçin veya sayı girin"));
      } else if (step === 1) {
        const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const radius = center.distanceTo(finalPoint);
        const segments = 64;
        const angleStep = (Math.PI * 2) / segments;
        const points = [];

        for (let i = 0; i <= segments; i++) {
          const angle = i * angleStep;
          points.push(new THREE.Vector3(
            center.x + radius * Math.cos(angle),
            center.y + radius * Math.sin(angle),
            0
          ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const circle = new THREE.LineLoop(geometry, material);
        circle.userData = { 
          id: generateUniqueId(), 
          isSelectable: true,
             type:"circle",
             center:{x:center.x,y:center.y,z:0},
             radius:radius
         };
        scene.add(circle);

        if (tempCircleRef.current) {
          scene.remove(tempCircleRef.current);
          tempCircleRef.current.geometry.dispose();
          tempCircleRef.current.material.dispose();
          tempCircleRef.current = null;
        }

        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
      }

      inputText.clear();
    };

    const handleMouseMove = (e) => {
      if (!scene || !camera || !renderer) return;
    
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      lastMouse.current = { x, y };
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = getMousePointOnPlane(mouseNDC);
    
      const { finalPoint, snapped, snapSource } = getSnappedPoint(
        mouseNDC,
        worldPoint,
        snapPoints,
        camera,
        renderer,
        { snapMode }
      );
    
      // ✅ Snap Marker her zaman gösterilsin (step'e bağlı değil)
      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }
    
      if (snapMode && snapped && snapSource) {
        const marker = createSnapMarker(8, snapSource);
        marker.position.copy(finalPoint);
        scene.add(marker);
        snapMarkerRef.current = marker;
      }
    
      // ❗ Daire sadece step === 1'deyken çizilmeli
      if (step !== 1) return;
    
      const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
      const radius = center.distanceTo(finalPoint);
    
      if (tempCircleRef.current) {
        scene.remove(tempCircleRef.current);
        tempCircleRef.current.geometry.dispose();
        tempCircleRef.current.material.dispose();
      }
    
      const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const segments = 64;
      const angleStep = (Math.PI * 2) / segments;
      const points = [];
    
      for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        points.push(new THREE.Vector3(
          center.x + radius * Math.cos(angle),
          center.y + radius * Math.sin(angle),
          0
        ));
      }
    
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const circle = new THREE.LineLoop(geometry, material);
      tempCircleRef.current = circle;
      scene.add(circle);
    
      inputText.update(inputBuffer.current, lastMouse.current, {
        backgroundColor: 0x4444ff,
        color: 0xffffff,
        force: true
      });
    };
    

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (tempCircleRef.current) {
          scene.remove(tempCircleRef.current);
          tempCircleRef.current.geometry.dispose();
          tempCircleRef.current.material.dispose();
          tempCircleRef.current = null;
        }
        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
        }
        inputBuffer.current = '';
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
        inputText.clear();
      } else if (e.key === 'Enter' && step === 1 && inputBuffer.current) {
        const radius = parseFloat(inputBuffer.current);
        if (!isNaN(radius)) {
          const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
          const material = new THREE.LineBasicMaterial({ color: 0xffffff });
          const segments = 64;
          const angleStep = (Math.PI * 2) / segments;
          const points = [];

          for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            points.push(new THREE.Vector3(
              center.x + radius * Math.cos(angle),
              center.y + radius * Math.sin(angle),
              0
            ));
          }

          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const circle = new THREE.LineLoop(geometry, material);
          circle.userData = {
             id: generateUniqueId(), 
             isSelectable: true ,
             type:"Circle"

            };
          scene.add(circle);

          if (tempCircleRef.current) {
            scene.remove(tempCircleRef.current);
            tempCircleRef.current.geometry.dispose();
            tempCircleRef.current.material.dispose();
            tempCircleRef.current = null;
          }

          inputBuffer.current = '';
          dispatch(resetOperation());
          dispatch(setCommandMessage(""));
          inputText.clear();
        }
      } else if (/\d|\./.test(e.key)) {
        inputBuffer.current += e.key;
        inputText.update(inputBuffer.current, lastMouse.current, {
          backgroundColor: 0x4444ff,
          color: 0xffffff,
          force: true
        });
      } else if (e.key === 'Backspace') {
        inputBuffer.current = inputBuffer.current.slice(0, -1);
        inputText.update(inputBuffer.current, lastMouse.current, {
          backgroundColor: 0x4444ff,
          color: 0xffffff,
          force: true
        });
      }
    };

    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      domElement.removeEventListener('click', handleClick);
      domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [commandType, step, data, scene, camera, renderer, dispatch, gridSnap, objectSnap, snapPoints,snapMode]);
};

export default useDrawCircle;
