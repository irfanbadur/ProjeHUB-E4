import * as THREE from 'three';

export function createSnapMarker(size = 8, snapMarker) {
  const snapType = snapMarker?.type;
  const half = size / 2;
  let geometry, material, marker; 
  
  switch (snapType) {
    case 'startpoint':
    case 'endpoint': {
      // ⬛️ Uç noktalar: kare
      const points = [
        new THREE.Vector3(-half, -half, 0),
        new THREE.Vector3(half, -half, 0),
        new THREE.Vector3(half, half, 0),
        new THREE.Vector3(-half, half, 0),
        new THREE.Vector3(-half, -half, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      marker = new THREE.LineLoop(geometry, material);
      break;
    }

    case 'midpoint': {
      // 🔺 Üçgen
      const height = Math.sqrt(3) * size / 2;
      const points = [
        new THREE.Vector3(0, height / 2, 0),
        new THREE.Vector3(-half, -height / 2, 0),
        new THREE.Vector3(half, -height / 2, 0),
        new THREE.Vector3(0, height / 2, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      marker = new THREE.LineLoop(geometry, material);
      break;
    }

    case 'center': {
      // 🟢 Merkez: Daire (Ring)
      geometry = new THREE.RingGeometry(size * 0.6, size, 32);
      material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      marker = new THREE.Mesh(geometry, material);
      break;
    }

    case 'quadrant': {
      // ⬜️ Dörtlü snap: dikdörtgen
      const points = [
        new THREE.Vector3(-half, -half, 0),
        new THREE.Vector3(half, -half, 0),
        new THREE.Vector3(half, half, 0),
        new THREE.Vector3(-half, half, 0),
        new THREE.Vector3(-half, -half, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({ color: 0x00ffff });
      marker = new THREE.LineLoop(geometry, material);
      break;
    }

    case 'diagonal': {
      // ✳️ Çapraz: Çarpı (X)
      const points = [
        new THREE.Vector3(-half, -half, 0),
        new THREE.Vector3(half, half, 0),
        new THREE.Vector3(NaN, NaN, NaN), // break
        new THREE.Vector3(-half, half, 0),
        new THREE.Vector3(half, -half, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points.filter(p => !isNaN(p.x)));
      material = new THREE.LineBasicMaterial({ color: 0xff00ff });
      marker = new THREE.LineSegments(geometry, material);
      break;
    }

    case 'intersection': {
      // ❌ Kesişim noktası: çarpı
      const points = [
        new THREE.Vector3(-half, -half, 0),
        new THREE.Vector3(half, half, 0),
        new THREE.Vector3(-half, half, 0),
        new THREE.Vector3(half, -half, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      marker = new THREE.LineSegments(geometry, material);
      break;
    }

    case 'perpendicular': {
      // ⊥ simgesi
      const points = [
        new THREE.Vector3(-half, 0, 0),
        new THREE.Vector3(half, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, half, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({ color: 0xffff00 });
      marker = new THREE.LineSegments(geometry, material);
      break;
    }

    case 'tangent': {
      // ↔⟂ Tangent sembolü: Yarı yay + dik
      geometry = new THREE.CircleGeometry(size, 16, 0, Math.PI / 2);
      geometry.vertices?.shift?.(); // remove center vertex (for older versions)
      material = new THREE.LineBasicMaterial({ color: 0xffa500 });
      marker = new THREE.Line(geometry, material);
      break;
    }

    case 'nearest': {
      // ◉ En yakın nokta: küçük daire
      geometry = new THREE.CircleGeometry(size / 2, 16);
      geometry.vertices?.shift?.();
      material = new THREE.LineBasicMaterial({ color: 0x00ffcc });
      marker = new THREE.Line(geometry, material);
      break;
    }

    case 'extension': {
      // ➕ Uzantı: artı işareti
      const points = [
        new THREE.Vector3(-half, 0, 0),
        new THREE.Vector3(half, 0, 0),
        new THREE.Vector3(0, -half, 0),
        new THREE.Vector3(0, half, 0),
      ];
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({ color: 0xffffff });
      marker = new THREE.LineSegments(geometry, material);
      break;
    }

    case 'node':
    case 'insertion':
    case 'reference': {
      // 🟣 Nokta veya referans: küçük nokta
      geometry = new THREE.CircleGeometry(size / 3, 8);
      geometry.vertices?.shift?.();
      material = new THREE.LineBasicMaterial({ color: 0x9999ff });
      marker = new THREE.Line(geometry, material);
      break;
    }

    default: {
      // Varsayılan: daire (ring)
      geometry = new THREE.RingGeometry(size * 0.6, size, 32);
      material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
      });
      marker = new THREE.Mesh(geometry, material);
    }
  }

  marker.renderOrder = 9999;
  marker.name = '__snapMarker';
  return marker;
}
