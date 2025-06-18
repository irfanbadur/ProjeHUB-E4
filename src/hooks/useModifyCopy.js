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
import { generateUniqueId } from '../utils/generateUniqueId';
import { cloneUserDataForCopy } from '../utils/cloneUserDataForCopy';

const useModifyCopy = (scene, camera, renderer, refreshSnapPoints) => {
  const { commandType, step } = useSelector((state) => state.operation);
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);
  const snapMode = useSelector((state) => state.mods.snapMode);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const dispatch = useDispatch();

  const basePointRef = useRef(null);
  const tempCopiesRef = useRef([]);
  const snapMarkerRef = useRef(null);
  const snapPointsRef = useRef([]);
  const originalObjectsRef = useRef([]);

  useEffect(() => {
    if (commandType !== 'copy' || !scene || !camera || !renderer) return;

    const domElement = renderer.domElement;

    if (step === 0 && refreshSnapPoints) {
      snapPointsRef.current = refreshSnapPoints(selectedObjectIds) || [];
    }

    if (step === 0) {
      dispatch(setCommandMessage('Kopyalama için referans nokta seçin'));
    }

 

const handleClick = (e) => {
  const rect = domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  const mouseNDC = new THREE.Vector2(x, y);
  const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

  const { finalPoint } = getSnappedPoint(
    mouseNDC,
    worldPoint,
    snapPointsRef.current,
    camera,
    renderer,
    { snapMode, objectSnap }
  );

  if (step === 0) {
    basePointRef.current = finalPoint.clone();
  
    // Snap noktalarını sadece burada yükle
    if (refreshSnapPoints) {
      snapPointsRef.current = refreshSnapPoints(selectedObjectIds) || [];
    }
  
    const originals = selectedObjectIds.map((id) => getObjectById(scene, id)).filter(Boolean);
    originalObjectsRef.current = originals;
  
    dispatch(setOperationStep(1));
    dispatch(setCommandMessage('Kopyaları bırakmak için hedef nokta seçin'));
  } else if (step === 1) {
    const dx = finalPoint.x - basePointRef.current.x;
    const dy = finalPoint.y - basePointRef.current.y;

    originalObjectsRef.current.forEach((original) => {
      const clone = original.clone();

      if (original.material?.clone) {
        clone.material = original.material.clone();
        if (original.userData.originalColor) {
          const colorObject = new THREE.Color(original.userData.originalColor);
          clone.material.color.copy(colorObject);
        }
      }

      if (original.geometry?.clone) {
        clone.geometry = original.geometry.clone();
      }

      clone.userData = {
        ...cloneUserDataForCopy(original.userData),
        id: generateUniqueId(),
        originalColor: original.userData.originalColor || clone.material.color.getHex(),
        isSelectable: true,
      };

      clone.position.set(
        original.position.x + dx,
        original.position.y + dy,
        original.position.z
      );

      scene.add(clone);
    });

    // cleanup
    basePointRef.current = null;
    originalObjectsRef.current = [];
    snapPointsRef.current = [];
    if (snapMarkerRef.current) {
      scene.remove(snapMarkerRef.current);
      snapMarkerRef.current.geometry.dispose();
      snapMarkerRef.current.material.dispose();
      snapMarkerRef.current = null;
    }

    dispatch(resetOperation());
    if (refreshSnapPoints) {
      // render işlemi bittikten sonra snap noktalarını güncelle
      setTimeout(() => {
        refreshSnapPoints();
      }, 0);
    }
    
  }
};

      
      

      

    const handleMouseMove = (e) => {
      if (step !== 1 || !basePointRef.current) return;

      const rect = domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

      const { finalPoint, snapped, snapSource } = getSnappedPoint(
        mouseNDC,
        worldPoint,
        snapPointsRef.current,
        camera,
        renderer,
        { snapMode, objectSnap }
      );

      const dx = finalPoint.x - basePointRef.current.x;
      const dy = finalPoint.y - basePointRef.current.y;

      // Önceki geçici kopyaları temizle
      tempCopiesRef.current.forEach((copy) => {
        scene.remove(copy);
        copy.geometry?.dispose?.();
        copy.material?.dispose?.();
      });
      tempCopiesRef.current = [];

      // Yeni geçici kopyaları oluştur
      selectedObjectIds.forEach((id) => {
        const original = getObjectById(scene, id);
        if (original) {
            
          const clone = original.clone();
      
          // 🟡 Bonus: Materyal ve geometriyi de kopyala
          if (original.material?.clone) {
            clone.material = original.material.clone();
          }
          if (original.geometry?.clone) {
            clone.geometry = original.geometry.clone();
          }
      
          // 🟢 UserData'yı güvenli şekilde kopyala
          clone.userData = {
            ...cloneUserDataForCopy(original.userData),
            id: generateUniqueId(),
            isSelectable: true,
          };
      
          clone.position.set(
            original.position.x + dx,
            original.position.y + dy,
            original.position.z
          );
      
          scene.add(clone);
          tempCopiesRef.current.push(clone);
        }
      });
      

      // Snap Marker
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
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          // Gerçekten iptal edildiyse cleanup() çağrılır
          cleanup();
          dispatch(resetOperation());
        }
      };
      
      const cleanup = () => {
        basePointRef.current = null;
        snapPointsRef.current = [];
      
        // ❗ Gerçek iptal durumunda sahneden kopyaları kaldır
        tempCopiesRef.current.forEach((copy) => {
          scene.remove(copy);
          copy.geometry?.dispose?.();
          copy.material?.dispose?.();
        });
        tempCopiesRef.current = [];
      
        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
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
  }, [
    commandType,
    step,
    scene,
    camera,
    renderer,
    selectedObjectIds,
    snapMode,
    objectSnap,
    refreshSnapPoints,
    dispatch,
  ]);
};

export default useModifyCopy;
