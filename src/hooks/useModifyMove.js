import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  setOperationStep,
  resetOperation,
  setCommandMessage,
} from '../redux/operationSlice';
import { getObjectById } from '../utils/getObjectById';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';

const useModifyMove = (scene, camera, renderer, refreshSnapPoints) => {
  const { commandType, step } = useSelector((state) => state.operation);
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);
  const snapMode = useSelector((state) => state.mods.snapMode);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const dispatch = useDispatch();

  const initialPositionsRef = useRef({});
  const basePointRef = useRef(null);
  const lastSnappedPointRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const snapPointsRef = useRef([]);

  useEffect(() => {
    if (commandType !== 'move' || !scene || !camera || !renderer) return;

    const domElement = renderer.domElement;
    dispatch(setCommandMessage(step === 0 ? 'Taşımak için referans nokta seçin' : 'Taşıma hedefini seçin'));

    // Snap noktaları başlangıçta al
    if (refreshSnapPoints) {
      snapPointsRef.current = refreshSnapPoints() || [];
    }

    const handleClick = (e) => {
      if (!selectedObjectIds.length) return;

      if (step === 0) {
        const { finalPoint } = getSnappedFromMouse(e);
        if (!finalPoint) return;

        basePointRef.current = finalPoint.clone();

        const initialPositions = {};
        selectedObjectIds.forEach((id) => {
          const obj = getObjectById(scene, id);
          if (obj) {
            initialPositions[id] = obj.position.clone();
          }
        });
        initialPositionsRef.current = initialPositions;

        dispatch(setOperationStep(1));
        dispatch(setCommandMessage('Taşıma hedefini seçin'));
      } else if (step === 1) {
        const finalPoint = lastSnappedPointRef.current;
        if (!finalPoint || !basePointRef.current) return;

        const dx = finalPoint.x - basePointRef.current.x;
        const dy = finalPoint.y - basePointRef.current.y;

        selectedObjectIds.forEach((id) => {
          const obj = getObjectById(scene, id);
          const original = initialPositionsRef.current[id];
          if (obj && original) {
            obj.position.set(original.x + dx, original.y + dy, original.z);
          }
        });

        cleanup();
        dispatch(resetOperation());
      }
    };

    const handleMouseMove = (e) => {
      if (step !== 1 || !basePointRef.current) return;

      const { finalPoint, snapped, snapSource } = getSnappedFromMouse(e);

      if (!finalPoint) return;

      lastSnappedPointRef.current = finalPoint;

      // Marker'ı güncelle
      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }

      if (snapped && snapSource) {
        const marker = createSnapMarker(8, snapSource);
        marker.position.copy(snapSource.position);
        scene.add(marker);
        snapMarkerRef.current = marker;
      }

      // Hareketli objeleri güncelle
      const dx = finalPoint.x - basePointRef.current.x;
      const dy = finalPoint.y - basePointRef.current.y;

      selectedObjectIds.forEach((id) => {
        const obj = getObjectById(scene, id);
        const original = initialPositionsRef.current[id];
        if (obj && original) {
          obj.position.set(original.x + dx, original.y + dy, original.z);
        }
      });

      if (refreshSnapPoints) {
        snapPointsRef.current = refreshSnapPoints() || [];
      }
    };

    const handleKeyDown = (e) => {
      
      if (e.key === 'Escape') {
        // Pozisyonları geri al
        selectedObjectIds.forEach((id) => {
          const obj = getObjectById(scene, id);
          const original = initialPositionsRef.current[id];
          if (obj && original) {
            obj.position.copy(original);
          }
        });
        cleanup();
        dispatch(resetOperation());
      }
    };

    const cleanup = () => {
      basePointRef.current = null;
      initialPositionsRef.current = {};
      lastSnappedPointRef.current = null;

      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }
    };
    const getSnappedFromMouse = (e) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
      return getSnappedPoint(mouseNDC, worldPoint, snapPointsRef.current, camera, renderer, { snapMode, objectSnap });
    };


    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      domElement.removeEventListener('click', handleClick);
      domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [commandType, step, scene, camera, renderer, selectedObjectIds, dispatch, snapMode, objectSnap]);
};

export default useModifyMove;
