import * as THREE from 'three';
import { createTextSprite } from '../createTextSprite'; // Zaten vardı, yoksa yazarız.

export function createWireTitle(position, text = "1", color = '#00ffff') {
  const group = new THREE.Group();

  const label = createTextSprite(text, {
    fontSize: 120,
    color,
    backgroundColor: 'transparent',
    strokeColor: color,
    padding: 8,
  });
  label.position.set(0, 30, 0); // Text biraz yukarıda

  const circleShape = new THREE.Shape();
  circleShape.absarc(0, 30, 10, 0, Math.PI * 2, false);
  const circleGeometry = new THREE.BufferGeometry().setFromPoints(circleShape.getPoints(64));
  const circleMaterial = new THREE.LineDashedMaterial({ color, dashSize: 2, gapSize: 2 });
  const circle = new THREE.Line(circleGeometry, circleMaterial);
  circle.computeLineDistances();

  group.add(label);
  group.add(circle);
  group.position.copy(position);

  group.userData = {
    type: 'wireTitle',
    isSelectable: true,
    id: `wireTitle-${Date.now()}`
  };

  return group;
}
