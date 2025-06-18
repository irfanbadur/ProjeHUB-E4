// utils/getMouseWorldPosition.js
import * as THREE from 'three';

export const getMouseWorldPosition = (event, domElement, camera) => {
  const rect = domElement.getBoundingClientRect();
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
