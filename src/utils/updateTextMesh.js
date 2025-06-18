import * as THREE from 'three';
import { drawTextFromCode } from '../commands/drawTextFromCode';

/**
 * textGroup içinden childName ile bulunan Meshi newText ile günceller.
 * @param {THREE.Group} textGroup  — içinde birden fazla text barındıran Group
 * @param {string}       childName — o metin grubunun name’i (örneğin "textType")
 * @param {string}       newText   — ekranda görmek istediğiniz yeni yazı
 */
export function updateTextMesh(textGroup, childName, newText) {
  if (!textGroup) {
    console.warn('updateTextMesh: textGroup null');
    return;
  }
  // 1) İlgili alt grubu bul
  const labelGroup = textGroup.getObjectByName(childName);
  if (!labelGroup) {
    console.warn(`updateTextMesh: ${childName} bulunamadı`);
    return;
  }

  // 2) Onun içindeki Mesh'i al
  const mesh = labelGroup.children.find(c => c instanceof THREE.Mesh);
  if (!mesh) {
    console.warn(`updateTextMesh: ${childName} altında Mesh yok`);
    return;
  }

  // 3) Geçici sahnede yeni metin plane'i oluştur
  const tmpScene = new THREE.Scene();
  const tmpGroup = drawTextFromCode(tmpScene, {
    text: newText,
    position: { x: 0, y: 0 },
    fontSize: mesh.userData.fontSize || 18,  // kullanıcı fontSize saklıyorsa kullan
    color: mesh.userData.color || '#ffffff',
    alignment: mesh.userData.alignment || 'center',
    halign: mesh.userData.halign  || 1,
    valign: mesh.userData.valign  || 0,
    rotation: mesh.userData.rotation || 0
  });

  // 4) Yeni mesh referansını al
  const newMesh = tmpGroup.children.find(c => c instanceof THREE.Mesh);
  if (!newMesh) {
    console.warn('updateTextMesh: yeni Mesh oluşturulamadı');
    return;
  }

  // ----- swap geometry -----
  mesh.geometry.dispose();
  mesh.geometry = newMesh.geometry;

  // ----- swap texture -----
  mesh.material.map.dispose();
  mesh.material.map = newMesh.material.map;
  mesh.material.needsUpdate = true;
}
