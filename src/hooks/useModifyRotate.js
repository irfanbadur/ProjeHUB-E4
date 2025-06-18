import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector, useDispatch } from 'react-redux';
import { setOperationStep, setOperationData, resetOperation, setCommandMessage } from '../redux/operationSlice';

const useModifyRotate = (scene, camera, renderer, refreshSnapPoints) => {
  const dispatch = useDispatch();
  const { commandType, step, data } = useSelector((state) => state.operation);
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const previewGroup = useRef(null);
  const originalPositions = useRef([]);

  useEffect(() => {
    if (commandType !== 'rotate') return;

    const getIntersectPoint = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const point = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane, point);
      return point;
    };

    const handleClick = (event) => {
      const point = getIntersectPoint(event);
      if (!point) return;

      if (step === 0) {
        dispatch(setOperationData({ basePoint: { x: point.x, y: point.y, z: point.z } }));
        dispatch(setCommandMessage("İkinci noktayı seçerek döndürme açısını belirleyin"));
        dispatch(setOperationStep(1));

        // Preview grubu oluştur
        const group = new THREE.Group();
        originalPositions.current = [];
        scene.children.forEach((obj) => {
          if (selectedObjectIds.includes(obj.userData.id)) {
            const clone = obj.clone();
            clone.material = obj.material.clone();
            clone.userData = { ...obj.userData };
            originalPositions.current.push({ obj, position: obj.position.clone(), rotation: obj.rotation.z });
            group.add(clone);
          }
        });
        scene.add(group);
        previewGroup.current = group;
      } else if (step === 1) {
        // Eğer Escape tuşuna basılmadıysa, işlemi tamamla
        const { basePoint } = data;
        const endPoint = point;

        const angle = Math.atan2(endPoint.y - basePoint.y, endPoint.x - basePoint.x);

        originalPositions.current.forEach(({ obj, position }) => {
          const dx = position.x - basePoint.x;
          const dy = position.y - basePoint.y;
          const r = Math.sqrt(dx * dx + dy * dy);
          const theta = Math.atan2(dy, dx) + angle;

          obj.position.set(
            basePoint.x + r * Math.cos(theta),
            basePoint.y + r * Math.sin(theta),
            0
          );
          obj.rotation.z += angle;
        });

        // Önizleme grubunu kaldır
        cleanup();

        dispatch(resetOperation());
        dispatch(setCommandMessage(""));

        renderer.render(scene, camera);
        if (refreshSnapPoints) {
          setTimeout(() => {
            refreshSnapPoints();
          }, 0);
        }
      }
    };

    const handleMouseMove = (event) => {
      if (step !== 1 || !previewGroup.current) return;

      const { basePoint } = data;
      const point = getIntersectPoint(event);
      if (!point) return;

      const angle = Math.atan2(point.y - basePoint.y, point.x - basePoint.x);

      previewGroup.current.children.forEach((clone, index) => {
        const { position } = originalPositions.current[index];
        const dx = position.x - basePoint.x;
        const dy = position.y - basePoint.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        const theta = Math.atan2(dy, dx) + angle;

        clone.position.set(
          basePoint.x + r * Math.cos(theta),
          basePoint.y + r * Math.sin(theta),
          0
        );
        clone.rotation.z = originalPositions.current[index].rotation + angle;
      });

      renderer.render(scene, camera);
    };

    const handleKeyDown = (e) => {
      console.log("  tuşa basıldı!",e.key);

      if (e.key === 'Escape') {
        console.log("Escape tuşuna basıldı!");

        // Objeleri eski pozisyonlarına al
        originalPositions.current.forEach(({ obj, position, rotation }) => {
          obj.position.copy(position);
          obj.rotation.z = rotation;
        });

        cleanup(); // Burada cleanup fonksiyonunu çağırıyoruz, böylece ön izleme silinir
        dispatch(resetOperation());
        dispatch(setCommandMessage(""));

        if (refreshSnapPoints) {
          setTimeout(() => {
            refreshSnapPoints();
          }, 0);
        }

        renderer.render(scene, camera);
      }
    };

    const cleanup = () => {
      if (previewGroup.current) {
        scene.remove(previewGroup.current);
        previewGroup.current = null;
      }
      originalPositions.current = []; // Clear out original positions
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [commandType , step, data,scene,   camera, renderer, refreshSnapPoints ]);

};

export default useModifyRotate;


 
