import * as THREE from 'three';
import { computeOffsetPolyline } from './geometryUtils';
function distanceToSegment2D(p, v, w) {
    const l2 = v.distanceToSquared(w);
    if (l2 === 0) return p.distanceTo(v);
    const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    const clampedT = Math.max(0, Math.min(1, t));
    return p.distanceTo(new THREE.Vector3(
      v.x + clampedT * (w.x - v.x),
      v.y + clampedT * (w.y - v.y),
      0
    ));
  }
  
export function createOffsetPolylineIfNear(scene, worldPoint, threshold = 5) {
  let closestObj = null;
  let minDist = Infinity;

  scene.traverse(obj => {
    if (obj.userData?.type === 'polyline' && obj.geometry?.attributes?.position) {
      const posAttr = obj.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const p1 = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        const p2 = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
        const dist = distanceToSegment2D(worldPoint, p1, p2);
  ;
        if (dist < threshold && dist < minDist) {
          minDist = dist;
          closestObj = obj;
        }
      }
    }
  });

  if (!closestObj) return null;

  const posAttr = closestObj.geometry.attributes.position;
  const points = [];
  for (let i = 0; i < posAttr.count; i++) {
    points.push(new THREE.Vector2(posAttr.getX(i), posAttr.getY(i)));
  }

  const offsetPoints = computeOffsetPolyline(points, -5); // içe ofset
  if (!offsetPoints || offsetPoints.length < 2) return null;

  const offset3D = offsetPoints.map(p => new THREE.Vector3(p.x, p.y, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints(offset3D);
  const material = new THREE.LineDashedMaterial({ color: 0x00ffff, dashSize: 5, gapSize: 3 });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  line.userData.role = 'offsetPreview';

  return line;
}
