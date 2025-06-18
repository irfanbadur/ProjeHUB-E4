function createDocumentGroup(title, width, height) {
  const group = new THREE.Group();

  // Çerçeve
  const borderGeometry = new THREE.PlaneGeometry(width, height);
  const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
  const frame = new THREE.Mesh(borderGeometry, borderMaterial);
  frame.position.set(width / 2, -height / 2, 0);
  group.add(frame);

  // Header
  const headerHeight = 100;
  const headerGeometry = new THREE.PlaneGeometry(width, headerHeight);
  const headerMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const header = new THREE.Mesh(headerGeometry, headerMaterial);
  header.position.set(width / 2, -headerHeight / 2, 1);
  group.add(header);

  // Yazı
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(title, 10, 64);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(300, 80, 1);
  sprite.position.set(width / 2, -headerHeight / 2, 2);
  group.add(sprite);

  return group;
}
