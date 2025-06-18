import React, { useRef, useState, useEffect } from 'react';
import './PropertiesPanel.css';
import { useSelector } from 'react-redux';
import { usePanels } from '../../../context/PanelsContext';
import InfoTable from '../../shared/InfoTable';
import { useSelectedObjectRef } from '../../../hooks/useSelectedObjectRef';
import * as THREE from 'three';
 



const mapObjectToProperties = (obj) => {
  if (!obj || !obj.userData) return null;

  const type = obj.userData.type || 'Unknown';

  switch (type) {
    case 'line': {
      const posAttr = obj.geometry.attributes.position;
      const start = new THREE.Vector3().fromBufferAttribute(posAttr, 0);
      const end = new THREE.Vector3().fromBufferAttribute(posAttr, 1);
      obj.localToWorld(start);
      obj.localToWorld(end);
      const length = start.distanceTo(end);

      return {
        type: 'Line',
        properties: [
          { label: 'Start X', type: 'number', value: start.x },
          { label: 'Start Y', type: 'number', value: start.y },
          { label: 'End X', type: 'number', value: end.x },
          { label: 'End Y', type: 'number', value: end.y },
          { label: 'Length', type: 'number', value: length },
        ]
      };
    }

    case 'polyline': {
      const posAttr = obj.geometry.attributes.position;
      const vertexCount = posAttr.count;
      const properties = [{ label: "Vertex Count", type: "number", value: vertexCount }];
      let totalLength = 0;
      let prev = null;

      for (let i = 0; i < vertexCount; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        obj.localToWorld(v);
        properties.push({
          label: `Vertex ${i + 1}`,
          type: "text",
          value: `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`
        });

        if (prev) totalLength += prev.distanceTo(v);
        prev = v.clone();
      }

      properties.push({ label: "Length", type: "number", value: totalLength });
      return { type: 'Polyline', properties };
    }

    case 'spline': {
      const posAttr = obj.geometry.attributes.position;
      const vertexCount = posAttr.count;
      const properties = [{ label: "Vertex Count", type: "number", value: vertexCount }];
      const points = [];

      for (let i = 0; i < vertexCount; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        obj.localToWorld(v);
        properties.push({
          label: `Vertex ${i + 1}`,
          type: "text",
          value: `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`
        });
        points.push(v);
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const totalLength = curve.getLength();

      properties.push({ label: "Length", type: "number", value: totalLength });
      return { type: 'Spline', properties };
    }

    case 'ellipse': {
      const center = obj.userData.center ? new THREE.Vector3(obj.userData.center.x, obj.userData.center.y, 0) : new THREE.Vector3();
      obj.localToWorld(center);
      return {
        type: 'Ellipse',
        properties: [
          { label: "Center X", type: "number", value: center.x },
          { label: "Center Y", type: "number", value: center.y },
          { label: "Major Axis", type: "number", value: obj.userData.majorRadius || 0 },
          { label: "Minor Axis", type: "number", value: obj.userData.minorRadius || 0 },
          { label: "Rotation Angle", type: "number", value: obj.userData.rotation || 0 },
        ]
      };
    }

    case 'circle': {
      const center = obj.userData.center ? new THREE.Vector3(obj.userData.center.x, obj.userData.center.y, 0) : new THREE.Vector3();
      obj.localToWorld(center);
      return {
        type: 'Circle',
        properties: [
          { label: "Center X", type: "number", value: center.x },
          { label: "Center Y", type: "number", value: center.y },
          { label: "Radius", type: "number", value: obj.userData.radius || 0 },
        ]
      };
    }

    case 'arc': {
      const center = obj.userData.center ? new THREE.Vector3(obj.userData.center.x, obj.userData.center.y, 0) : new THREE.Vector3();
      obj.localToWorld(center);
      return {
        type: 'Arc',
        properties: [
          { label: "Center X", type: "number", value: center.x },
          { label: "Center Y", type: "number", value: center.y },
          { label: "Radius", type: "number", value: obj.userData.radius || 0 },
        ]
      };
    }

    case 'rect': {
      const start = obj.userData.start ? new THREE.Vector3(obj.userData.start.x, obj.userData.start.y, 0) : new THREE.Vector3();
      obj.localToWorld(start);
      const angleDeg = (obj.userData.angle || 0) * (180 / Math.PI);
      const area = (obj.userData.width || 0) * (obj.userData.height || 0);

      return {
        type: 'Rect',
        properties: [
          { label: "Start X", type: "number", value: start.x },
          { label: "Start Y", type: "number", value: start.y },
          { label: "Width", type: "number", value: obj.userData.width || 0 },
          { label: "Height", type: "number", value: obj.userData.height || 0 },
          { label: "Angle (°)", type: "number", value: angleDeg },
          { label: "Area", type: "number", value: area },
        ]
      };
    }

    default:
      return {
        type,
        properties: Object.entries(obj.userData).map(([key, value]) => ({
          label: key,
          type: typeof value === "number" ? "number" : "text",
          value: value
        }))
      };
  }
};


const PropertiesPanel = () => {
  const selectedObjectRef = useSelectedObjectRef();
const [selectedEntity, setSelectedEntity] = useState(null);

  const ref = useRef(null);
  const headerRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 285 });
  const startSize = useRef({ width: 0, height: 0 });

  const [collapsed, setCollapsed] = useState(false);
  const [infoHeight, setInfoHeight] = useState(400);
  const TOPBAR_HEIGHT = 85;
  const SNAP_THRESHOLD = 30;

  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);
  
  const { registerPanel, updatePanelPosition, panels } = usePanels();

  const toggle = () => setCollapsed(prev => !prev);
  const showSnapHighlight = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('snap-highlight');
    setTimeout(() => el.classList.remove('snap-highlight'), 300);
  };
  useEffect(() => {
    const obj = selectedObjectRef.current;
    if (obj) {
      setSelectedEntity(mapObjectToProperties(obj));
    }
 

  }, [selectedObjectIds]); // veya kendi trigger'ın 

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    registerPanel("PropertiesPanel", {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    const header = headerRef.current;
    if (!el || !header) return;
     const onMouseDown = (e) => {
      if (isResizing.current) return;
      isDragging.current = true;
      offset.current = {
        x: e.clientX - el.offsetLeft,
        y: e.clientY - el.offsetTop,
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      let x = e.clientX - offset.current.x;
      let y = e.clientY - offset.current.y;
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      if (x < SNAP_THRESHOLD) { x = 0; showSnapHighlight(); }
      if (x + w > ww - SNAP_THRESHOLD) { x = ww - w; showSnapHighlight(); }
      if (y < TOPBAR_HEIGHT + SNAP_THRESHOLD) { y = TOPBAR_HEIGHT; showSnapHighlight(); }

      Object.entries(panels).forEach(([key, p]) => {
        if (key === "PropertiesPanel") return;
        if (Math.abs(x - (p.left + p.width)) < SNAP_THRESHOLD && Math.abs(y - p.top) < p.height) {
          x = p.left + p.width;
          y = p.top;
          showSnapHighlight();
        }
        if (Math.abs(x + w - p.left) < SNAP_THRESHOLD && Math.abs(y - p.top) < p.height) {
          x = p.left - w;
          y = p.top;
          showSnapHighlight();
        }
        if (Math.abs(y - (p.top + p.height)) < SNAP_THRESHOLD && Math.abs(x - p.left) < p.width) {
          y = p.top + p.height;
          x = p.left;
          showSnapHighlight();
        }
        if (Math.abs(y + h - p.top) < SNAP_THRESHOLD && Math.abs(x - p.left) < p.width) {
          y = p.top - h;
          x = p.left;
          showSnapHighlight();
        }
      });

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      updatePanelPosition("PropertiesPanel", { top: y, left: x });
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    header.addEventListener('mousedown', onMouseDown);
    return () => header.removeEventListener('mousedown', onMouseDown);
  }, [panels,selectedObjectIds]);

  const handleResizeMouseDown = (e) => {
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    const rect = ref.current.getBoundingClientRect();
    startSize.current = { width: rect.width, height: rect.height < infoHeight ? rect.height : infoHeight };
    document.addEventListener('mousemove', handleResizing);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResizing = (e) => {
    if (!isResizing.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    const newWidth = startSize.current.width + dx;
    const newHeight = startSize.current.height + dy;

    if (newWidth > 200) ref.current.style.width = `${newWidth}px`;
    if (newHeight < infoHeight) ref.current.style.height = `${newHeight}px`;
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResizing);
    document.removeEventListener('mouseup', stopResizing);
  };

  const handleHeightChange = (h) => setInfoHeight(h);

  return (
    <div
      ref={ref}
      className={`PropertiesPanel ${collapsed ? 'collapsed' : ''}`}
      style={{ top: '140px', left: '1px', height: collapsed ? '40px' : '200px' }}
    >
      <div className="PropertiesPanel-header" ref={headerRef}>
        <span>{selectedEntity ? selectedEntity.type : "Özellikler"}</span>
        <span style={{ fontSize: '18px', cursor: 'pointer' }} onClick={toggle}>
          {collapsed ? '▼' : '▲'}
        </span>
      </div>
      <div className="PropertiesPanel-content">
        {selectedEntity && (
          <InfoTable data={selectedEntity.properties} onHeightChange={handleHeightChange} />
        )}
      </div>
      <div className="resize-handle" onMouseDown={handleResizeMouseDown} />
    </div>
  );
};

export default PropertiesPanel;