import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCommandMessage,
  resetOperation,
  setOperationData,
  setOperationStep,
} from '../redux/operationSlice';
import { getSnapPointsFromScene } from '../utils/getSnapPointsFromScene';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';
import { generateUniqueId } from '../utils/generateUniqueId';

const useDrawRect = (scene, camera, renderer,snapPoints) => {
  const snapMarkerRef = useRef(null);
  const tempRectRef = useRef(null); // sadece önizleme için
  const orthoEndPointRef = useRef(null); // step 1'deki orto nokta
  const dispatch = useDispatch();

  const { commandType, step, data } = useSelector(state => state.operation);
  const gridSnap = useSelector(state => state.mods.gridSnap);
  const objectSnap = useSelector(state => state.mods.objectSnap);
  const orthoMode = useSelector(state => state.mods.orthoMode);
  const snapMode = useSelector((state) => state.mods.snapMode);

  const gridSize = 10;
  const serializeVector = (v) => ({ x: v.x, y: v.y, z: v.z });

  const applyGridSnap = (point) => {
    return new THREE.Vector3(
      Math.round(point.x / gridSize) * gridSize,
      Math.round(point.y / gridSize) * gridSize,
      0
    );
  };

  const getOrthoPointForRect = (start, end, rawPoint) => {
    const baseVec = end.clone().sub(start);
    const baseAngle = Math.atan2(baseVec.y, baseVec.x);
    const dir = new THREE.Vector2().subVectors(
      new THREE.Vector2(rawPoint.x, rawPoint.y),
      new THREE.Vector2(start.x, start.y)
    );
    const projectionLength = Math.abs(dir.x * Math.sin(baseAngle) - dir.y * Math.cos(baseAngle));
    const heightVector = new THREE.Vector3(
      -Math.sin(baseAngle) * projectionLength,
      Math.cos(baseAngle) * projectionLength,
      0
    );
    return start.clone().add(heightVector);
  };

  const getOrthoSnappedPoint = (start, current) => {
    const dx = Math.abs(current.x - start.x);
    const dy = Math.abs(current.y - start.y);
    return dx > dy
      ? new THREE.Vector3(current.x, start.y, 0) // yatay
      : new THREE.Vector3(start.x, current.y, 0); // dikey
  };

  const drawRectangle = (start, end, third, color = 0xffff00, isPreview = true) => {
    const baseVec = end.clone().sub(start);
    const baseLength = baseVec.length();
    const baseAngle = Math.atan2(baseVec.y, baseVec.x);
    const heightVec = third.clone().sub(start).applyAxisAngle(new THREE.Vector3(0, 0, 1), -baseAngle);
    const height = heightVec.y;

    const rectPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(baseLength, 0, 0),
      new THREE.Vector3(baseLength, height, 0),
      new THREE.Vector3(0, height, 0),
      new THREE.Vector3(0, 0, 0),
    ];

    const rotationMatrix = new THREE.Matrix4()
      .makeRotationZ(baseAngle)
      .setPosition(start.x, start.y, 0);

    const finalPoints = rectPoints.map(p => p.clone().applyMatrix4(rotationMatrix));
    const geometry = new THREE.BufferGeometry().setFromPoints(finalPoints);
    const material = new THREE.LineBasicMaterial({ color });

    const rect = new THREE.Line(geometry, material);
    rect.userData = { id: generateUniqueId(), 
        isSelectable: true ,
        type:"rect",
        start:{x:start.x,y:start.y,z:0},
       width:baseLength,
       height:height,
       angle:baseAngle
    };

    if (isPreview) {
      if (tempRectRef.current) {
        scene.remove(tempRectRef.current);
        tempRectRef.current.geometry.dispose();
        tempRectRef.current.material.dispose();
      }
      tempRectRef.current = rect;
    }

    scene.add(rect);
  };

  useEffect(() => {
    if (commandType !== 'drawRect' || !scene || !camera || !renderer) return;

    const domElement = renderer.domElement;
    dispatch(setCommandMessage("İlk köşe noktasını seçin."));

    const handleClick = (e) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

      let { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC, worldPoint, snapPoints, camera, renderer, {snapMode:snapMode });
      const point = (objectSnap && snapped) ? finalPoint.clone() : (gridSnap ? applyGridSnap(worldPoint) : worldPoint.clone());

      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }

      if (snapped && snapSource) {
        const marker = createSnapMarker(8, snapSource);
        marker.position.copy(finalPoint);
        scene.add(marker);
        snapMarkerRef.current = marker;
      }

      if (step === 0) {
        dispatch(setOperationData({ start: serializeVector(point) }));
        dispatch(setOperationStep(1));
        dispatch(setCommandMessage("Taban kenar için ikinci köşeyi seçin."));
      } else if (step === 1) {
        const usedPoint = orthoMode && orthoEndPointRef.current
          ? orthoEndPointRef.current.clone()
          : point.clone();
        dispatch(setOperationData({ ...data, end: serializeVector(usedPoint) }));
        dispatch(setOperationStep(2));
        dispatch(setCommandMessage("Dik kenar yüksekliği için üçüncü noktayı seçin."));
      } else if (step === 2) {
        const start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
        const end = new THREE.Vector3(data.end.x, data.end.y, data.end.z);
        const rawThird = point.clone();
        const third = orthoMode ? getOrthoPointForRect(start, end, rawThird) : rawThird;
        drawRectangle(start, end, third, 0xffffff, false); // ⬅️ final çizim, silinmez
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
      }
    };

    const handleMouseMove = (e) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

      const { finalPoint, snapped, snapSource } = getSnappedPoint(
        mouseNDC,
        worldPoint,
        snapPoints,
        camera,
        renderer,
        { snapMode }
      );      
      const point = (objectSnap && snapped) ? finalPoint.clone() : (gridSnap ? applyGridSnap(worldPoint) : worldPoint.clone());

      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }

      if (snapped && snapSource) {
        const marker = createSnapMarker(8, snapSource);
        marker.position.copy(finalPoint);
        scene.add(marker);
        snapMarkerRef.current = marker;
      }

      if (step === 1) {
        const start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
        const preview = orthoMode ? getOrthoSnappedPoint(start, point) : point;
        orthoEndPointRef.current = preview.clone(); // kaydet
        drawRectangle(start, preview, preview, 0xffff00, true);
      } else if (step === 2) {
        const start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
        const end = new THREE.Vector3(data.end.x, data.end.y, data.end.z);
        const third = orthoMode ? getOrthoPointForRect(start, end, point) : point;
        drawRectangle(start, end, third, 0xffff00, true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (tempRectRef.current) {
          scene.remove(tempRectRef.current);
          tempRectRef.current.geometry.dispose();
          tempRectRef.current.material.dispose();
          tempRectRef.current = null;
        }
        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
        }
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
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
  }, [commandType, step, data, scene, camera, orthoMode, renderer, dispatch, gridSnap,snapMode, objectSnap]);
};

export default useDrawRect;
