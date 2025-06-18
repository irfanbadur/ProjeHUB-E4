// utils/draw/drawSplineFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawSplineFromCode(  { points, color = 0xffffff }) {
  if (  !Array.isArray(points) || points.length < 2) return;

  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p.x, p.y, p.z || 0))
  );

  const divisions = Math.max(10, points.length * 10);
  const splinePoints = curve.getPoints(divisions);
  const geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);

  const material = new THREE.LineBasicMaterial({ color });
  const spline = new THREE.Line(geometry, material);

  spline.userData = {
    id: generateUniqueId('spline'),
    type: 'spline',
    isSelectable: true,
    originalColor: color,
  };

//  scene.add(spline);
  return spline;
}


/*  KULLANIM 
  drawSplineFromCode(scene, {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      color: 0x00ff00,
    });
    
    
    */