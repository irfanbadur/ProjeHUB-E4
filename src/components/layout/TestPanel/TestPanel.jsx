import React, { useRef, useState, useEffect } from 'react';
import './TestPanel.css';
import { usePanels } from '../../../context/PanelsContext';
import InfoTable from '../../shared/InfoTable';

const data = [
  { label: "Center X", type: "text", value: "10247.0656" },
  { label: "Center Y", type: "text", value: "5279.091" },
  { label: "Center Y", type: "text", value: "5279.091" },
  { label: "Height", type: "text", value: "5943.7047" },
  { label: "Width", type: "text", value: "10811.3452" },
  { label: "Mode", type: "select", value: "Top", options: ["Top", "Bottom"] },
  { label: "Apply", type: "button", value: "Update", onClick: () => alert("Updated!") },
];
const TestPanel = () => {
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

  const { registerPanel, updatePanelPosition, panels } = usePanels();

  const toggle = () => setCollapsed(prev => !prev);

  const showSnapHighlight = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('snap-highlight');
    setTimeout(() => el.classList.remove('snap-highlight'), 300);
  };

  // Register panel on mount
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    registerPanel("TestPanel", {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    const header = headerRef.current;

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

      // Snap to window
      if (x < SNAP_THRESHOLD) {
        x = 0;
        showSnapHighlight();
      }
      if (x + w > ww - SNAP_THRESHOLD) {
        x = ww - w;
        showSnapHighlight();
      }
      if (y < TOPBAR_HEIGHT + SNAP_THRESHOLD) {
        y = TOPBAR_HEIGHT;
        showSnapHighlight();
      }

      // Snap to other panels
      Object.entries(panels).forEach(([key, p]) => {
        if (key === "TestPanel") return;

        if (Math.abs(x - (p.left + p.width)) < SNAP_THRESHOLD &&
            Math.abs(y - p.top) < p.height) {
          x = p.left + p.width;
          y = p.top;
          showSnapHighlight();
        }

        if (Math.abs(x + w - p.left) < SNAP_THRESHOLD &&
            Math.abs(y - p.top) < p.height) {
          x = p.left - w;
          y = p.top;
          showSnapHighlight();
        }

        if (Math.abs(y - (p.top + p.height)) < SNAP_THRESHOLD &&
            Math.abs(x - p.left) < p.width) {
          y = p.top + p.height;
          x = p.left;
          showSnapHighlight();
        }

        if (Math.abs(y + h - p.top) < SNAP_THRESHOLD &&
            Math.abs(x - p.left) < p.width) {
          y = p.top - h;
          x = p.left;
          showSnapHighlight();
        }
      });

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      updatePanelPosition("TestPanel", { top: y, left: x });
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    header.addEventListener('mousedown', onMouseDown);
    return () => header.removeEventListener('mousedown', onMouseDown);
  }, [panels]);

  const handleResizeMouseDown = (e) => {
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    const rect = ref.current.getBoundingClientRect();
    startSize.current = { width: rect.width, height: rect.height<infoHeight?rect.height:infoHeight };
    document.addEventListener('mousemove', handleResizing);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResizing = (e) => {
    if (!isResizing.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    const newWidth = startSize.current.width + dx;
    const newHeight = startSize.current.height + dy;
    console.log("newHeight   : ",newHeight ,"     infoHeight:",infoHeight)

    if (newWidth > 200) ref.current.style.width = `${newWidth}px`;
    if (newHeight < infoHeight) ref.current.style.height = `${newHeight}px`;
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResizing);
    document.removeEventListener('mouseup', stopResizing);
  };
const handleHeightChange=(newData)=>{
  setInfoHeight(newData);
}
  return (
    <div
      ref={ref}
      className={`TestPanel ${collapsed ? 'collapsed' : ''}`}
      style={{
        position: 'absolute',
        top: '340px',
        left: '1px',
        height: collapsed ? '40px' : '200px',
       
      }}
    >
      <div className="TestPanel-header" ref={headerRef}>
        <span onClick={toggle}>TestPanel</span>
        <span style={{ fontSize: '18px', cursor: 'pointer' }} onClick={toggle}>
          {collapsed ? '▼' : '▲'}
        </span>
      </div>
      <div className="TestPanel-content">
      <InfoTable data={data}  onHeightChange={handleHeightChange}/>
      </div>
      <div className="resize-handle" onMouseDown={handleResizeMouseDown} />
    </div>
  );
};

export default TestPanel;
