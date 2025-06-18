import { useEffect } from 'react';
import * as THREE from 'three';
import { drawEntities } from '../utils/dxfDrawCore'; // Ana çizim fonksiyonlarını buraya böleceğiz

export function useDrawDxfEntities({
  entities,
  scene,
  camera,
  layers,
  place,
  textMeshesRef,
  rotation = 0,
}) {
  useEffect(() => {
    if (!entities || !scene || !camera || !layers || !place) return;

    // Sahneye DXF verisini çiz
    const group = drawEntities({
      entities,
      scene,
      camera,
      layers,
      place,
      textMeshesRef,
      rotation,
    });

    // Temizlik fonksiyonu
    return () => {
      if (group && scene && group.children.length > 0) {
        group.children.forEach(child => {
          scene.remove(child);
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose?.();
        });
      }
    };
  }, [entities, scene, camera, layers, place, rotation]);
}
