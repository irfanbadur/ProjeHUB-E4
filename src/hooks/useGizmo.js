import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector } from "react-redux";
import { createSnapMarker } from '../utils/createSnapMarker';
import { getSnapPointsFromScene } from '../utils/getSnapPointsFromScene';

export function useGizmo(scene, camera, domElement) {
  const selectedGizmo = useRef(null);
  const isMoving = useRef(false);
  const originalPosition = useRef(new THREE.Vector3());
   const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const offset = new THREE.Vector3();
  const planeIntersect = new THREE.Vector3();
  const snapMarkerRef = useRef(null);
  const snappedPointRef = useRef(null);

  const objectSnap = useSelector((state) => state.mods.objectSnap);

  useEffect(() => {
    if (!scene || !camera || !domElement) return;

    const getMouse = (event) => {
      const rect = domElement.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };

    const getSnapDistance = (pixels = 10) => {
      const v1 = new THREE.Vector3(-1, 0, 0).unproject(camera);
      const v2 = new THREE.Vector3(-1 + (pixels / domElement.clientWidth) * 2, 0, 0).unproject(camera);
      return v1.distanceTo(v2);
    };

    const onClick = (event) => {
      const mouse = getMouse(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const gizmo = intersects.find(i => i.object.name.startsWith("__gizmo"));

      if (!isMoving.current && gizmo) {
        selectedGizmo.current = gizmo.object;
        
 
        originalPosition.current.copy(gizmo.object.position);
         isMoving.current = true;
         plane.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(new THREE.Vector3()),
          selectedGizmo.current.position
        );
        raycaster.ray.intersectPlane(plane, planeIntersect);
        offset.copy(planeIntersect).sub(selectedGizmo.current.position);
      } else if (isMoving.current) {
        selectedGizmo.current = null;
        isMoving.current = false;
      }
    };

    const onMouseMove = (event) => {
        if (!isMoving.current || !selectedGizmo.current) return;
        const mouse = getMouse(event);
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, planeIntersect);
      
        const gizmoTargetPosition = planeIntersect.clone().sub(offset);
        let snapped = false;
        let finalTarget = gizmoTargetPosition.clone();
      
        const snapPoints = getSnapPointsFromScene(scene);
        const snapDist = getSnapDistance();
        const previewThreshold = snapDist * 2;
      
        let closestSnap = null;
        let minDistance = Infinity;
      
        for (let sp of snapPoints) {
          // 🟡 Yalnızca sabit nesnelere snap (gizmo'nun kendisini dışla)
       /*    if (sp.object && sp.object.uuid === selectedGizmo.current.uuid) continue; */
        if(selectedGizmo.current.userData&& selectedGizmo.current.userData.objUUID!= sp.no){          
          const distance = gizmoTargetPosition.distanceTo(sp.position);
          if (distance < 20) {
            minDistance = distance;            
            closestSnap = sp;
            
          }
        }
        }
        // 🟡 Önizleme: sadece yakınsa göster
        if (closestSnap && minDistance < previewThreshold) {

          if (!snapMarkerRef.current) {
            const marker = createSnapMarker(15,closestSnap);
            scene.add(marker);
            snapMarkerRef.current = marker;
          }
          snapMarkerRef.current.position.copy(closestSnap.position);
          snapMarkerRef.current.scale.setScalar(1);
        }
      
        // ✅ Snap uygula (yakınlık yeterliyse)
        if (closestSnap && minDistance < snapDist) {
          finalTarget.copy(closestSnap.position);
          snapped = true;
          snappedPointRef.current = finalTarget.clone();
     
        } else {
          snappedPointRef.current = null;
          if (snapMarkerRef.current && minDistance > previewThreshold) {
            scene.remove(snapMarkerRef.current);
            snapMarkerRef.current.geometry.dispose();
            snapMarkerRef.current.material.dispose();
            snapMarkerRef.current = null;
          }
        }
      
        // 🎯 Hareket işlemi
        const delta = new THREE.Vector3().subVectors(finalTarget, selectedGizmo.current.position);
        selectedGizmo.current.position.copy(finalTarget);
      
        const { type, lineId } = selectedGizmo.current.userData;
      
        scene.traverse((obj) => {
          if (obj.isLine && obj.userData.id === lineId) {
            const pos = obj.geometry.attributes.position;
            const positions = pos.array;
      
            if (type === 'center') {
              for (let i = 0; i < pos.count; i++) {
                const v = new THREE.Vector3().fromBufferAttribute(pos, i).add(delta);
                pos.setXYZ(i, v.x, v.y, v.z);
              }
            } else if (type === 'start') {
              const v = new THREE.Vector3(positions[0], positions[1], positions[2]).add(delta);
              pos.setXYZ(0, v.x, v.y, v.z);
            } else if (type === 'end') {
              const last = pos.count - 1;
              const v = new THREE.Vector3(
                positions[last * 3],
                positions[last * 3 + 1],
                positions[last * 3 + 2]
              ).add(delta);
              pos.setXYZ(last, v.x, v.y, v.z);
            }
      
            pos.needsUpdate = true;
          }
        });
      
        updateGizmos(scene, selectedGizmo.current);
      };
      
      
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            // Eğer gizmo hareket ettiriliyorsa, onu iptal et
            if (isMoving.current && selectedGizmo.current) {
              const gizmo = selectedGizmo.current;
          
              gizmo.parent ? gizmo.parent.remove(gizmo) : scene.remove(gizmo);
              gizmo.geometry?.dispose();
              gizmo.material?.dispose();
          
              const { type, lineId } = gizmo.userData;
          
              scene.traverse(obj => {
                if (obj.isLine && obj.userData.id === lineId) {
                  const pos = obj.geometry.attributes.position;
          
                  if (type === 'center') {
                    const delta = new THREE.Vector3().subVectors(originalPosition.current, gizmo.position);
                    for (let i = 0; i < pos.count; i++) {
                      const v = new THREE.Vector3().fromBufferAttribute(pos, i).add(delta);
                      pos.setXYZ(i, v.x, v.y, v.z);
                    }
                  } else if (type === 'start') {
                    pos.setXYZ(0, originalPosition.current.x, originalPosition.current.y, originalPosition.current.z);
                  } else if (type === 'end') {
                    const last = pos.count - 1;
                    pos.setXYZ(last, originalPosition.current.x, originalPosition.current.y, originalPosition.current.z);
                  }
          
                  pos.needsUpdate = true;
                }
              });
          
              selectedGizmo.current = null;
              isMoving.current = false;
            }
          
            // 🔥 Snap marker varsa onu da her halükarda temizle
            removeAllSnapMarkers(scene);
          }
          
    };
    const onKeyDown2 = (e) => {
      if (e.key === 'Escape' && isMoving.current && selectedGizmo.current) {
        const gizmo = selectedGizmo.current;
         
        gizmo.parent ? gizmo.parent.remove(gizmo) : scene.remove(gizmo);
        gizmo.geometry?.dispose();
        gizmo.material?.dispose();

        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
        }
        selectedGizmo.current = null;

        // 🔥 Tüm snap marker'ları sahneden kaldır
        removeAllSnapMarkers(scene);
        isMoving.current = false;

        const { type, lineId } = gizmo.userData;
        scene.traverse(obj => {
          if (obj.isLine && obj.userData.id === lineId) {
            const pos = obj.geometry.attributes.position;
 
            if (type === 'center') {
              const delta = new THREE.Vector3().subVectors(originalPosition.current, gizmo.position);
              for (let i = 0; i < pos.count; i++) {
                const v = new THREE.Vector3().fromBufferAttribute(pos, i).add(delta);
                pos.setXYZ(i, v.x, v.y, v.z);
              }
            } else if (type === 'start') {
              pos.setXYZ(0, originalPosition.current.x, originalPosition.current.y, originalPosition.current.z);
            } else if (type === 'end') {
              const last = pos.count - 1;
              pos.setXYZ(last, originalPosition.current.x, originalPosition.current.y, originalPosition.current.z);
            }

            pos.needsUpdate = true;
          }
      
        });

        selectedGizmo.current = null;
      }
    };
    
