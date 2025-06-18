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
import { getPerpendicularIntersection } from '../utils/getPrependicularIntersection';
const createOffsetLine = (originalLine, lastVertex, distance = 5) => {
  const positions = originalLine.geometry.attributes.position.array;
  const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
  const end = new THREE.Vector3(positions[3], positions[4], positions[5]);

  const lineDir = new THREE.Vector3().subVectors(end, start).normalize();
  const normal = new THREE.Vector3(-lineDir.y, lineDir.x, 0).normalize();

  // 1. Dik izdüşüm noktasını bul
  const projected = getPerpendicularIntersection(lastVertex, { start, end });

  // 2. targetLine segmenti içinde mi?
  const segmentLength = start.distanceTo(end);
  const projToStart = projected.distanceTo(start);
  const projToEnd = projected.distanceTo(end);
  const isOnSegment = Math.abs(projToStart + projToEnd - segmentLength) < 0.01;

  // 3. Ofset yönünü belirle
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const toLast = new THREE.Vector3().subVectors(lastVertex, mid).normalize();
  const dot = normal.dot(toLast);

  // 🔁 Eğer dikme segmenti kesmiyorsa → yön ters çevrilmeli
  const adjustedNormal = (dot > 0) === isOnSegment ? normal : normal.multiplyScalar(-1);

  const offsetStart = start.clone().add(adjustedNormal.clone().multiplyScalar(distance));
  const offsetEnd = end.clone().add(adjustedNormal.clone().multiplyScalar(distance));

  const geometry = new THREE.BufferGeometry().setFromPoints([offsetStart, offsetEnd]);
  const material = new THREE.LineDashedMaterial({ color: 0x00ffff, dashSize: 5, gapSize: 3 });

  const offsetLine = new THREE.Line(geometry, material);
  offsetLine.computeLineDistances();
  offsetLine.name = 'offsetPreview';
  return offsetLine;
};



