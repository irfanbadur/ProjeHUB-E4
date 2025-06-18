import * as THREE from 'three';
import { createTextSprite } from './createTextSprite';
import { generateUniqueId } from './generateUniqueId';

export const createWireTitle = (basePosition, titleText, color = '#00ffff', vertices = [],outSnapID, distanceAlongWire = 30, initialLineLength = 30) => {
    const radius = 10;
    const group = new THREE.Group();
  
    const label = createTextSprite(titleText, {
      fontSize: 120,
      color,
      backgroundColor: 'transparent',
      strokeColor: color,
      padding: 8,
    });
    label.name = "titleLabel"; // 🔥
    label.userData.outSnapID = outSnapID
    label.position.set(0, initialLineLength + radius, 0);
  
    const circleShape = new THREE.Shape();
    circleShape.absarc(0, initialLineLength + radius, radius, 0, Math.PI * 2, false);
    const circleGeometry = new THREE.BufferGeometry().setFromPoints(circleShape.getPoints(64));
    const circleMaterial = new THREE.LineDashedMaterial({
      color,
      dashSize: 2,
      gapSize: 2,
    });
    const circle = new THREE.Line(circleGeometry, circleMaterial);
    circle.name = "titleCircle"; // 🔥
    circle.computeLineDistances();
  
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, initialLineLength, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.name = "titleLine"; // 🔥
  
    const createFilledCircle = (radius, color) => {
      const geometry = new THREE.CircleGeometry(radius, 64);
      const material = new THREE.MeshBasicMaterial({ color: 0xee22aa, side: THREE.DoubleSide, transparent: true, opacity: 0.20 });
      return new THREE.Mesh(geometry, material);
    };
    const innerCircle = createFilledCircle(radius, color);
    innerCircle.name = "titleInnerCircle"; // 🔥
    innerCircle.position.set(0, initialLineLength + radius, 0);
  
    group.add(innerCircle);
    group.add(circle);
    group.add(line);
    group.add(label);
  
    group.position.copy(basePosition);
   
    if (vertices.length >= 2) {
      const direction = new THREE.Vector3().subVectors(vertices[1], vertices[0]).normalize();
      const baseAngle = Math.atan2(direction.y, direction.x);
      group.rotation.z = baseAngle;
    }
    group.name="wireTitle"
  
    group.userData = {
      type: 'wireTitle',
      isSelectable: true,
      isMovable: true,
      id: `wireTitle-${Date.now()}`,
      wireVertices: vertices,
      distanceAlongWire,
      lineLength: initialLineLength,
    };
  
    return group;
  };
  