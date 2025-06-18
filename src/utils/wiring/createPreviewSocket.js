import * as THREE from 'three';

export function createPreviewSocket(position) {
  const group = new THREE.Group();

  // Ana priz simgesi gibi düşün
  const socketBody = new THREE.Mesh(
    new THREE.CircleGeometry(5, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
  );

  socketBody.position.set(0, 0, 0);

  group.add(socketBody);

  // 📌 Grup konumu
  group.position.copy(position.clone());
  
  group.userData = {
    type: 'previewSocket',
    isSelectable: true,
    isMovable: true,
  };

  return group;
}
