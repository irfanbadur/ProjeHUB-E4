// utils/convertSnapPoints.js
export function serializeSnapPoints(points) {
    return points.map(p => ({
      ...p,
      position: { x: p.position.x, y: p.position.y, z: p.position.z },
    }));
  }
  