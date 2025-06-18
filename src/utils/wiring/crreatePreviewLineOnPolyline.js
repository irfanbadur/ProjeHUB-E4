import * as THREE from 'three';
import { getClosestSegment2D } from './getSegmentOfPolyline';

// Polyline üzerinde ilerleyen ön izleme fonksiyonu
export const createPreviewLineOnPolyline = (path, startPoint, worldPos, scene) => {
    // Polyline'ın vertexlerini al
    console.log("createPreviewLineOnPolyline ",path, startPoint, worldPos );

    const positions = path.geometry.attributes.position.array;

    // İlk ve son vertexleri al
    const startVertex = new THREE.Vector3(positions[0], positions[1], positions[2]);
    const endVertex = new THREE.Vector3(positions[positions.length - 3], positions[positions.length - 2], positions[positions.length - 1]);

    // Başlangıç ve bitiş noktalarının farklı olduğundan emin ol
    if (startVertex.equals(endVertex)) {
        console.error('Başlangıç ve bitiş noktaları aynı. Polyline geçerli bir segment oluşturamıyor.');
        return null;
    }

    // Line3 oluştur
    const line = new THREE.Line3(startVertex, endVertex);
    console.log("line ",line, startVertex, endVertex );

    // worldPos'un geçerli bir vektör olup olmadığını kontrol et
    if (!worldPos || !(worldPos instanceof THREE.Vector3)) {
        console.error('Geçersiz worldPos vektörü:', worldPos);
        return null;
    }

    // Polyline üzerindeki en yakın noktayı bul
   // const closestPoint = line.closestPointToPoint(worldPos, true); // worldPos ile polyline arasındaki en yakın noktayı bulur.
    const closestPoint = getClosestSegment2D(path, worldPos);

    // closestPoint'in geçerli olup olmadığını kontrol et
    if (!closestPoint) {
        console.error('En yakın nokta bulunamadı.');
        return null;
    }

    // Yeni polyline noktalarını hesapla
    const previewPoints = [startPoint, closestPoint];

    // Ön izleme çizgisi oluştur
    const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const previewLine = new THREE.Line(geometry, material);

    // Sahneye ekle
    scene.add(previewLine);

    return previewLine;
};
