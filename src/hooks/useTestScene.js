import { useEffect } from "react";
import { useSelector } from "react-redux";
import * as THREE from 'three';
import { walkWithIntersectionCircle } from "../utils/wiring/walkWithIntersectionCircel";
export function useTestScene(scene) {
  const commandType = useSelector((state) => state.operation.commandType);
  const snapPoints = useSelector((state) => state.snap.snapPoints); // Redux store'dan snapPoints alınır
 
  function getAllPolylineSegments(scene) {
    const segments = [];
  
    scene.traverse(obj => {
      if (obj.userData?.type === 'polyline') {
        const pos = obj.geometry.attributes.position;
        const points = [];
        for (let i = 0; i < pos.count; i++) {
          points.push(new THREE.Vector3().fromBufferAttribute(pos, i));
        }
  
        for (let i = 0; i < points.length - 1; i++) {
          segments.push({
            start: points[i],
            end: points[i + 1],
            parent: obj
          });
        }
  
        // kapalıysa son segmenti de ekle
        if (points[0].distanceTo(points.at(-1)) < 0.001) {
          segments.push({
            start: points.at(-1),
            end: points[0],
            parent: obj
          });
        }
      }
    });
  
    return segments;
  }
  
  function findLabelPosition(scene, label = "mutfak") {
    let found = null;
  
    scene.traverse(obj => {
      const ud = obj.userData || {};
      if (ud.type === "mtext" && (ud.rawText || "").toUpperCase().includes(label.toUpperCase())) {
        // Pozisyon doğrudan obj.position'da olabilir
        if (obj.position) {
          found = obj.position.clone();
        }
  
        // Alternatif olarak boundingBox'tan alınabilir
        else if (obj.geometry?.boundingBox) {
          found = new THREE.Vector3();
          obj.geometry.boundingBox.getCenter(found);
        }
      }
    });
    console.log("FOUNDED TEXT")
    return found;
  }
 
  
  function closestPointOnSegment(p, a, b) {
    const ab = new THREE.Vector3().subVectors(b, a);
    const t = new THREE.Vector3().subVectors(p, a).dot(ab) / ab.lengthSq();
    const clampedT = Math.max(0, Math.min(1, t));
    return new THREE.Vector3().copy(ab).multiplyScalar(clampedT).add(a);
  }
  
  function findClosestSegment(segments, point) {
    let minDist = Infinity;
    let closest = null;
  
    for (const seg of segments) {
      const nearest = closestPointOnSegment(point, seg.start, seg.end);
      const dist = nearest.distanceTo(point);
      if (dist < minDist) {
        minDist = dist;
        closest = seg;
      }
    }
  
    return closest;
  }
  
 
 
 
  function selectNextEndpointCCW(basePoint, prevDir, candidates) {
    // Her adaya açısını hesapla
    return candidates
      .map(p => ({
        point: p,
        angle: normalizeAngle(angleCCW(basePoint, p) - prevDir),
      }))
      .sort((a, b) => a.angle - b.angle)[0].point; // en küçük CCW açı
  }
  
  function normalizeAngle(angle) {
    return (angle + 2 * Math.PI) % (2 * Math.PI);
  }
  
  
  function angleCCW(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
  
  function walkWithCircleChain(startSegment, allSegments, radius = 1.2, stepLength = 1, maxSteps = 1000) {
    const chain = [startSegment];
    const visited = new Set();
    visited.add(allSegments.indexOf(startSegment));
  
    let currentPoint = startSegment.end.clone();
    let prevDirection = angleCCW(startSegment.start, startSegment.end);
  
    for (let i = 0; i < maxSteps; i++) {
      // 1. Tüm segment uç noktalarını topla
      const candidatePoints = [];
      for (const seg of allSegments) {
        if (visited.has(allSegments.indexOf(seg))) continue;
        if (seg.start.distanceTo(currentPoint) < radius) candidatePoints.push(seg.start.clone());
        else if (seg.end.distanceTo(currentPoint) < radius) candidatePoints.push(seg.end.clone());
      }
  
      if (candidatePoints.length === 0) break;
  
      // 2. Uç nokta seç
      let nextPoint;
      if (candidatePoints.length === 1) {
        nextPoint = candidatePoints[0];
      } else {
        nextPoint = selectNextEndpointCCW(currentPoint, prevDirection, candidatePoints);
      }
  
      // 3. Bağlı segmenti bul
      const nextSegment = allSegments.find(seg =>
        (seg.start.distanceTo(nextPoint) < 1e-3 && seg.end.distanceTo(currentPoint) < radius) ||
        (seg.end.distanceTo(nextPoint) < 1e-3 && seg.start.distanceTo(currentPoint) < radius)
      );
  
      if (!nextSegment) break;
  
      const ordered = nextSegment.start.distanceTo(currentPoint) < nextSegment.end.distanceTo(currentPoint)
        ? nextSegment
        : { ...nextSegment, start: nextSegment.end, end: nextSegment.start };
  
      visited.add(allSegments.indexOf(nextSegment));
      chain.push(ordered);
      prevDirection = angleCCW(ordered.start, ordered.end);
      currentPoint = ordered.end.clone();
  
      // Kapanma kontrolü
      if (currentPoint.distanceTo(startSegment.start) < radius) break;
    }
  
    return chain;
  }
  
  
  
  function drawPolylineFromSegments(scene, segments, color = 0xff0000) {
    const validPoints = [];
  
    for (const seg of segments) {
      if (!seg?.start || !seg?.end) continue;
      validPoints.push(seg.start.clone());
      validPoints.push(seg.end.clone());
    }
  
    const geometry = new THREE.BufferGeometry().setFromPoints(validPoints);
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.LineSegments(geometry, material);
    scene.add(line);
  }
  
  
  
  
  useEffect(() => {
    if (!scene || !commandType) return;

    if (commandType === "showSnaps") {
    
      // Snap markerlarını konsola yazdırıyoruz
      console.log("🔵 TUM SNAP MARKERLAR (Redux Store'dan alınanlar):", snapPoints);
    
      // Eğer sahnede markerlar var ve görünmeyenleri de dahil etmek isterseniz
      snapPoints.forEach((snapPoint) => {
        console.log("Snap Point:", snapPoint); // Her bir snapPoint bilgisi yazdırılır
      });
    } else if (commandType === "showGizmos") {
      const gizmos = [];
      scene.traverse((obj) => {
        if (obj.name.startsWith("__gizmo")) {
          gizmos.push(obj);
        }
      });
      console.log("🟣 GİZMOLAR:", gizmos);

    } else if (commandType === "showLines") {

     
            
      const labelPos = findLabelPosition(scene, "mutfak");

      if (labelPos) {
         
        const segments = getAllPolylineSegments(scene); 
        const allEndpoints = segments.flatMap(seg => [seg.start, seg.end]);
        const startSegment = findClosestSegment(segments, labelPos);
        const path = walkWithIntersectionCircle(
          { start: startSegment.start, end: startSegment.end },
          allEndpoints,
          scene,
          { radius: 1.2, stepLength: 1 }
        );
        drawPolylineFromSegments(scene, path, 0xff0000);
        
        
      }
      
      
      
      






      //------------------------------------------------------
      const lines = [];
      scene.traverse((obj) => {
        if (obj.isLine && obj.geometry?.attributes?.position?.count === 2) {
          lines.push(obj);
        }
      });
      console.log("🟡 LİNE OBJELERİ:", lines);

 
    } else if (commandType === "showObject") {
      const lines = [];
      scene.traverse((obj) => {
        // Objelerin Line olup olmadığını ve doğru geometrilere sahip olup olmadığını kontrol et
        if (obj.isLine && obj.geometry?.attributes?.position?.count === 2) {
          lines.push(obj);  // Line objesini array'e ekle
        }
      });
      console.log("🟡 LİNE OBJELERİ:", lines);
    
      // Eğer sahnedeki diğer objeleri de görmek isterseniz
      scene.traverse((obj) => {
        console.log("🟢 OBJELERİ:", obj);  // Sahnedeki her objeyi konsola yazdır
      });
    }
     else if (commandType === "showPolylines") {
      const polylines = [];
      scene.traverse((obj) => {
        if (obj.isLine && obj.geometry?.attributes?.position?.count > 2) {
          polylines.push(obj);
        }
      });
      console.log("🟢 POLYLINE OBJELERİ:", polylines);
    }
  }, [scene, commandType]);
}
