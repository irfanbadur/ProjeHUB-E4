import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';
export function drawLineFromCode( start, end, color = 0xffffff ) {
  if (!start || !end) return;

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(start.x, start.y, 0),
    new THREE.Vector3(end.x, end.y, 0),
  ]);

  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);

  line.userData = {
    id: generateUniqueId('line'),
    type: 'line',
    isSelectable: true,
    originalColor: color,
  };

  //scene.add(line);
  return line;
}
/*    KULLANIM
      drawLineFromCode(scene, {
        start: { x: 0, y: 0 },
        end: { x: 200, y: 200 },
        color: 0x00ff00,
      });
    
 */