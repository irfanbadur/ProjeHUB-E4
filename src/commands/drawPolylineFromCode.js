// src/command/drawPolylineFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function drawPolylineFromCode(  { points, color = 0xffffff, closed = false  }) {
  if (  !Array.isArray(points) || points.length < 2) return;

  // Make a shallow copy of the points array to avoid modifying the original array
  const polylinePoints = [...points];

  // If the polyline is closed, add the first point again at the end of the points array
  if (closed) {
    polylinePoints.push(polylinePoints[0]);
  }

   const geometry = new THREE.BufferGeometry();
  const vertices = [];
  polylinePoints.forEach(p => {
    vertices.push(p.x, p.y, p.z || 0);
  });
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);

  line.userData = {
    id: generateUniqueId('polyline'),
    type: 'polyline',
    isSelectable: true,
    originalColor: color,
  };

 // scene.add(line);
  return line;
}

/*  KULLANIM 
  drawPolylineFromCode(scene, {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      color: 0x00ff00,
    });
    
    
    */