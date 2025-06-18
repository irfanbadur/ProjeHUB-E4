import * as THREE from 'three';

/**
 * Belirtilen çizgiden (line) ve bir referans noktadan belirli bir mesafede
 * paralel bir offset line oluşturur.
 * 
 * @param {THREE.Line} line - Orijinal Line objesi (veya polyline segmenti)
 * @param {THREE.Vector3} refPoint - Başlangıç için referans nokta
 * @param {number} offsetDistance - Ofset mesafesi (pozitif/negatif)
 * @returns {THREE.Line} - Oluşturulan ofset Line objesi
 */
export function createOffsetLine(line, refPoint, offsetDistance = 5) {
  // 1️⃣ Orijinal segmentin start-end noktalarını al
  const positions = line.geometry.attributes.position.array;
  const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
  const end = new THREE.Vector3(positions[3], positions[4], positions[5]);

  // 2️⃣ Segment doğrultusunu bul ve normalize et
  const direction = new THREE.Vector3().subVectors(end, start).normalize();

  // 3️⃣ Orijinal segmentin normalini bul (2D'de z düzlemine dik)
  const normal = new THREE.Vector3(-direction.y, direction.x, 0).normalize();

  // 4️⃣ Normal vektörü offset mesafesi kadar ölçekle
  const offset = normal.clone().multiplyScalar(offsetDistance);

  // 5️⃣ Orijinal start & end noktalarına offset uygula
  const newStart = start.clone().add(offset);
  const newEnd = end.clone().add(offset);

  // 6️⃣ Yeni offset Line oluştur
  const offsetGeometry = new THREE.BufferGeometry().setFromPoints([newStart, newEnd]);
  const offsetMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 1 });

  const offsetLine = new THREE.Line(offsetGeometry, offsetMaterial);

  // 7️⃣ UserData: bu bir offsetLine'dır diye işaretle
  offsetLine.userData.type = 'offsetLine';

  return offsetLine;
}
