import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';

export function useGizmoRender(scene) {
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);
  const gizmoGroupRef = useRef(null);

  useEffect(() => {
    if (!scene) return;

    // Önceki gizmoları temizle
    if (gizmoGroupRef.current) {
      scene.remove(gizmoGroupRef.current);
      gizmoGroupRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        
      });
      gizmoGroupRef.current = null;
    }

    if (selectedObjectIds.length === 0) return;

    const gizmoGroup = new THREE.Group();
    gizmoGroup.name = "__gizmoGroup";

    scene.traverse((obj) => {
      if (obj.isLine && selectedObjectIds.includes(obj.userData.id)) {
        const pos = obj.geometry.attributes.position.array;
        console.log("GİZMO LİNE : ",obj)
        const start = new THREE.Vector3(pos[0], pos[1], pos[2]);
        const end = new THREE.Vector3(pos[3], pos[4], pos[5]);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        [start, end, center].forEach((point, index) => {
          const geometry = new THREE.PlaneGeometry(10, 10);
          const material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            //color: index === 0 ? 0x0000ff : index === 1 ? 0xff0000 : 0xffff00,
            transparent: true,
            opacity: 0.8,
            depthTest: false,
          });
          const gizmo = new THREE.Mesh(geometry, material);
          gizmo.position.copy(point);
          gizmo.name = `__gizmo_${index}`;
          gizmo.renderOrder = 999;
          gizmo.userData = {
            isGizmo: true,
            type: index === 0 ? "start" : index === 1 ? "end" : "center",
            lineId: obj.userData.id,
            objUUID:obj.uuid
          };
          gizmoGroup.add(gizmo);
        });
      }
    });

    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;
  }, [scene, selectedObjectIds]);
}
