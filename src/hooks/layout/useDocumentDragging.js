import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useDocumentDragging(draggableGroups, camera, domElement, mainFrameBounds = null) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggingRef = useRef(null);
  const offsetRef = useRef(new THREE.Vector3());
  const snapLinesRef = useRef([]);
  const SNAP_OFFSET = 50;
const DOCUMENT_OFFSET = 100;

  useEffect(() => {
    if (!draggableGroups || !camera || !domElement) return;

    const clearSnapLines = () => {
      snapLinesRef.current.forEach(line => {
        line.parent?.remove(line);
      });
      snapLinesRef.current = [];
    };

    const addSnapLine = (scene, start, end) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      snapLinesRef.current.push(line);
    };

    const getIntersects = (event) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const allMeshes = draggableGroups
        .map(group => group.children)
        .flat()
        .filter(obj => obj.userData.isDraggable);

      return raycaster.intersectObjects(allMeshes, true);
    };

    const isWithinFrame = (pos, width, height) => {
      if (!mainFrameBounds) return true;
      const { minX, maxX, minY, maxY } = mainFrameBounds;
      return (
        pos.x >= minX &&
        pos.x + width <= maxX &&
        pos.y <= maxY &&
        pos.y - height >= minY
      );
    };

    const isOverlapping = (targetGroup) => {
      const aBox = new THREE.Box3().setFromObject(targetGroup);
      for (let obj of draggableGroups) {
        if (obj !== targetGroup) {
          const bBox = new THREE.Box3().setFromObject(obj);
          if (aBox.intersectsBox(bBox)) return true;
        }
      }
      return false;
    };

    const onMouseDown = (e) => {
      const intersects = getIntersects(e);
      const header = intersects.find(i => i.object.userData.isDraggable);
      if (header) {
        draggingRef.current = header.object.parent;
        const intersectPoint = intersects[0].point.clone();
        offsetRef.current.copy(intersectPoint).sub(draggingRef.current.position);
      }
    };

    const onMouseMove = (e) => {
      if (!draggingRef.current) return;

      const rect = domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      const doc = draggingRef.current;
      const originalPos = intersection.sub(offsetRef.current);
      let newX = originalPos.x;
      let newY = originalPos.y;

      const thisBox = new THREE.Box3().setFromObject(doc);
      const thisWidth = thisBox.max.x - thisBox.min.x;
      const thisHeight = thisBox.max.y - thisBox.min.y;

      clearSnapLines();

      for (const other of draggableGroups) {
        if (other === doc) continue;
        const otherBox = new THREE.Box3().setFromObject(other);

        const edges = {
          left: otherBox.min.x,
          right: otherBox.max.x,
          top: otherBox.max.y,
          bottom: otherBox.min.y,
        };

        const thisEdges = {
          left: newX,
          right: newX + thisWidth,
          top: newY,
          bottom: newY - thisHeight,
        };

// Sola hizalama (diğerin sağ kenarına DOCUMENT_OFFSET uzaklıkta)
if (Math.abs(thisEdges.left - (edges.right + DOCUMENT_OFFSET)) < SNAP_OFFSET) {
  newX = edges.right + DOCUMENT_OFFSET;
  addSnapLine(doc.parent,
    new THREE.Vector3(edges.right, mainFrameBounds.minY, 0.1),
    new THREE.Vector3(edges.right, mainFrameBounds.maxY, 0.1)
  );
}

// Sağa hizalama (diğerin sol kenarından DOCUMENT_OFFSET uzaklıkta)
if (Math.abs(thisEdges.right - (edges.left - DOCUMENT_OFFSET)) < SNAP_OFFSET) {
  newX = edges.left - thisWidth - DOCUMENT_OFFSET;
  addSnapLine(doc.parent,
    new THREE.Vector3(edges.left, mainFrameBounds.minY, 0.1),
    new THREE.Vector3(edges.left, mainFrameBounds.maxY, 0.1)
  );
}

// Üste hizalama (diğerin alt kenarına DOCUMENT_OFFSET uzaklıkta)
if (Math.abs(thisEdges.top - (edges.bottom - DOCUMENT_OFFSET)) < SNAP_OFFSET) {
  newY = edges.bottom - DOCUMENT_OFFSET;
  addSnapLine(doc.parent,
    new THREE.Vector3(mainFrameBounds.minX, edges.bottom, 0.1),
    new THREE.Vector3(mainFrameBounds.maxX, edges.bottom, 0.1)
  );
}

// Alta hizalama (diğerin üst kenarına DOCUMENT_OFFSET uzaklıkta)
if (Math.abs(thisEdges.bottom - (edges.top + DOCUMENT_OFFSET)) < SNAP_OFFSET) {
  newY = edges.top + thisHeight + DOCUMENT_OFFSET;
  addSnapLine(doc.parent,
    new THREE.Vector3(mainFrameBounds.minX, edges.top, 0.1),
    new THREE.Vector3(mainFrameBounds.maxX, edges.top, 0.1)
  );
}

      }

      const snappedPos = new THREE.Vector3(newX, newY, 0);
      if (isWithinFrame(snappedPos, thisWidth, thisHeight)) {
        doc.position.set(newX, newY, 0);

        if (isOverlapping(doc)) {
          doc.children.forEach(child => {
            if (child.material?.color) child.material.color.set(0xff0000);
          });
        } else {
          doc.children.forEach(child => {
            if (child.material?.color) child.material.color.set(0xdddddd);
          });
        }
      }
    };

    const onMouseUp = () => {
      draggingRef.current = null;
      clearSnapLines();
    };

    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('mouseup', onMouseUp);

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggableGroups, camera, domElement, mainFrameBounds]);
}
