import { useEffect } from 'react';
 
export default function useFixtureGizmo(scene, selectedObjectIds) {
    useEffect(() => {
      if (!scene || !Array.isArray(selectedObjectIds)) return;
  
      // Scene içinden objeleri ID'ye göre bul
      const selectedObjects = scene.children.filter(obj =>
        selectedObjectIds.includes(obj.userData?.id)
      );
  
      // Önceki gizmo'ları görünmez yap
      scene.children.forEach(obj => {
        if (obj.userData?.type === 'LightFixture') {
          obj.traverse(child => {
            if (child.userData?.type === 'rotateGizmo'  ) {
              child.visible = false;
            }
          });
        }
      });
      
  
      // Yeni gizmo'ları ekle
      selectedObjects.forEach(obj => {
        if (obj.userData?.type === 'LightFixture') {
          obj.traverse(child => {
            if (child.userData?.type === 'rotateGizmo' ) {
              child.visible = true;
            }
          });
        }
      });
    }, [scene, selectedObjectIds]);
  }
  