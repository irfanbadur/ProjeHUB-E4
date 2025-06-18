import { useRef } from 'react';
import * as THREE from 'three';
import ClipperLib from 'clipper-lib';
import { generateUniqueId } from '../../utils/generateUniqueId';

const useOffsetWiring = (scene) => {
  const activeOffsetPolylineRef = useRef(null);
  function isClockwise(points) {
    let sum = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      sum += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return sum > 0;
  }
  
  const createOffsetPolylinePreview = (polyline, offsetDistance = 5) => {
    if (!polyline || !polyline.geometry) return;
  
    if (activeOffsetPolylineRef.current) {
      scene.remove(activeOffsetPolylineRef.current);
      activeOffsetPolylineRef.current.geometry.dispose();
      activeOffsetPolylineRef.current.material.dispose();
      activeOffsetPolylineRef.current = null;
    }
  
    const posAttr = polyline.geometry.attributes.position;
    const points = [];
    for (let i = 0; i < posAttr.count; i++) {
      const p = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      points.push(new THREE.Vector3(p.x, p.y, 0));
    }
  
    if (points.length < 3) return;
  
    // Clipper ile kapalı kabul edilecek, son noktayı tekrar eklemeye gerek yok
    const isClosed = true;
  
    const clockwise = isClockwise(points);
    const scale = 1000;
    const inputPath = points.map(p => ({ X: p.x * scale, Y: p.y * scale }));
  
    const co = new ClipperLib.ClipperOffset();
    co.AddPath(inputPath, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
  
    // ✅ İçeri offset: saat yönünde ise +, ters ise -
    const signedOffset = clockwise ? Math.abs(offsetDistance) : -Math.abs(offsetDistance);
  
    const result = new ClipperLib.Paths();
    co.Execute(result, signedOffset * scale);
  
    if (result.length === 0) return;
  
    const offsetPoints = result[0].map(p => new THREE.Vector3(p.X / scale, p.Y / scale, 0));
    offsetPoints.push(offsetPoints[0].clone()); // Kapalı hale getir
  
    const geometry = new THREE.BufferGeometry().setFromPoints(offsetPoints);
    const material = new THREE.LineDashedMaterial({
      color: 0xff00ff,
      dashSize: 4,
      gapSize: 2,
    });
  
    const line = new THREE.LineLoop(geometry, material);
    line.computeLineDistances();
    line.userData.type = 'offsetPreview';
    line.userData.id = generateUniqueId('offset');
    line.userData.snapVertices = offsetPoints.map(p => p.clone());
  
    scene.add(line);
    activeOffsetPolylineRef.current = line;
  };
  
  

  const cleanupOffset = () => {
    if (activeOffsetPolylineRef.current) {
      scene.remove(activeOffsetPolylineRef.current);
      activeOffsetPolylineRef.current.geometry.dispose();
      activeOffsetPolylineRef.current.material.dispose();
      activeOffsetPolylineRef.current = null;
    }
  };

  return {
    createOffsetPolylinePreview,
    cleanupOffset,
    activeOffsetPolylineRef,
  };
};

export default useOffsetWiring;
