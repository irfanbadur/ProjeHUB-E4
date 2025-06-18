// src/utils/createTextSprite.js
import * as THREE from 'three';

export const createTextSprite = (text, options = {}) => {
  const {
    fontSize = 48,
    color = '#ffffff',
    backgroundColor = 'transparent',
    strokeColor = '#000000',
    padding = 8,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px Arial`;

  const textWidth = ctx.measureText(text).width;
  canvas.width = textWidth + padding * 2;
  canvas.height = fontSize + padding * 2;

  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 4;
  ctx.strokeText(text, padding, fontSize + padding / 2);
  ctx.fillStyle = color;
  ctx.fillText(text, padding, fontSize + padding / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width / 10, canvas.height / 10, 1); // Ölçek ayarı

  return sprite;
};
