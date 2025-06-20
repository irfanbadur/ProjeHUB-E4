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
  const rotationPanelRef = useRef(false);
  const dispatch = useDispatch();
const symmetricalOffset= 26
  const { commandType } = useSelector((state) => state.operation);

  useEffect(() => {
    if (commandType !== 'drawPanel' || !scene || !camera || !renderer) return;
    dispatch(setCommandMessage('Panel yerleştirme noktasını seçin'));
    
    const domElement = renderer.domElement;
    function findClosestLine(scene, mousePos, threshold = 20) {
      let closest = null;
      let minDistance = threshold;
    
      scene.traverse((object) => {
        if (object.isLine) {
          if(object.userData.isPanelPart) return null
          const geometry = object.geometry;
          const positions = geometry.attributes.position.array;
    
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
    
    // İki noktalı çizgi segmenti üzerindeki en yakın noktayı bulan fonksiyon
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

const handleMouseMove = (event) => {
  let mousePos = getMouseWorldPosition(event);
  const closestLine = findClosestLine(scene, mousePos);

  let angleRadians = 0;

  if (closestLine) {
    const { start, end } = closestLine;

    // === 1. çizginin yönünü ve dönüş açısını hesapla ===
    const dir = new THREE.Vector2(end.x - start.x, end.y - start.y).normalize();
    angleRadians = Math.atan2(dir.y, dir.x) + Math.PI / 2;
    // === 2. çizgi üzerindeki izdüşüm noktası ===
    const projectionPoint = closestPointOnLineSegment(start, end, mousePos);
    // === 3. normal vektörü al ve döndür ===
    let normal = new THREE.Vector3(-dir.y, dir.x, 0);
    normal.applyAxisAngle(new THREE.Vector3(0, 0, 1), angleRadians);
    // === 4. mousePos = döndürülmüş normal ile ofsetlenmiş pozisyon ===
    const offsetVector = normal.multiplyScalar(0);
    mousePos = projectionPoint.clone().add(offsetVector);
  }
  let createPanelDirection=1
if(rotationPanelRef.current)
  { createPanelDirection=-1 }
else
{createPanelDirection=1} 

  if (previewPanelRef.current) {
    scene.remove(previewPanelRef.current);
    previewPanelRef.current.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }

  const tempGroup = createPanel(scene, mousePos,createPanelDirection,symmetricalOffset, true);
  previewPanelRef.current = tempGroup;
  tempGroup.rotation.z = angleRadians;

  scene.add(tempGroup);
};


    const handleMouseClick = (event) => {
      let mousePos = getMouseWorldPosition(event);
      const closestLine = findClosestLine(scene, mousePos);
    
      let angleRadians = 0;
    
      if (closestLine) {
        const { start, end } = closestLine;
    
        // === 1. çizginin yönünü ve dönüş açısını hesapla ===
        const dir = new THREE.Vector2(end.x - start.x, end.y - start.y).normalize();
        angleRadians = Math.atan2(dir.y, dir.x) + Math.PI / 2;
        // === 2. çizgi üzerindeki izdüşüm noktası ===
        const projectionPoint = closestPointOnLineSegment(start, end, mousePos);
        // === 3. normal vektörü al ve döndür ===
        let normal = new THREE.Vector3(-dir.y, dir.x, 0);
        normal.applyAxisAngle(new THREE.Vector3(0, 0, 1), angleRadians);
        // === 4. mousePos = döndürülmüş normal ile ofsetlenmiş pozisyon ===
        const offsetVector = normal.multiplyScalar(0);
        mousePos = projectionPoint.clone().add(offsetVector);
      }
      let createPanelDirection=1
    if(rotationPanelRef.current)
      { createPanelDirection=-1 }
    else
    {createPanelDirection=1} 
    
      if (previewPanelRef.current) {
        scene.remove(previewPanelRef.current);
        previewPanelRef.current.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        
      }
      let panels=[]
      scene.traverse(obj=>{
        if(obj.userData.type==="electricalPanel")
          panels.push(obj)
      })
      const panelKatPlanNo=panels.length

      const tempGroup = createPanel(scene, mousePos,createPanelDirection,symmetricalOffset, true,panelKatPlanNo);
  
      tempGroup.rotation.z = angleRadians;
    
      scene.add(tempGroup);

      dispatch(resetOperation());
      dispatch(setCommandMessage(''));
    };
    

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewPanelRef.current) {
          scene.remove(previewPanelRef.current);
          previewPanelRef.current.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
          previewPanelRef.current = null;
        }

        dispatch(resetOperation());
        dispatch(setCommandMessage(''));
      }
      if (e.key === 'r') {
     console.log("R tuşuna basıldı RotationPanelRef : ")
      rotationPanelRef.current=!rotationPanelRef.current
      }
    };

    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('click', handleMouseClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('click', handleMouseClick);
      window.removeEventListener('keydown', handleKeyDown);

      if (previewPanelRef.current) {
        scene.remove(previewPanelRef.current);
        previewPanelRef.current.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        previewPanelRef.current = null;
      }
    };
  }, [commandType, scene, camera, renderer, dispatch]);
  
};
