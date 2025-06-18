// src/hooks/useDrawMtext.js
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';

 import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';
import { resetOperation } from '../redux/operationSlice';


const useDrawMtext = (scene, camera, renderer, snapPoints) => {
  const [step, setStep] = useState(0);
  const [startPoint, setStartPoint] = useState(null);
  const [inputRect, setInputRect] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputVisible, setInputVisible] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const hoveredPointRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const tempRectRef = useRef(null);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const {
    font,
    fontSize,
    alignment,
    bold,
    italic,
    underline,
    color = '#ffffff'
  } = useSelector(state => state.operation.textOptions);

  const commandType = useSelector(state => state.operation.commandType);

  const drawRectPreview = (start, end) => {
    if (tempRectRef.current) {
      scene.remove(tempRectRef.current);
      tempRectRef.current.geometry.dispose();
      tempRectRef.current.material.dispose();
    }
    const geometry = new THREE.BufferGeometry().setFromPoints([
      start,
      new THREE.Vector3(end.x, start.y, 0),
      end,
      new THREE.Vector3(start.x, end.y, 0),
      start
    ]);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const rect = new THREE.LineLoop(geometry, material);
    scene.add(rect);
    tempRectRef.current = rect;
  };

  const createMtextSprite = (text, width, height) => {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    const resolutionFactor = 4;
    canvas.width = width * dpr * resolutionFactor;
    canvas.height = height * dpr * resolutionFactor;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr * resolutionFactor, dpr * resolutionFactor);

    const size = parseInt(fontSize, 10);
    const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${font}`;
    ctx.font = fontStyle;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const lineHeight = size * 1.4;
    const padding = 8;
    const maxWidth = width - padding * 2;

    const lines = [];
    for (let paragraph of text.split('\n')) {
      const words = paragraph.split(/\s+/);
      let line = '';
      for (let word of words) {
        const testLine = line ? line + ' ' + word : word;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, lineHeight * lines.length + padding * 2);  

    ctx.fillStyle = color;
    lines.forEach((line, i) => {
      ctx.fillText(line, padding, padding + i * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true,  alphaTest: 0.05 });
    const sprite = new THREE.Sprite(material);
    const scaleFactor = size / 20;
    sprite.scale.set(
      canvas.width / (scaleFactor * dpr * resolutionFactor),
      canvas.height / (scaleFactor * dpr * resolutionFactor),
      1
    );
    sprite.center.set(0, 1);

    sprite.userData = {
      type: 'mtext',
      text,
      font,
      fontSize,
      alignment,
      bold,
      italic,
      underline,
      color,
      isSelectable: true
    };
    return sprite;
  };

  useEffect(() => {
    if (!scene || !camera || !renderer || !snapPoints || commandType !== 'drawMtext') return;

    const handleMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const worldPoint = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
      const { finalPoint, snapped, snapSource } = getSnappedPoint(mouse, worldPoint, snapPoints, camera, renderer);

      if (snapped && snapSource) {
        if (!snapMarkerRef.current) {
          const marker = createSnapMarker(8, snapSource);
          scene.add(marker);
          snapMarkerRef.current = marker;
        }
        snapMarkerRef.current.position.copy(snapSource.position);
        hoveredPointRef.current = snapSource.position.clone();
      } else {
        if (snapMarkerRef.current) {
          scene.remove(snapMarkerRef.current);
          snapMarkerRef.current.geometry.dispose();
          snapMarkerRef.current.material.dispose();
          snapMarkerRef.current = null;
        }
        hoveredPointRef.current = worldPoint.clone();
      }

      if (step === 1 && startPoint && hoveredPointRef.current) {
        drawRectPreview(startPoint, hoveredPointRef.current);
      }
    };

    const handleClick = (e) => {
      if (cancelled) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (step === 2 && inputVisible) {
        const isInsideInput =
          clickX >= inputRect.x &&
          clickX <= inputRect.x + inputRect.width &&
          clickY >= inputRect.y &&
          clickY <= inputRect.y + inputRect.height;

        if (!isInsideInput) {
          const sprite = createMtextSprite(inputValue.trim(), inputRect.width, inputRect.height);
          sprite.position.copy(inputRect.start);
          scene.add(sprite);
          setInputVisible(false);
          setStep(0);
          setInputValue('');
        }
        return;
      }

      if (!hoveredPointRef.current) return;
      const point = hoveredPointRef.current.clone();

      if (step === 0) {
        setStartPoint(point);
        setInputPosition({ x: clickX, y: clickY });
        setStep(1);
      } else if (step === 1) {
        const width = Math.abs(clickX - inputPosition.x);
        const height = Math.abs(clickY - inputPosition.y);
        const x = Math.min(clickX, inputPosition.x);
        const y = Math.min(clickY, inputPosition.y);

        setInputRect({
          x,
          y,
          width,
          height,
          position: point.clone(),
          start: startPoint.clone(),
          end: point.clone()
        });

        if (tempRectRef.current) {
          scene.remove(tempRectRef.current);
          tempRectRef.current.geometry.dispose();
          tempRectRef.current.material.dispose();
          tempRectRef.current = null;
        }

        setInputVisible(true);
        setStep(2);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCancelled(true);
        setInputVisible(false);
        setStep(0);
        setInputValue('');
        setStartPoint(null);
        setInputRect(null);
        dispatch(resetOperation());  
        if (tempRectRef.current) {
          scene.remove(tempRectRef.current);
          tempRectRef.current.geometry.dispose();
          tempRectRef.current.material.dispose();
          tempRectRef.current = null;
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }
    };
  }, [scene, camera, renderer, step, commandType, inputValue, inputVisible, cancelled]);
  useEffect(() => {
    if (commandType === 'drawMtext') {
      setCancelled(false);
    }
  }, [commandType]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    inputVisible && (
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{
          position: 'absolute',
          top: inputRect?.y,
          left: inputRect?.x,
          width: inputRect?.width,
          height: inputRect?.height,
          zIndex: 1000,
          fontSize: `${fontSize}px`,
          fontFamily: font,
          fontWeight: bold ? 'bold' : 'normal',
          fontStyle: italic ? 'italic' : 'normal',
          padding: '4px',
          lineHeight: `${parseInt(fontSize) * 1.4}px`,
          color: color,
          resize: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid #888'
        }}
      />
    )
  );
};

export default useDrawMtext;