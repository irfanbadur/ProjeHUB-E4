import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
 
export default function useFixtureGizmoEvents({ scene, camera, renderer }) {
  const rotatingFixtureRef = useRef(null);
  const stretchingFixtureRef = useRef(null);
  const startAngleRef = useRef(0);
  const startRotationZRef = useRef(0);
  const movingFixtureRef = useRef(null);
 
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
    
      // rotateGizmo’a tıklandı mı?
      const rotateHit = intersects.find(i => i.object.userData?.type === 'rotateGizmo');
      if (rotateHit) {
        const parentId = rotateHit.object.userData.parentFixtureId;
        // artık socket değil, LightFixture grubunu bulacağız:
        const fixtureGroup = scene.children.find(obj =>
          obj.userData?.id === parentId &&
          obj.userData?.type === 'LightFixture'
        );
        if (!fixtureGroup) return;
    
        // offsetGroup’u da name="offsetGroup" ile önceden etiketlemiştik:
        const offsetGroup = fixtureGroup.children.find(child => child.name === 'offsetGroup');
        if (!offsetGroup) return;
    
        // dönme başlangıcını kaydedelim:
        const center = fixtureGroup.position.clone();
        const startVector = new THREE.Vector2(point.x - center.x, point.y - center.y);
        startAngleRef.current = Math.atan2(startVector.y, startVector.x);
        startRotationZRef.current = offsetGroup.rotation.z;
        rotatingFixtureRef.current = offsetGroup;
        return;
      }
    };
    

    const handleMouseMove = (event) => {
      const point = getWorldPoint(event);

      if (rotatingFixtureRef.current) {
        const center = rotatingFixtureRef.current.parent.position;
        const currentVector = new THREE.Vector2(point.x - center.x, point.y - center.y);
        let currentAngle = Math.atan2(currentVector.y, currentVector.x);

        if (orthoMode) {
          const rawDelta = currentAngle - startAngleRef.current;
          const deltaDeg = THREE.MathUtils.radToDeg(rawDelta);
          const snappedDeg = Math.round(deltaDeg / 45) * 45;
          currentAngle = startAngleRef.current + THREE.MathUtils.degToRad(snappedDeg);
        }
        const delta = currentAngle - startAngleRef.current;
        rotatingFixtureRef.current.rotation.z = startRotationZRef.current + delta;
        rotatingFixtureRef.current.parent.userData.rotate=delta 
      }
 
    };

    const handleMouseUp = () => {
      rotatingFixtureRef.current = null;
      stretchingFixtureRef.current = null;
      movingFixtureRef.current = null;

    };

    const handleClick = (event) => {
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object?.userData?.type === 'symetricGizmo');
      if (!hit) return;

      const parentId = hit.object.userData.parentFixtureId;
      const socketGroup = scene.children.find(obj =>
        obj.userData?.id === parentId && obj.userData?.type === 'LightFixture'
      );

      if (socketGroup && socketGroup.children.length > 0) {
        const offsetGroup = socketGroup.children.find(child => child instanceof THREE.Group);
        if (offsetGroup) {
          offsetGroup.rotation.z += Math.PI;
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
