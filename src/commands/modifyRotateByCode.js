// src/commands/modifyRotateByCode.js
import { getObjectById } from '../utils/getObjectById';

/**
 * Belirtilen objeyi verilen merkez etrafında döndürür.
 * @param {THREE.Scene} scene - Sahne
 * @param {string} id - Döndürülecek objenin userData.id değeri
 * @param {number} angle - Radyan cinsinden döndürme açısı (pozitif: saat yönü tersi)
 * @param {{ x: number, y: number, z?: number }} [center={x:0,y:0,z:0}] - Döndürme merkezi
 * @param {function} [refreshSnapPoints] - Snap noktalarını güncelleyen fonksiyon (opsiyonel)
 */
export function modifyRotateByCode(scene, id, angle, center = { x: 0, y: 0, z: 0 }, refreshSnapPoints) {
  if (!scene || !id || typeof angle !== 'number') return;

  const object = getObjectById(scene, id);
  if (!object) {
    console.warn(`modifyRotateByCode: Nesne bulunamadı (id: ${id})`);
    return;
  }

  const dx = object.position.x - center.x;
  const dy = object.position.y - center.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx) + angle;

  object.position.set(
    center.x + r * Math.cos(theta),
    center.y + r * Math.sin(theta),
    object.position.z
  );

  object.rotation.z += angle;

  // Snap noktalarını güncelle
  if (typeof refreshSnapPoints === 'function') {
    setTimeout(() => refreshSnapPoints(), 0);
  }

  console.log(`modifyRotateByCode: Nesne döndürüldü (id: ${id}, angle: ${angle})`, object);

  return object;
}
