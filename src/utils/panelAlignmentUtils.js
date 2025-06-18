import * as THREE from 'three';

/**
 * Sahnedeki çizgilere (Line veya Polyline) en yakın segmenti bulur.
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} point
 * @param {number} maxDistance
 * @returns {{ start: THREE.Vector3, end: THREE.Vector3 } | null }
 */
export function findClosestSegment(scene, point, maxDistance = 30) {
  let closestSegment = null;
  let closestDistance = Infinity;
  scene.traverse(obj => {
    console.log("OBJ ",obj )
 
    if (((obj.isLine  ) || obj.isLineSegments) && obj.geometry ) {
      if (obj.userData?.isPanelPart) return;
      const pos = obj.geometry.attributes.position;
      for (let i = 0; i < pos.count - 1; i++) {
        const start = new THREE.Vector3().fromBufferAttribute(pos, i);
        const end = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
        obj.localToWorld(start);
        obj.localToWorld(end);

        const dist = pointToSegmentDistance(point, start, end);
        if (dist < closestDistance && dist < maxDistance) {
          closestDistance = dist;
          closestSegment = { start, end };
        }
      }
    }
  });
console.log("en YAKın çizgi : ",closestSegment.start,closestSegment.end)
  return closestSegment;
}

/**
 * Bir noktadan bir çizgi segmentine olan mesafeyi hesaplar
 */
function pointToSegmentDistance(p, a, b) {
  const ab = b.clone().sub(a);
  const ap = p.clone().sub(a);
  const t = THREE.MathUtils.clamp(ap.dot(ab) / ab.lengthSq(), 0, 1);
  const closestPoint = a.clone().add(ab.multiplyScalar(t));
  return p.distanceTo(closestPoint);
}

/**
 * Segment yönünü ve normalini döndürür
 */
export function getDirectionAndNormal(start, end) {
  const dir = end.clone().sub(start).normalize();
  const normal = new THREE.Vector3(-dir.y, dir.x, 0); // z=0 düzlemine dik
  return { direction: dir, normal };
}

/**
 * Panel grubunu verilen çizgi yönüne hizalar ve 10 birim uzağa taşır
 */
export function alignAndOffsetGroup(group, origin, direction, normal, offset = 10) {
  const angle = Math.atan2(direction.y, direction.x);
  group.rotation.z = angle; // ← Bu satır önemli

  const base = new THREE.Vector3(origin.x, origin.y, 0);
  const shift = normal.clone().multiplyScalar(offset);
  base.add(shift);
console.log("ANGLE: ",angle)
  group.position.set(base.x, base.y, 0);

  return group;
}
