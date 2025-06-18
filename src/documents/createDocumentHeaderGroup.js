import * as THREE from 'three';

/**
 * Doküman başlık + çerçeve grubunu oluşturur.
 * @param {string} title - Doküman başlığı
 * @param {number} width - Çerçeve genişliği
 * @param {number} height - Çerçeve yüksekliği
 * @returns {THREE.Group}
 */
export function createDocumentHeaderGroup(title, width, height) {
  const group = new THREE.Group();

  // Çerçeve (LineLoop)
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(width, 0, 0),
    new THREE.Vector3(width, -height, 0),
    new THREE.Vector3(0, -height, 0),
    new THREE.Vector3(0, 0, 0),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x666666 });
  const outline = new THREE.LineLoop(geometry, material);
  group.add(outline);

  // Başlık arka planı
  const headerHeight = 100;
  const headerGeometry = new THREE.PlaneGeometry(width, headerHeight);
  const headerMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const header = new THREE.Mesh(headerGeometry, headerMaterial);
  header.position.set(width / 2, -headerHeight / 2, 0.5);
  header.userData.isDraggable = true;
  group.add(header);

  // Başlık yazısı
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.font = 'bold 64px Arial';
  ctx.fillText(title, 20, 160);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(500, 120, 1);
  sprite.position.set(width / 2, -headerHeight / 2, 1);
  group.add(sprite);

  // UserData
  group.userData = {
    type: 'documentHeader',
    title,
    width,
    height,
    isDocumentGroup: true
  };

  return group;
}
