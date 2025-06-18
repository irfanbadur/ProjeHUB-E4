// src/commands/modifyMoveByCode.js
import { getObjectById } from '../utils/getObjectById';

/**
 * Belirtilen objeyi sahnede verilen offset kadar taşır.
 * @param {THREE.Scene} scene - Sahne
 * @param {string} id - Nesnenin userData.id değeri
 * @param {{ x: number, y: number, z?: number }} offset - Taşıma mesafesi
 * @param {function} [refreshSnapPoints] - (Opsiyonel) Snap noktalarını güncelleyen fonksiyon
 */
export function modifyMoveByCode(scene, id, offset = { x: 0, y: 0, z: 0 }, refreshSnapPoints) {
  if (!scene || !id) return;

  const object = getObjectById(scene, id);
  if (!object) {
    console.warn(`modifyMoveByCode: Nesne bulunamadı (id: ${id})`);
    return;
  }

  object.position.x += offset.x;
  object.position.y += offset.y;
  object.position.z += offset.z || 0;

  // Snap noktalarını güncelle (varsa)
  if (typeof refreshSnapPoints === 'function') {
    setTimeout(() => refreshSnapPoints(), 0);
  }

  console.log(`modifyMoveByCode: Nesne taşındı (id: ${id})`, object.position);

  return object;
}
