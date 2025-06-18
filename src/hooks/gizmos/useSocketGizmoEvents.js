import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { getSnapPointsFromScene } from '../../utils/getSnapPointsFromScene';

export default function useSocketGizmoEvents({ scene, camera, renderer }) {
  const rotatingSocketRef = useRef(null);
  const stretchingSocketRef = useRef(null);
  const startAngleRef = useRef(0);
  const startRotationZRef = useRef(0);
  const startStretchYRef = useRef(0);
  const startMouseYRef = useRef(0);
  const movingSocketRef = useRef(null);
  const targetLineRef = useRef(null);
  const grabOffsetRef = useRef(new THREE.Vector3());

  const orthoMode = useSelector((state) => state.mods.orthoMode);

  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    const dom = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getWorldPoint = (event) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);
      return point;
    };

    
    const handleMouseDown = (event) => {
      const point = getWorldPoint(event);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      const rotateHit = intersects.find(i => i.object?.userData?.type === 'rotateGizmo');
      if (rotateHit) {
        const parentId = rotateHit.object.userData.parentSocketId;
        const socketGroup = scene.children.find(obj => obj.userData?.id === parentId && obj.userData?.type === 'socket');
        const offsetGroup = socketGroup?.children.find(child => child instanceof THREE.Group);
        if (!offsetGroup) return;

        const center = socketGroup.position.clone();
        const startVector = new THREE.Vector2(point.x - center.x, point.y - center.y);
        startAngleRef.current = Math.atan2(startVector.y, startVector.x);
        startRotationZRef.current = offsetGroup.rotation.z;
        rotatingSocketRef.current = offsetGroup;
        return;
      }

      const stretchHit = intersects.find(i => i.object?.userData?.type === 'stretchGizmo');
      if (stretchHit) {
        const parentId = stretchHit.object.userData.parentSocketId;
        const socketGroup = scene.children.find(obj => obj.userData?.id === parentId && obj.userData?.type === 'socket');
        const offsetGroup = socketGroup?.children.find(child => child instanceof THREE.Group);
        if (!offsetGroup) return;
      
        const initialStretch =
        offsetGroup.userData?.stretchLength ??
        socketGroup.userData?.stretchLength ??
        0;
      
      startStretchYRef.current = initialStretch;
      

      }
      

      const moveHit = intersects.find(i => i.object?.userData?.type === 'moveGizmo');
      if (moveHit) {

        const parentSocketId = moveHit.object.userData.parentSocketId;

        const socketGroup = scene.children.find(
          obj => obj.userData?.id === parentSocketId  
        );
        if (!socketGroup) return;
        const worldPoint = getWorldPoint(event);
        grabOffsetRef.current = new THREE.Vector3().subVectors(socketGroup.position, worldPoint);
  
        const branchID = socketGroup.userData?.branchID;
        if (!branchID) return;

         let targetLine = null;
scene.traverse(obj => {
  if (obj.userData.branchID === branchID) {
    targetLine = obj;
  }
});
if (!targetLine) {
  console.warn("❌ targetLine sahnede bulunamadı!");
}
        if (!targetLine || !targetLine.geometry) return;
        movingSocketRef.current = socketGroup;
        targetLineRef.current = targetLine;
      }


    };

    const handleMouseMove = (event) => {
      const point = getWorldPoint(event);

      if (rotatingSocketRef.current) {
        const center = rotatingSocketRef.current.parent.position;
        const currentVector = new THREE.Vector2(point.x - center.x, point.y - center.y);
        let currentAngle = Math.atan2(currentVector.y, currentVector.x);

        if (orthoMode) {
          const rawDelta = currentAngle - startAngleRef.current;
          const deltaDeg = THREE.MathUtils.radToDeg(rawDelta);
          const snappedDeg = Math.round(deltaDeg / 45) * 45;
          currentAngle = startAngleRef.current + THREE.MathUtils.degToRad(snappedDeg);

        }

        const delta = currentAngle - startAngleRef.current;
        rotatingSocketRef.current.rotation.z = startRotationZRef.current + delta;
        rotatingSocketRef.current.parent.userData.rotate = delta
      }
      const gridSize = 5; // Stretch adımı

      if (stretchingSocketRef.current) {
        const offsetGroup = stretchingSocketRef.current;
        const socketGroup = offsetGroup.parent;
      
        let deltaY = point.y - startMouseYRef.current;

        // Dönme açısını normalize et (-π ~ π aralığına)
        let angle = stretchingSocketRef.current.rotation.z % (2 * Math.PI);
        if (angle < 0) angle += 2 * Math.PI;

        // 90° ile 270° arası ters yön (yani aşağıyı gösteriyorsa ters çevir)
        const isFlipped = angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
        if (isFlipped) deltaY = -deltaY;

        // Kademeli yap: 5 birim adımlarla yuvarla
        const steppedDeltaY = Math.round(deltaY / gridSize) * gridSize;
        const clampedDeltaY = Math.max(0, steppedDeltaY);

        // === line1 güncelle ===
        const line1 = stretchingSocketRef.current.children.find(
          (child) => child.userData?.role === 'line1'
        );
        if (line1) {
          const newLength = Math.max(21, 21 + clampedDeltaY);
          const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, newLength, 0)];
          line1.geometry.setFromPoints(points);
        }

        // === line2 ===
        const line2 = stretchingSocketRef.current.children.find(
          (child) => child.userData?.role === 'line2'
        );
        if (line2) {
          line2.position.y = clampedDeltaY;
        }

        // === arc ===
        const arc = stretchingSocketRef.current.children.find(
          (child) => child.userData?.role === 'arc'
        );
        if (arc) {
          arc.position.y = clampedDeltaY;
        }

        // === line3 (kapaklı priz) ===
        const line3 = stretchingSocketRef.current.children.find(
          (child) => child.userData?.role === 'line3'
        );
        if (line3) {
          const newPoints = [
            new THREE.Vector3(0, 21 + clampedDeltaY, 0),
            new THREE.Vector3(0, 28 + clampedDeltaY, 0),
            new THREE.Vector3(7, 28 + clampedDeltaY, 0)
          ];
          line3.geometry.setFromPoints(newPoints);
        }

        // === etanjFill ===
        const etanjFill = stretchingSocketRef.current.children.find(
          (child) => child.userData?.role === 'etanjFill'
        );
        if (etanjFill) {
          etanjFill.position.y = 28 + clampedDeltaY;
        }

        // === rotateGizmo ===
        const rotateGizmo = stretchingSocketRef.current.children.find(
          (child) => child.userData?.type === 'rotateGizmo'
        );
        if (rotateGizmo) {
          rotateGizmo.position.y = 33 + clampedDeltaY;
        }

        // === stretchGizmo ===
        const stretchGizmo = stretchingSocketRef.current.children.find(
          (child) => child.userData?.type === 'stretchGizmo'
        );
        if (stretchGizmo) {
          stretchGizmo.position.y = clampedDeltaY;
        }

        // === symetricGizmo ===
        const symetricGizmo = stretchingSocketRef.current.children.find(
          (child) => child.userData?.type === 'symetricGizmo'
        );
        if (symetricGizmo) {
          symetricGizmo.position.y = clampedDeltaY;
        }
        if (socketGroup) {
          socketGroup.userData.stretchLength = clampedDeltaY;
        }
        offsetGroup.userData.stretchLength = clampedDeltaY;
        
      }


      //--------------------
      //   console.log("movingSocketRef.current && targetLineRef.current: ",movingSocketRef.current , targetLineRef.current)
 
      if (movingSocketRef.current && targetLineRef.current) {
        const socketGroup = movingSocketRef.current;
        const line = targetLineRef.current;
         const worldPoint = getWorldPoint(event);
        const targetPos = new THREE.Vector3().addVectors(worldPoint, grabOffsetRef.current);
        socketGroup.position.copy(targetPos);
        let buat
        scene.traverse(obj => {
          if (obj.userData.socketUUID === socketGroup.uuid) buat = obj
        })


        const posAttr = line.geometry.attributes.position;
        if (!posAttr || posAttr.count < 2) return;

        let closestPoint = null;
        let closestDistance = Infinity;
        let bestDirection = null;

        const mousePoint = point.clone();

        for (let i = 0; i < posAttr.count - 1; i++) {
          const start = new THREE.Vector3().fromBufferAttribute(posAttr, i);
          const end = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);

          const segment = new THREE.Vector3().subVectors(end, start);
          const length = segment.length();
          const direction = segment.clone().normalize();

          const toMouse = new THREE.Vector3().subVectors(mousePoint, start);
          const projLength = toMouse.dot(direction);
          const clampedLength = THREE.MathUtils.clamp(projLength, 0, length);
          const projected = start.clone().add(direction.clone().multiplyScalar(clampedLength));

          const dist = projected.distanceTo(mousePoint);
          if (dist < closestDistance) {
            closestDistance = dist;
            closestPoint = projected;
            bestDirection = direction;
          }
        }

        if (closestPoint && bestDirection) {
          // 🟢 Soketi çizgiye hizala
          socketGroup.position.copy(closestPoint);

          // 🟢 Eğer buna bağlı bir buat objesi varsa, onu da taşı
          scene.traverse(obj => {
            if (obj.userData?.socketUUID === socketGroup.uuid) {
              obj.position.copy(closestPoint);
            }
          });

          // 🟢 Rotasyon: offsetGroup varsa döndür
          const offsetGroup = socketGroup.children.find(child => child instanceof THREE.Group);
          if (offsetGroup) {
            const angle = Math.atan2(bestDirection.y, bestDirection.x);
            offsetGroup.rotation.z = angle;
          }

          console.log("✔️ Soket taşındı:", closestPoint.toArray());
        }


      }
      //-------------------------------


    };

    const handleMouseUp = () => {
      rotatingSocketRef.current = null;
      stretchingSocketRef.current = null;
      movingSocketRef.current = null;
      const snapPoints = getSnapPointsFromScene(scene)

    };

    const handleClick = (event) => {
      const point = getWorldPoint(event);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object?.userData?.type === 'symetricGizmo');
      if (!hit) return;
      
      const parentId = hit.object.userData.parentSocketId;
      const socketGroup = scene.children.find(obj =>
        obj.userData?.id === parentId && obj.userData?.type === 'socket'
      );
      
      if (socketGroup && socketGroup.children.length > 0) {
        const offsetGroup = socketGroup.children.find(child => child instanceof THREE.Group);
        if (offsetGroup) {
          offsetGroup.rotation.z += Math.PI/2;
        }
      }
    };

    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
    };
  }, [scene, camera, renderer, orthoMode]);
}
