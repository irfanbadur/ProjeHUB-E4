import * as THREE from 'three';

// Yardımcı: Açı hesapla ve normalize et
function angleCCW(base, point) {
  return Math.atan2(point.y - base.y, point.x - base.x);
}

function normalizeAngle(angle) {
  return (angle + 2 * Math.PI) % (2 * Math.PI);
}

function distance(a, b) {
  return a.distanceTo(b);
}

// Yardımcı: Adaylar içinden saat tersi en küçük açılıyı seç
function selectCCWPoint(base, prevAngle, candidates) {
  const scored = candidates.map(pt => {
    const angle = normalizeAngle(angleCCW(base, pt) - prevAngle);
    return { point: pt, angle };
  });
  scored.sort((a, b) => a.angle - b.angle);
  return scored[0].point;
}

/**
 * @param {Object} startSegment - { start: Vector3, end: Vector3 }
 * @param {THREE.Vector3[]} allEndpoints - tüm segment uç noktaları
 * @param {THREE.Scene} scene - sahneye çizim için
 * @param {Object} options - ayarlar
 * @returns {THREE.Vector3[]} zincir yolu
 */
export function walkWithIntersectionCircle(startSegment, allEndpoints, scene, options = {}) {
  const stepLength = options.stepLength || 1;
  const radius = options.radius || 1.2;
  const maxSteps = options.maxSteps || 1000;
  const tolerance = options.tolerance || 0.01;

  const path = [startSegment.start.clone(), startSegment.end.clone()];
  let prevAngle = angleCCW(startSegment.start, startSegment.end);
  let currentPoint = startSegment.end.clone();
  let stepVec = new THREE.Vector3().subVectors(startSegment.end, startSegment.start).normalize();

  for (let i = 0; i < maxSteps; i++) {
    // Yeni daire merkezi
    const center = currentPoint.clone().add(stepVec.clone().multiplyScalar(stepLength));

    // Görselleştir: daire çiz
    const circleGeo = new THREE.CircleGeometry(radius, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
    const circleMesh = new THREE.Mesh(circleGeo, circleMat);
    circleMesh.position.set(center.x, center.y, 0);
    circleMesh.rotation.x = -Math.PI / 2;
    circleMesh.renderOrder = 999;
    scene.add(circleMesh);

    // Uç noktalar içinde bu dairenin içine düşenleri bul
    const nearby = allEndpoints.filter(pt => pt.distanceTo(center) < radius);

    if (nearby.length === 0) break;

    // Eğer tek nokta varsa onu seç
    let chosen;
    if (nearby.length === 1) {
      chosen = nearby[0];
    } else {
      chosen = selectCCWPoint(center, prevAngle, nearby);
    }

    // Zaten geldiysek bitir
    if (chosen.distanceTo(path[path.length - 1]) < tolerance) break;

    path.push(chosen.clone());
    prevAngle = angleCCW(center, chosen);
    stepVec = new THREE.Vector3().subVectors(chosen, currentPoint).normalize();
    currentPoint = chosen.clone();

    // Başlangıç noktasına dönersek çık
    if (currentPoint.distanceTo(path[0]) < radius * 0.8 && path.length > 3) break;
  }

  return path;
}
