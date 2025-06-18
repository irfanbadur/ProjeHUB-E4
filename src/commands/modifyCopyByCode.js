// src/commands/modifyCopyByCode.js
import * as THREE from 'three';
import { getObjectById } from '../utils/getObjectById';
import { generateUniqueId } from '../utils/generateUniqueId';
import { cloneUserDataForCopy } from '../utils/cloneUserDataForCopy';

/**
 * Belirtilen objeyi sahnede verilen offset kadar kopyalar.
 * @param {THREE.Scene} scene - Sahne
 * @param {string} id - Kopyalanacak nesnenin userData.id değeri
 * @param {{ x: number, y: number, z?: number }} offset - Kopya için taşıma mesafesi
 * @param {Function} [refreshSnapPoints] - Snap noktalarını güncelleyen fonksiyon
 * @returns {THREE.Object3D|null} - Oluşturulan kopya nesne
 */
export function modifyCopyByCode(scene, id, offset = { x: 0, y: 0, z: 0 }, refreshSnapPoints) {
  if (!scene || !id) return null;

  const original = getObjectById(scene, id);
  if (!original) {
    console.warn(`modifyCopyByCode: Nesne bulunamadı (id: ${id})`);
    return null;
  }

  const clone = original.clone();

  if (original.geometry?.clone) {
    clone.geometry = original.geometry.clone();
  }

  if (original.material?.clone) {
    clone.material = original.material.clone();
    if (original.userData.originalColor) {
      const colorObject = new THREE.Color(original.userData.originalColor);
      clone.material.color.copy(colorObject);
    }
  }

  clone.userData = {
    ...cloneUserDataForCopy(original.userData),
    id: generateUniqueId(),
    isSelectable: true,
    originalColor: original.userData.originalColor || clone.material.color.getHex(),
  };

  clone.position.set(
    original.position.x + offset.x,
    original.position.y + offset.y,
    original.position.z + (offset.z || 0)
  );

  scene.add(clone);

  if (typeof refreshSnapPoints === 'function') {
    setTimeout(() => refreshSnapPoints(), 0);
  }

  console.log(`modifyCopyByCode: Nesne kopyalandı (yeni id: ${clone.userData.id})`);
  return clone;
}
