import * as THREE from 'three';

export function findClosestPointOnObjects(mouseWorldPos, objects, threshold = 10) {
  let closestPoint = null;
  let closestDistance = Infinity;

  for (const obj of objects) {
    if (!obj.geometry) continue;

    const positionAttr = obj.geometry.attributes.position;
    if (!positionAttr) continue;

    for (let i = 0; i < positionAttr.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
      vertex.applyMatrix4(obj.matrixWorld); // objenin sahnedeki pozisyonuna göre

      const dist = mouseWorldPos.distanceTo(vertex);
      if (dist < closestDistance && dist < threshold) {
        closestDistance = dist;
        closestPoint = vertex.clone();
      }
    }
  }

  return closestPoint; // yoksa null
}