// Escape basılınca snap marker temizliği
function removeAllSnapMarkers(scene) {
 
    const toRemove = [];
  
    scene.traverse(obj => {
      if (obj.name === '__snapMarker') {
        toRemove.push(obj);
      }
    });
     toRemove.forEach(marker => {
      if (marker.parent) marker.parent.remove(marker);
      marker.geometry?.dispose();
      marker.material?.dispose();
    });
  }
  
  
    domElement.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      domElement.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [scene, camera, domElement]);
}

function updateGizmos(scene, draggedGizmo) {
  const { lineId } = draggedGizmo.userData;

  scene.traverse(obj => {
    if (obj.isLine && obj.userData.id === lineId) {
      const pos = obj.geometry.attributes.position;
      const positions = pos.array;
      const count = pos.count;

      const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
      const end = new THREE.Vector3(
        positions[(count - 1) * 3],
        positions[(count - 1) * 3 + 1],
        positions[(count - 1) * 3 + 2]
      );
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      scene.traverse(gizmo => {
        if (
          gizmo.name.startsWith("__gizmo") &&
          gizmo.userData.isGizmo &&
          gizmo.userData.lineId === lineId &&
          gizmo !== draggedGizmo
        ) {
          const type = gizmo.userData.type;
          if (type === "start") gizmo.position.copy(start);
          else if (type === "end") gizmo.position.copy(end);
          else if (type === "center") gizmo.position.copy(center);
        }
      });
    }
  });
}
