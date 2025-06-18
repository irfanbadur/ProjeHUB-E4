// src/hooks/useWireTitle.js
import * as THREE from 'three';
import { createTextSprite } from '../../utils/createTextSprite';

export const useWireTitle = () => {
  const radius = 10;
  const lineLength = 30;

  const createCircleWithLabel = (text, color = '#ff00ff', id = null) => {
    const group = new THREE.Group();

    // Text Sprite
    const label = createTextSprite(text, {
      fontSize: 120,
      color,
      backgroundColor: 'transparent',
      strokeColor: color,
      padding: 8,
    });

    // Circle
    const circleShape = new THREE.Shape();
    circleShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    const circleGeometry = new THREE.BufferGeometry().setFromPoints(circleShape.getPoints(64));
    const circleMaterial = new THREE.LineDashedMaterial({
      color,
      dashSize: 2,
      gapSize: 2,
    });
    const circle = new THREE.Line(circleGeometry, circleMaterial);
    circle.computeLineDistances();

    // Line
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -lineLength, 0),
      new THREE.Vector3(0, -radius, 0),
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    // Pozisyonla
    label.position.set(0, 0, 0);
    group.add(circle);
    group.add(label);
    group.add(line);

    group.userData = {
      type: 'wireTitle',
      isSelectable: true,
      isMovable: true,
      id: id || `wireTitle-${Date.now()}`,
    };

    return group;
  };

  const addTitleToScene = (scene, basePosition, titleText, color = '#ff00ff') => {
    if (!scene || !basePosition || !titleText) return;

    const offsetY = lineLength + radius / 2;
    const offset = new THREE.Vector3(0, offsetY, 0);
    const finalPos = basePosition.clone().add(offset);

    const titleGroup = createCircleWithLabel(titleText, color);
    titleGroup.position.copy(finalPos);
    scene.add(titleGroup);

    return titleGroup;
  };

  return {
    addTitleToScene,
  };
};
