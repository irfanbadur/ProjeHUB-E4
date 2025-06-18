export function getClosestSegment2D(vertices, position) {
    if (!vertices || vertices.length < 4) return null;
  
    let closestSegment = null;
    let minDist = Infinity;
  
    for (let i = 0; i < vertices.length - 2; i += 2) {
      const x1 = vertices[i];
      const y1 = vertices[i + 1];
      const x2 = vertices[i + 2];
      const y2 = vertices[i + 3];
  
      const closest = getClosestPointOnSegment(x1, y1, x2, y2, position.x, position.y);
      const dist = distance(closest.x, closest.y, position.x, position.y);
  
      if (dist < minDist) {
        minDist = dist;
        closestSegment = {
          p1: { x: x1, y: y1 },
          p2: { x: x2, y: y2 },
          projection: closest,      // ✨ eklendi
          index: i / 2
        };
      }
    }
  
    return closestSegment;
  }
  
  
  // Yardımcı fonksiyon: bir segment üzerindeki en yakın noktayı bul
  function getClosestPointOnSegment(x1, y1, x2, y2, px, py) {
    const dx = x2 - x1;
    const dy = y2 - y1;
  
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) return { x: x1, y: y1 }; // segment bir nokta
  
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t)); // clamp 0..1
  
    return {
      x: x1 + t * dx,
      y: y1 + t * dy,
    };
  }
  
  // Yardımcı fonksiyon: iki nokta arası mesafe
  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  