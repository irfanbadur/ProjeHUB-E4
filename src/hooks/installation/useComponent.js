import { useRef } from 'react';
import * as THREE from 'three';

/**
 * useComponent
 * 
 * - Kablo çiziminin önizlemesini yönetir
 * - Kalıcı sembol veya soket gibi nesneler oluşturur
 * - Önizleme objelerini temizler
 * 
 * @param {THREE.Scene} scene - Üzerinde işlem yapılacak Three.js sahnesi
 * @param {Object} wireRef - Ana kablo referansı
 * @param {Object} polylineRef - Orijinal polyline referansı
 * @param {Object} options - Ayarlar { size, color }
 */
export const useComponent = (scene, wireRef, polylineRef, options = {}) => {
  const {
    size = 15,
    color = 0x00ff00,
  } = options;

  const previewRef = useRef(null);

  /**
   * Önizleme çizgisini güncelle
   * @param {THREE.Vector3[]} previewPoints 
   */
  const updatePreview = (previewPoints = []) => {
    if (!previewPoints.length) return;

    // Önceki varsa kaldır
    if (previewRef.current) {
      scene.remove(previewRef.current);
      previewRef.current.geometry.dispose();
      previewRef.current.material.dispose();
      previewRef.current = null;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
    const material = new THREE.LineDashedMaterial({
      color,
      dashSize: 5,
      gapSize: 3,
    });
    const previewLine = new THREE.Line(geometry, material);
    previewLine.computeLineDistances(); // Dash için gerekli
    previewLine.name = 'previewLine';

    scene.add(previewLine);
    previewRef.current = previewLine;
  };

  /**
   * Önizleme çizgisini temizle
   */
  const removePreview = () => {
    if (previewRef.current) {
      scene.remove(previewRef.current);
      previewRef.current.geometry.dispose();
      previewRef.current.material.dispose();
      previewRef.current = null;
    }
  };

  /**
   * Kalıcı sembol oluşturur (ör. buat veya soket gibi)
   * Basit bir daire ile örneklenmiştir.
   */
  const createPermanentSymbol = () => {
    if (!wireRef.current) return;

    // Kablo son noktasına sembol yerleştir
    const geometry = new THREE.CircleGeometry(size, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    const circle = new THREE.Mesh(geometry, material);

    // Kablosunun son noktasını al
    const positions = wireRef.current.geometry.attributes.position.array;
    const lastIndex = positions.length - 3;
    const lastPoint = new THREE.Vector3(
      positions[lastIndex],
      positions[lastIndex + 1],
      positions[lastIndex + 2]
    );

    circle.position.copy(lastPoint);
    circle.name = 'buatSymbol';
    scene.add(circle);
  };

  return {
    updatePreview,
    removePreview,
    previewRef,
    createPermanentSymbol,
  };
};