const useDrawPolyline = (scene, camera, renderer, snapPoints,   options = {}) => {
  const store = useStore();
  const verticesRef = useRef([]);
  const tempLineRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const offsetLineRef = useRef(null); // SnapWall kopya çizgisi
  const intersectedLineRef = useRef(null); // Mavi olacak çizgi
  const hasInitialPointBeenAdded = useRef(false);

  const snapState = useRef({ x: 0, y: 0 }); // ⬅️ eklendi: adımlama için
  const previewEndPointRef = useRef({ x: 0, y: 0 }); // ⬅️ eklendi: adımlama için
  const history = useSelector((state) => state.operationHistory);
  const {
    enabled = () => true,
    onPolylineComplete = () => {},
    onPreviewUpdate = () => {},
    initialPoint = null ,
  } = options;

  const inputText = useInputText(scene, camera);
  const dispatch = useDispatch();

  const { commandType } = useSelector((state) => state.operation);
  const gridSnap = useSelector((state) => state.mods.gridSnap);
  const objectSnap = useSelector((state) => state.mods.objectSnap);

  const snapMode = useSelector((state) => state.mods.snapMode);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // Ortho modu Redux'tan

  const gridSize = 10;
  const snapWall = true;

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

function click(x,y){
  lastMouse.current = { x, y };
  if (verticesRef.current.length === 0 && !initialPoint) {
    dispatch(setCommandMessage("İlk noktayı seçin"));
  }
  

   
  const mouseNDC = new THREE.Vector2(x, y);
  const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

  const dynamicSnapPoints = snapPoints;
  let { finalPoint, snapped, snapSource } = getSnappedPoint(
    mouseNDC,
    worldPoint,
    dynamicSnapPoints,
    camera,
    renderer,
    { snapMode }
  );

  if (snapWall && offsetLineRef.current && verticesRef.current.length > 0) {
    const targetLine = offsetLineRef.current;
    const positions = targetLine.geometry.attributes.position.array;
    const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const end = new THREE.Vector3(positions[3], positions[4], positions[5]);
    const lastVertex = verticesRef.current[verticesRef.current.length - 1];
    finalPoint = getPerpendicularIntersection(lastVertex, { start, end });
  } else if (!snapped) {
    finalPoint = gridSnap ? applyGridSnap(worldPoint) : worldPoint;
  }

  if (orthoMode && verticesRef.current.length > 0) {
    const lastVertex = verticesRef.current[verticesRef.current.length - 1];
    finalPoint = getOrthoSnappedPoint(lastVertex, finalPoint);
  }

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

  // ❗ Eğer sadece initialPoint varsa ve bu tıklama ile 2. nokta ekleniyorsa → normal akış
  verticesRef.current.push(finalPoint);

  dispatch(addAction({
    type: 'vertexAdd',
    objectUUID: 'polylineDrawing',
    before: verticesRef.current.slice(0, -1).map(p => p.toArray()),
    after: verticesRef.current.map(p => p.toArray()),
  }));

  dispatch(setCommandMessage("Sonraki noktaları seçin. Bitirmek için Enter/Space, iptal için ESC."));
  if (verticesRef.current.length === 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints([verticesRef.current[0]]);
    const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
  
    if (tempLineRef.current) {
      scene.remove(tempLineRef.current);
      tempLineRef.current.geometry.dispose();
      tempLineRef.current.material.dispose();
    }
  
    tempLineRef.current = new THREE.Line(geometry, material);
    scene.add(tempLineRef.current);
  }
}
useEffect(() => {
  setGlobalPolylineVerticesRef(verticesRef);
}, []);

useEffect(() => {
  if (initialPoint && verticesRef.current.length === 0 && !hasInitialPointBeenAdded.current) {
    const vector = new THREE.Vector3(initialPoint.x, initialPoint.y, 0);
    const ndc = vector.clone().project(camera); // Dünya → NDC
    click(ndc.x, ndc.y); // sadece ilk noktayı simüle et
    hasInitialPointBeenAdded.current = true;
  }
}, [initialPoint]);





  useEffect(() => {
    if (commandType !== 'drawPolyline' || !scene || !camera || !renderer) return;
    console.log("USE DRAW POLYLINE :",options,initialPoint )

    const domElement = renderer.domElement;
    dispatch(setCommandMessage("İlk noktayı seçin"));

  
    const handleClick = (event) => {
      if (!enabled()) return;
    
      // 🧠 Eğer sadece initialPoint varsa (1 vertex), ikinci tıklamada devam edilir
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      click(x,y)
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
        const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
    
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
        }
    
        tempLineRef.current = new THREE.Line(geometry, material);
        scene.add(tempLineRef.current);
      }
      //-------------------SNAP WALL --------------------
      if (snapWall) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseNDC, camera);
      
        // 🔹 Hem Line hem Polyline tipi nesneleri al
        const lines = scene.children.filter(
          (obj) =>
            obj.type === 'Line' &&
            (obj.userData?.type === 'line' || obj.userData?.type === 'polyline')
        );
      
        const intersects = raycaster.intersectObjects(lines);
      
        // 🔹 Önceki intersected çizgiyi temizle
        if (intersectedLineRef.current) {
          intersectedLineRef.current.material.color.set(0xffffff);
          intersectedLineRef.current = null;
        }
      
        if (offsetLineRef.current) {
          scene.remove(offsetLineRef.current);
          offsetLineRef.current.geometry.dispose();
          offsetLineRef.current.material.dispose();
          offsetLineRef.current = null;
        }
      
        if (intersects.length > 0) {
          const intersected = intersects[0].object;
          const geometry = intersected.geometry;
          const isPolyline = intersected.userData?.type === 'polyline';
      
          let targetSegment = null;
      
          if (isPolyline) {
            // polyline üzerindeki en yakın kenarı bul
            const vertices = geometry.attributes.position.array;
            let minDist = Infinity;
      
            for (let i = 0; i < vertices.length - 3; i += 3) {
              const start = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
              const end = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      
              const closest = getPerpendicularIntersection(worldPoint, { start, end });
              const dist = closest.distanceTo(worldPoint);
      
              if (dist < minDist) {
                minDist = dist;
                targetSegment = { start, end };
              }
            }
          } else {
            // normal line ise
            const pos = geometry.attributes.position.array;
            targetSegment = {
              start: new THREE.Vector3(pos[0], pos[1], pos[2]),
              end: new THREE.Vector3(pos[3], pos[4], pos[5]),
            };
          }
      
          if (targetSegment) {
            // 🔹 geçici intersectedLine gibi davranması için sahte nesne oluştur
            const tempGeometry = new THREE.BufferGeometry().setFromPoints([
              targetSegment.start,
              targetSegment.end,
            ]);
            const tempMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const tempLine = new THREE.Line(tempGeometry, tempMaterial);
      
            scene.add(tempLine);
            intersectedLineRef.current = tempLine;
      
            if (verticesRef.current.length > 0) {
              const lastVertex = verticesRef.current[verticesRef.current.length - 1];
              const offsetLine = createOffsetLine(tempLine, lastVertex, 5);
              scene.add(offsetLine);
              offsetLineRef.current = offsetLine;
            }
          }
        }
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

      
      
        // ⬇️ Yön tuşları için ek özellikler
        const movementOffset = 5;
        if (snapMarkerRef.current) {
          const snapPos = snapMarkerRef.current.position.clone();
          const previousPos = verticesRef.current[verticesRef.current.length - 1];
          if (!previousPos) return;
          let newPos = new THREE.Vector3(previousPos.x, previousPos.y, 0);
      
          const isSnapRight = snapPos.x >= previousPos.x;
          const isSnapLeft = snapPos.x <= previousPos.x;
          const isSnapUp = snapPos.y >= previousPos.y;
          const isSnapDown = snapPos.y <= previousPos.y;
      
          if (e.key === 'a' && isSnapLeft) {
            snapState.current.y = 0;
            if (!snapState.current.x) {
              newPos.x = snapPos.x + movementOffset;
              snapState.current.x = 1;
            } else if (snapState.current.x === 1) {
              newPos.x = snapPos.x;
              snapState.current.x = 2;
            } else {
              newPos.x = snapPos.x - movementOffset;
              snapState.current.x = 0;
            }
          } else if (e.key === 'd' && isSnapRight) {
            snapState.current.y = 0;
            if (!snapState.current.x) {
              newPos.x = snapPos.x - movementOffset;
              snapState.current.x = 1;
            } else if (snapState.current.x === 1) {
              newPos.x = snapPos.x;
              snapState.current.x = 2;
            } else {
              newPos.x = snapPos.x + movementOffset;
              snapState.current.x = 0;
            }
          } else if (e.key === 'w' && isSnapUp) {
            snapState.current.x = 0;
            if (!snapState.current.y) {
              newPos.y = snapPos.y - movementOffset;
              snapState.current.y = 1;
            } else if (snapState.current.y === 1) {
              newPos.y = snapPos.y;
              snapState.current.y = 2;
            } else {
              newPos.y = snapPos.y + movementOffset;
              snapState.current.y = 0;
            }
          } else if (e.key === 's' && isSnapDown) {
            snapState.current.x = 0;
            if (!snapState.current.y) {
              newPos.y = snapPos.y + movementOffset;
              snapState.current.y = 1;
            } else if (snapState.current.y === 1) {
              newPos.y = snapPos.y;
              snapState.current.y = 2;
            } else {
              newPos.y = snapPos.y - movementOffset;
              snapState.current.y = 0;
            }
          }
      

        }
      
        if (e.key === 'q') {
          const previousPos = verticesRef.current[verticesRef.current.length - 1];
          if (!previousPos) return;
        
          const mouseWorld = new THREE.Vector3(
            lastMouse.current.x,
            lastMouse.current.y,
            0
          ).unproject(camera);
        
          const direction = new THREE.Vector3().subVectors(mouseWorld, previousPos).normalize();
        
          const newPos = new THREE.Vector3().addVectors(
            previousPos,
            direction.multiplyScalar(movementOffset)
          );
        
          verticesRef.current.push(newPos);
        }
        
        
      
        if (e.key === 'e') {
          const previousPos = verticesRef.current[verticesRef.current.length - 1];
          const mouseNDC = new THREE.Vector2(lastMouse.current.x, lastMouse.current.y);
          const mouseWorld = new THREE.Vector3(lastMouse.current.x, lastMouse.current.y, 0).unproject(camera);
      
          const deltaX = mouseWorld.x - previousPos.x;
          const deltaY = mouseWorld.y - previousPos.y;
      
          const offsetLength = 7.07106781187;
          const dx = offsetLength / Math.sqrt(2);
          const dy = dx;
      
          let offset = new THREE.Vector3();
          if (deltaX >= 0 && deltaY >= 0) offset.set(dx, dy, 0);
          else if (deltaX < 0 && deltaY >= 0) offset.set(-dx, dy, 0);
          else if (deltaX < 0 && deltaY < 0) offset.set(-dx, -dy, 0);
          else offset.set(dx, -dy, 0);
      
          const newPos = new THREE.Vector3().addVectors(previousPos, offset);
          verticesRef.current.push(newPos);
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
