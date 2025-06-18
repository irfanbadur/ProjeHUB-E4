import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  setOperationStep,
  setOperationData,
  resetOperation,
  setCommandMessage,
} from '../redux/operationSlice';
import { createSnapMarker } from '../utils/createSnapMarker';
import { useInputText } from '../utils/useInputText';
import { generateUniqueId } from '../utils/generateUniqueId';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { addAction } from '../redux/operationHistorySlice'; 
import { undo, redo } from '../utils/undoRedo'
import { setGlobalPolylineVerticesRef } from '../utils/sceneAction';
import { useStore } from 'react-redux'; // 💡 Eklemeyi unutma

const useDrawPolyline = (scene, camera, renderer,snapPoints) => {
  const store = useStore();
  const verticesRef = useRef([]);
  const tempLineRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const history = useSelector((state) => state.operationHistory);

  const inputText = useInputText(scene, camera);
  const dispatch = useDispatch();

  const { commandType } = useSelector((state) => state.operation);
  const gridSnap = useSelector((state) => state.mods.gridSnap);
  const objectSnap = useSelector((state) => state.mods.objectSnap);

  const snapMode = useSelector((state) => state.mods.snapMode);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // Ortho modu Redux'tan

  const gridSize = 10;

  const applyGridSnap = (point) => {
    return new THREE.Vector3(
      Math.round(point.x / gridSize) * gridSize,
      Math.round(point.y / gridSize) * gridSize,
      0
    );
  };
// Yardımcı fonksiyon: Ortho hizalama
const getOrthoSnappedPoint = (startPoint, currentPoint) => {
  const dx = Math.abs(currentPoint.x - startPoint.x);
  const dy = Math.abs(currentPoint.y - startPoint.y);
  if (dx > dy) {
    return new THREE.Vector3(currentPoint.x, startPoint.y, 0);
  } else {
    return new THREE.Vector3(startPoint.x, currentPoint.y, 0);
  }
};
useEffect(() => {
  setGlobalPolylineVerticesRef(verticesRef);
}, []);
 
  useEffect(() => {
    if (commandType !== 'drawPolyline' || !scene || !camera || !renderer) return;

    const domElement = renderer.domElement;
    dispatch(setCommandMessage("İlk noktayı seçin"));

    const handleClick = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastMouse.current = { x, y };
    
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
    
      const dynamicSnapPoints =snapPoints 
     let { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC,worldPoint,dynamicSnapPoints,camera,renderer, {snapMode:snapMode });

     // let finalPoint = snapPoint;
      if (!snapped) {
        if (gridSnap) {
          finalPoint = applyGridSnap(worldPoint);
        } else {
          finalPoint = worldPoint;
        }
      }
    
      // Ortho modu aktifse ve önceki bir vertex varsa, yeni noktayı hizala
      if (orthoMode && verticesRef.current.length > 0) {
        const lastVertex = verticesRef.current[verticesRef.current.length - 1];
        finalPoint = getOrthoSnappedPoint(lastVertex, finalPoint);
      }
    
      // Snap marker'ı temizle ve yenisini oluştur
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
    
      // Noktayı ekle
      verticesRef.current.push(finalPoint);
    
      // İki veya daha fazla nokta varsa geçici çizgiyi oluştur
      if (verticesRef.current.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
        }
    
        tempLineRef.current = new THREE.Line(geometry, material);
        scene.add(tempLineRef.current);
        tempLineRef.current.name = 'tempPolylinePreview'; // 🔁 undo/redo ile erişebilmek için gerekli

      }
      console.log('dispatching vertexAdd', verticesRef.current.length);
      dispatch(addAction({
        type: 'vertexAdd',
        objectUUID: 'polylineDrawing',
        before: verticesRef.current.slice(0, -1).map(p => p.toArray()),
        after: verticesRef.current.map(p => p.toArray()),
      }));
      dispatch(setCommandMessage("Sonraki noktaları seçin. Bitirmek için Enter/Space, iptal için ESC."));
    };
    
    

    
    const handleMouseMove = (event) => {
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastMouse.current = { x, y };
    
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
    
      const dynamicSnapPoints =snapPoints 
      const { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC,worldPoint, dynamicSnapPoints,camera,renderer,{snapMode:snapMode });

      // Snap marker'ı temizle ve yenisini oluştur
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
    
      // Önizleme noktasını belirle
      let previewPoint = finalPoint;
      if (orthoMode && verticesRef.current.length > 0) {
        const lastVertex = verticesRef.current[verticesRef.current.length - 1];
        previewPoint = getOrthoSnappedPoint(lastVertex, finalPoint);
      }
    
      // Eğer en az bir vertex varsa geçici çizgiyi güncelle
      if (verticesRef.current.length > 0) {
        const previewPoints = [...verticesRef.current, previewPoint];
        const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
        }
    
        tempLineRef.current = new THREE.Line(geometry, material);
        scene.add(tempLineRef.current);
      }
    };
    
    

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
          tempLineRef.current = null;
        }
        verticesRef.current = [];
        inputText.clear();
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (verticesRef.current.length > 1) {
          const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
          const material = new THREE.LineBasicMaterial({ color: 0xffffff });
          const line = new THREE.Line(geometry, material);
          line.userData = {
             id: generateUniqueId(),
             isSelectable: true ,
             type:"polyline"
            };
          scene.add(line);
          dispatch(addAction({
            type: 'create',
            objectUUID: line.uuid,
            after: {
              uuid: line.uuid,
              points: verticesRef.current.map(p => ({ x: p.x, y: p.y, z: p.z })),
              materialColor: 0xffffff,
              type: 'polyline'
            }
          }));
          
        }

        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
          tempLineRef.current = null;
        }
        verticesRef.current = [];
        inputText.clear();
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));
      }
      
      if (e.ctrlKey && e.key === 'z') {
        undo(scene, dispatch, store.getState); // ✅ redux state’in en güncel halini alır
      }
      if (e.ctrlKey && e.key === 'y') {
        redo(scene, dispatch, store.getState);
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
  }, [commandType, scene, camera, renderer, gridSnap, objectSnap, snapPoints, dispatch]);

};

export default useDrawPolyline;
