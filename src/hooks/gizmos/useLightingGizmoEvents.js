import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { getSnapPointsFromScene } from '../../utils/getSnapPointsFromScene';

export default function useLightingGizmoEvents({ scene, camera, renderer }) {
  const rotatingLightSwichRef = useRef(null);
  const stretchingLightSwichRef = useRef(null);
  const startAngleRef = useRef(0);
  const startRotationZRef = useRef(0);
  const startStretchYRef = useRef(0);
  const startMouseYRef = useRef(0);
  const movingLightSwichRef = useRef(null);
  const targetLineRef = useRef(null);

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
    const findLineByLightSwichUUID = (scene, LightSwichUUID) => {
      let line = null;
      scene.traverse((obj) => {
        if ((obj.userData?.type === 'polyline' || obj.userData?.type === 'line') && obj.userData?.lightSwichs) {
          const hasLightSwich = obj.userData.lightSwichs.some(lightSwitch => lightSwitch.uuid === LightSwichUUID);
          if (hasLightSwich) line = obj;
        }
      });
      return line;
    };
    const handleMouseDown = (event) => {
      const point = getWorldPoint(event);
      const intersects = raycaster.intersectObjects(scene.children, true);

      const rotateHit = intersects.find(i => i.object?.userData?.type === 'rotateGizmo');
      if (rotateHit) {
        const parentId = rotateHit.object.userData.parentLightSwichId;
        const lightingGroup = scene.children.find(obj => obj.userData?.id === parentId && obj.userData?.type === 'LightSwitch');
        const offsetGroup = lightingGroup?.children.find(child => child instanceof THREE.Group);
        if (!offsetGroup) return;

        const center = lightingGroup.position.clone();
        const startVector = new THREE.Vector2(point.x - center.x, point.y - center.y);
        startAngleRef.current = Math.atan2(startVector.y, startVector.x);
        startRotationZRef.current = offsetGroup.rotation.z;
        rotatingLightSwichRef.current = offsetGroup;
        return;
      }

      const stretchHit = intersects.find(i => i.object?.userData?.type === 'stretchGizmo');
      if (stretchHit) {
        const parentId = stretchHit.object.userData.parentLightSwichId;
        const lightingGroup = scene.children.find(obj => obj.userData?.id === parentId && obj.userData?.type === 'LightSwitch');
        const offsetGroup = lightingGroup?.children.find(child => child instanceof THREE.Group);
        if (!offsetGroup) return;

        startStretchYRef.current = offsetGroup.scale.y;
        startMouseYRef.current = point.y;
        stretchingLightSwichRef.current = offsetGroup;
      }
      const moveHit = intersects.find(i => i.object?.userData?.type === 'moveGizmo');
      if (moveHit) {
        const parentId = moveHit.object.userData.parentLightSwichId;
        const lightingGroup = scene.children.find(obj => obj.userData?.id === parentId && obj.userData?.type === 'LightSwitch');
        if (!lightingGroup) return;
        // Bağlı olduğu hattı (line) bulalım
        let targetLine =   findLineByLightSwichUUID(scene, lightingGroup.uuid);    ;

        if (!targetLine || !targetLine.geometry) return;
        movingLightSwichRef.current = lightingGroup;
        targetLineRef.current = targetLine;
      }

    };

    const handleMouseMove = (event) => {
      const point = getWorldPoint(event);

      if (rotatingLightSwichRef.current) {
        const center = rotatingLightSwichRef.current.parent.position;
        const currentVector = new THREE.Vector2(point.x - center.x, point.y - center.y);
        let currentAngle = Math.atan2(currentVector.y, currentVector.x);

        if (orthoMode) {
          const angleDeg = THREE.MathUtils.radToDeg(currentAngle);
          const snappedDeg = Math.round(angleDeg / 45) * 45;
          currentAngle = THREE.MathUtils.degToRad(snappedDeg);
        }

        const delta = currentAngle - startAngleRef.current;
        rotatingLightSwichRef.current.rotation.z = startRotationZRef.current + delta;
        rotatingLightSwichRef.current.parent.userData.rotate=delta 

      }
      const gridSize = 5; // Stretch adımı

      if (stretchingLightSwichRef.current) {
        let deltaY = point.y - startMouseYRef.current;

        // Dönme açısını normalize et (-π ~ π aralığına)
        let angle = stretchingLightSwichRef.current.rotation.z % (2 * Math.PI);
        if (angle < 0) angle += 2 * Math.PI;

        // 90° ile 270° arası ters yön (yani aşağıyı gösteriyorsa ters çevir)
        const isFlipped = angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
        if (isFlipped) deltaY = -deltaY;

        // Kademeli yap: 5 birim adımlarla yuvarla
        const steppedDeltaY = Math.round(deltaY / gridSize) * gridSize;
        const clampedDeltaY = Math.max(0, steppedDeltaY);

        // === line1 güncelle ===
        const line1 = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.role === 'LS_line1'
        );
        if (line1) {
          const newLength = Math.max(15, 15 + clampedDeltaY);
          const points = [
            new THREE.Vector3(0, 0, 0), 
            new THREE.Vector3(0, newLength, 0)];
          line1.geometry.setFromPoints(points);
        }

        // === line2 ===
        const line2 = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.role === 'LS_line2'
        );
        if (line2) {
          line2.position.y = clampedDeltaY;
        }
        // === arc ===
        const arc = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.role === 'LS_arc'
        );
        if (arc) {
          arc.position.y = clampedDeltaY;
        }
        const circleLine = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.role === 'LS_circle'
        );
        if (circleLine) {
          circleLine.position.y = clampedDeltaY;
        }

        // === line3 (kapaklı priz) ===
        const line3 = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.role === 'LS_line3'
        );
        if (line3) {
          line3.position.y = clampedDeltaY;
        }

        // === etanjFill ===
        const etanjFill = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.role === 'etanjFill'
        );
        if (etanjFill) {
          etanjFill.position.y = 21 + clampedDeltaY;
        }

 

        // === stretchGizmo ===
        const stretchGizmo = stretchingLightSwichRef.current.children.find(
          (child) => child.userData?.type === 'stretchGizmo'
        );
        if (stretchGizmo) {
          stretchGizmo.position.y = clampedDeltaY;
        }

 
      }


      //--------------------
      if (movingLightSwichRef.current && targetLineRef.current) {
        const lightingGroup = movingLightSwichRef.current;
        const line = targetLineRef.current;

        let buat
        scene.traverse(obj=>{         
         if( obj.userData.LightSwichUUID===lightingGroup.uuid)buat=obj        
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

        if (closestPoint && bestDirection && bestDirection.x !== undefined && bestDirection.y !== undefined) {
          // Yeni pozisyon
          lightingGroup.position.copy(closestPoint);
          buat.position.copy(closestPoint);
        
          // Açıyı dik olarak ayarla
          const angle = Math.atan2(bestDirection.y, bestDirection.x);
          const offsetGroup = lightingGroup.children.find(child => child instanceof THREE.Group);
          if (offsetGroup) {
            offsetGroup.rotation.z = angle;
          }
        } else {
          console.warn("⚠️ Best direction or closestPoint not found correctly:", bestDirection, closestPoint);
        }
        
      }



    };

    const handleMouseUp = () => {
      rotatingLightSwichRef.current = null;
      stretchingLightSwichRef.current = null;
      movingLightSwichRef.current = null;
      const snapPoints = getSnapPointsFromScene(scene)

    };



    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  //  dom.addEventListener('click', handleClick);

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
  //    dom.removeEventListener('click', handleClick);
    };
  }, [scene, camera, renderer, orthoMode]);
}
