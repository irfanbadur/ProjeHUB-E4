// src/commands/createSolidHatchFromPolyline.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

/**
 * Tek bir kapalı polyline (nokta dizisi) ile solid hatch oluşturur.
 * @param {THREE.Scene} scene - Üzerine çizim yapılacak sahne
 * @param {Array<{x: number, y: number}>} points - Polyline noktaları (otomatik kapatılır)
 * @param {number} color - Solid renk (default: kırmızı)
 * @returns {THREE.Mesh|null}
 */
export function createSolidHatchFromPolyline(scene, points, color = 0xff0000) {
  if (!scene || !Array.isArray(points) || points.length < 3) {
    console.warn('Geçersiz nokta dizisi');
    return null;
  }

  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].y);
  }
  shape.lineTo(points[0].x, points[0].y); // Otomatik kapatma

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    id: generateUniqueId(),
    type: 'solidHatch',
    isSelectable: true,
    originalColor: color,
  };

  scene.add(mesh);
  return mesh;
}
