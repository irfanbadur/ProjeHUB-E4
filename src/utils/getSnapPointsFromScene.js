import * as THREE from 'three';

export function getSnapPointsFromScene(scene, snapGroup = null,
  options = {}) {
  const { allowedTypes = null } = options;
  const points = [];

  if (!scene) return points;
  if (snapGroup) {
    snapGroup.clear();
    snapGroup.visible = false;
  }

  const addSnapPoint = (pos, type, no = null, parent) => {
    // if allowedTypes is specified, skip any type not in it
    if (allowedTypes && !allowedTypes.includes(type)) return;
    points.push({ no, position: pos.clone(), type, parent });
    if (snapGroup) {
      const marker = new THREE.Object3D();
      marker.position.copy(pos);
      marker.userData = { type, no };
      snapGroup.add(marker);
    }
  };

  // 🔁 1. BuatCircle Meshlerini ekle
  scene.traverse(obj => {
    const t = obj.userData?.type;
    if (!t) return;

    // e.g. buat circles, squares, panel connections, etc.
    if (t === 'buatCircle')   addSnapPoint(obj.position, obj.userData.snapType || t, obj.uuid, obj);
    if (t === 'buatLightingSquare') addSnapPoint(obj.position, obj.userData.snapType || t, obj.uuid, obj.parent);
    if (t === 'buatLightingCircle') addSnapPoint(obj.position, obj.userData.snapType || t, obj.uuid, obj.parent);
    if (t === 'panelCon_out') addSnapPoint(obj.position, obj.userData.snapType || t, obj.uuid, obj);
    // …etc.
  });
 

  // 🔁 2. Çizgisel nesneleri işle
  scene.traverse((child) => {
    const isLineType = child.type === 'Line' || child.type === 'LineLoop' || child.type === 'LineSegments';
    if (isLineType && child.userData?.isSelectable) {
      const geometry = child.geometry;
      const positionAttr = geometry.attributes?.position;
      if (!positionAttr) return;

      const vertexCount = positionAttr.count;
      const vertices = [];

      for (let i = 0; i < vertexCount; i++) {
        const localVertex = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
        const worldVertex = localVertex.clone();
        child.localToWorld(worldVertex);
        vertices.push(worldVertex);
      }

      const isFullCircle = child.type === 'LineLoop' && vertexCount >= 32;
      const isArc = child.type === 'Line' && vertexCount > 3;
      const isEllipse = child.userData?.type === 'ellipse';
      const isPolyline = child.userData?.type === 'polyline';

      if (isFullCircle || isArc || isEllipse) {
        let center, radius;

        if (child.userData.center && child.userData.radius) {
          center = new THREE.Vector3(
            child.userData.center.x,
            child.userData.center.y,
            child.userData.center.z || 0
          );
          child.localToWorld(center);
          radius = child.userData.radius;
        } else {
          center = new THREE.Vector3();
          vertices.forEach(v => center.add(v));
          center.divideScalar(vertexCount);
          radius = vertices[0].distanceTo(center);
        }

        addSnapPoint(center, 'center', child.uuid,child.userData);
        if(child.userData.type==="panelCon_out") return;

        const angles = isEllipse
          ? [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
          : [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75];

        angles.forEach((angle, idx) => {
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);
          const pos = new THREE.Vector3(x, y, 0);
          addSnapPoint(pos, idx % 2 === 0 ? 'quadrant' : 'diagonal', child.uuid,child.userData);
        });

        if (isArc) {
          addSnapPoint(vertices[0], 'start', child.uuid,child.userData);
          addSnapPoint(vertices[vertices.length - 1], 'end', child.uuid,child.userData);
        }

      }

      vertices.forEach((vertex, idx) => {
        const type = idx === 0 ? 'start' : idx === vertexCount - 1 ? 'end' : 'vertex';
        addSnapPoint(vertex, type, child.uuid,child.userData);
      });

      if (isPolyline && vertices.length > 1) {
        const midpoint = new THREE.Vector3();
        vertices.forEach(v => midpoint.add(v));
        midpoint.divideScalar(vertices.length);
        addSnapPoint(midpoint, 'midpoint', child.uuid,child.userData);
     
      }
    }
  });

  return points;
}
