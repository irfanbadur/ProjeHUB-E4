import { useEffect } from 'react';
 
export default function useSocketGizmo(scene, selectedObjectIds) {
    useEffect(() => {
      if (!scene || !Array.isArray(selectedObjectIds)) return;
  
      // Scene içinden objeleri ID'ye göre bul
      const selectedObjects = scene.children.filter(obj =>
        selectedObjectIds.includes(obj.userData?.id)
      );
  
      // Önceki gizmo'ları görünmez yap
      scene.children.forEach(obj => {
        if (obj.userData?.type === 'socket') {
          obj.traverse(child => {
            if (child.userData?.type === 'rotateGizmo' || child.userData?.type === 'stretchGizmo'|| child.userData?.type === 'symetricGizmo'|| child.userData?.type === 'moveGizmo') {
              child.visible = false;
            }
          });
        }
      });
      
  
      // Yeni gizmo'ları ekle
      selectedObjects.forEach(obj => {
        if (obj.userData?.type === 'socket') {
          obj.traverse(child => {
            if (child.userData?.type === 'rotateGizmo' || child.userData?.type === 'stretchGizmo'|| child.userData?.type === 'symetricGizmo'|| child.userData?.type === 'moveGizmo') {
              child.visible = true;
            }
          });
        }
      });
    }, [scene, selectedObjectIds]);
  }
  