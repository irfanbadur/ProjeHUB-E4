import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setOperationStep,
  setOperationData,
  resetOperation,
  setCommandMessage,
} from '../redux/operationSlice';
import * as THREE from 'three';
import { createSnapMarker } from '../utils/createSnapMarker';
import { useInputText } from '../utils/useInputText'
import { generateUniqueId } from '../utils/generateUniqueId'
import { getSnappedPoint } from '../utils/getSnappedPoint';
const useDrawLine = (scene, camera, renderer, snapPoints) => {
  const lastMouse = useRef({ x: 0, y: 0 });
  const tempLineRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const snappedPointRef = useRef(null);
  const inputBuffer = useRef('');

  const inputText = useInputText(scene, camera);

  const { commandType, step, data } = useSelector((state) => state.operation);
  const gridSnap = useSelector((state) => state.mods.gridSnap);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const snapMode = useSelector((state) => state.mods.snapMode);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // 1️⃣ Ortho modu
  const inputTextBackGroundOption = {
    backgroundColor: 0x4444ff, // koyu gri, şeffaf zemin
    color: 0xffffff,             // sarı metin
    force: true
  }
  const dispatch = useDispatch();
  const gridSize = 10;
  // 2️⃣ Ortho snap helper
  const getOrthoSnappedPoint = (startPoint, currentPoint) => {
    const dx = Math.abs(currentPoint.x - startPoint.x);
    const dy = Math.abs(currentPoint.y - startPoint.y);
    if (dx > dy) {
      return new THREE.Vector3(currentPoint.x, startPoint.y, 0); // Yatay
    } else {
      return new THREE.Vector3(startPoint.x, currentPoint.y, 0); // Dikey
    }
  };
 

  useEffect(() => {
    if (commandType !== 'drawLine' || !renderer || !camera || !scene) return;

    const domElement = renderer.domElement;

    const applyGridSnap = (point) => {
      return new THREE.Vector3(
        Math.round(point.x / gridSize) * gridSize,
        Math.round(point.y / gridSize) * gridSize,
        0
      );
    };

 
    inputText.update(inputBuffer.current, lastMouse.current);

    const handleClick = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

      let { finalPoint, snapped } = getSnappedPoint( mouseNDC,worldPoint,snapPoints,camera,renderer,{snapMode:snapMode });
      console.log("CLICK SNAP", { snapped, finalPoint });
      // Snapping başarısızsa gridSnap veya raw world point
      if (!snapped) {
        if (gridSnap) {
          finalPoint = applyGridSnap(worldPoint);
        } else {
          finalPoint = worldPoint;
        }
      }

      // Eğer ortho açıksa ve adım 1 ise orto noktasına hizala
      let point = finalPoint;
      if (step === 1 && orthoMode) {
        const { startPoint } = data;
        point = getOrthoSnappedPoint(
          new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
          finalPoint
        );
      }

      if (step === 0) {
        dispatch(setCommandMessage("2. noktayı seçin"));
        dispatch(setOperationData({ startPoint: { x: point.x, y: point.y, z: point.z } }));
        dispatch(setOperationStep(1));

        const geometry = new THREE.BufferGeometry().setFromPoints([point, point]);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        tempLineRef.current = line;

      } else if (step === 1) {
        const { startPoint } = data;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
          point
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.Line(geometry, material);
        line.userData = {
          id: generateUniqueId(),
          isSelectable: true,
          type: "line",
          pos: [startPoint.x, startPoint.y, startPoint.z]

        };
        scene.add(line);

        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
        }

        const tempGeometry = new THREE.BufferGeometry().setFromPoints([point, point]);
        const tempMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const tempLine = new THREE.Line(tempGeometry, tempMaterial);
        scene.add(tempLine);
        tempLineRef.current = tempLine;

        dispatch(setOperationData({ startPoint: { x: point.x, y: point.y, z: point.z } }));
        dispatch(setCommandMessage("sonraki noktayı seçin yada ESC,Space,Enter ile bitirin."));
      }

      inputText.clear();
    };



    const handleMouseMove = (event) => {
      if (!renderer || !camera || !scene) return;

      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastMouse.current = { x, y };

      const mouseNDC = new THREE.Vector2(x, y);
      const point = new THREE.Vector3(x, y, 0).unproject(camera);

      const { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC,point, snapPoints,camera,renderer,{snapMode:snapMode });

      // Snap marker
      if (snapped && snapSource) {
        if (!snapMarkerRef.current) {
          const marker = createSnapMarker(8, snapSource);
          scene.add(marker);
          snapMarkerRef.current = marker;
        }
        snapMarkerRef.current.position.copy(snapSource.position);
      } else {
        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
        }
      }

      // Ortho aktifse, önizleme çizgisini hizala
      let previewPoint = finalPoint;
      if (step === 1 && orthoMode) {
        const { startPoint } = data;
        previewPoint = getOrthoSnappedPoint(
          new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
          finalPoint
        );
      }

      // Önizleme çizgisi güncelle
      if (step === 1 && tempLineRef.current) {
        const { startPoint } = data;
        const sp = new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z);
        tempLineRef.current.geometry.setFromPoints([sp, previewPoint]);
      }

      inputText.update(inputBuffer.current, lastMouse.current, inputTextBackGroundOption);
    };


    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === " ") {
        inputText.clear();
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
          tempLineRef.current = null;
        }
        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
        }

        snappedPointRef.current = null;
        inputBuffer.current = '';
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
      } else if (e.key === 'Enter' && step === 1 && inputBuffer.current) {
        inputText.clear();
        const distance = parseFloat(inputBuffer.current);
        if (!isNaN(distance)) {
          const { startPoint } = data;
          const sp = new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z);
          const ep = new THREE.Vector3();

          const dir = tempLineRef.current.geometry.attributes.position.array;
          const dx = dir[3] - dir[0];
          const dy = dir[4] - dir[1];
          const dz = dir[5] - dir[2];
          const direction = new THREE.Vector3(dx, dy, dz).normalize();

          ep.copy(sp).addScaledVector(direction, distance);

          const geometry = new THREE.BufferGeometry().setFromPoints([sp, ep]);
          const material = new THREE.LineBasicMaterial({ color: 0xffffff });
          const line = new THREE.Line(geometry, material);
          const length = sp.distanceTo(ep);
          line.userData = {
            id: generateUniqueId(),
            isSelectable: true,
            type: "line",
            pos: [sp, ep]
          };

          scene.add(line);

          if (tempLineRef.current) {
            scene.remove(tempLineRef.current);
            tempLineRef.current.geometry.dispose();
            tempLineRef.current.material.dispose();
          }


          const tempGeometry = new THREE.BufferGeometry().setFromPoints([ep, ep]);
          const tempMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
          const tempLine = new THREE.Line(tempGeometry, tempMaterial);
          scene.add(tempLine);
          tempLineRef.current = tempLine;

          dispatch(setOperationData({ startPoint: { x: ep.x, y: ep.y, z: ep.z } }));
          dispatch(setCommandMessage("sonraki noktayı seçin yada ESC,Space,Enter ile bitirin."));
          inputBuffer.current = '';
        }
      } else if (/\d|\./.test(e.key)) {
        inputBuffer.current += e.key;
        inputText.update(inputBuffer.current, lastMouse.current, inputTextBackGroundOption);
      } else if (e.key === 'Backspace') {
        inputBuffer.current = inputBuffer.current.slice(0, -1);
        inputText.update(inputBuffer.current, lastMouse.current, inputTextBackGroundOption);
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
  }, [commandType, step, data, scene, camera, renderer, dispatch, gridSnap, objectSnap, snapPoints]);
};

export default useDrawLine;
