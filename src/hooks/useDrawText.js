// src/hooks/useDrawText.js
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';
import { resetOperation } from '../redux/operationSlice';



const useDrawText = (scene, camera, renderer, snapPoints) => {
  const [isInputActive, setInputActive] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [worldPosition, setWorldPosition] = useState(null);
  const [cancelled, setCancelled] = useState(false); // ⬅️ ESC ile iptal durumu
  const inputRef = useRef(null);
  const hoveredPointRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const lastInputClosedTime = useRef(0);
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

  function createTextSprite(text, font, fontSize, alignment, bold, italic, underline, color) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const size = parseInt(fontSize, 10);
    const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${font}`;
    context.font = fontStyle;
    context.fillStyle = color;
    context.textAlign = alignment;
    context.textBaseline = "middle";

    const metrics = context.measureText(text);
    canvas.width = metrics.width + 20;
    canvas.height = size + 20;

    const ctx = canvas.getContext("2d");
    ctx.font = fontStyle;
    ctx.fillStyle = color;
    ctx.textAlign = alignment;
    ctx.textBaseline = "middle";

    const x = alignment === "center" ? canvas.width / 2 :
              alignment === "right" ? canvas.width - 10 : 10;

    ctx.fillText(text, x, canvas.height / 2);

    if (underline) {
      const underlineY = canvas.height / 2 + size / 2.5;
      const textStartX = alignment === 'center' ? x - metrics.width / 2 :
                          alignment === 'right' ? x - metrics.width : x;
      ctx.beginPath();
      ctx.moveTo(textStartX, underlineY);
      ctx.lineTo(textStartX + metrics.width, underlineY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    const scaleFactor = size / 20;
    sprite.scale.set(canvas.width / scaleFactor, canvas.height / scaleFactor, 1);
    sprite.userData = {
      type: "text",
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
  }

  useEffect(() => {
    if (!scene || !camera || !renderer || !snapPoints) return;
    const handleClick = (e) => {
        const now = Date.now();
        if (now - lastInputClosedTime.current < 300) return; // 300ms içinde tekrar tetiklenirse yok say
      
        if (commandType !== 'drawSingleLineText' || isInputActive|| cancelled) return;
        if (!hoveredPointRef.current) return;
  
        const rect = renderer.domElement.getBoundingClientRect();
        setInputPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setWorldPosition(hoveredPointRef.current.clone());
        setInputActive(true);
        dispatch(resetOperation());  
        
      };
    const handleMouseMove = (e) => {
        if (cancelled) return;
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
    };



  
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (inputRef.current) inputRef.current.value = '';
          setInputActive(false);
          setCancelled(true); // ⬅️ Komut tamamen iptal edildi
        }
  
        if (e.key === 'Enter' && worldPosition && inputRef.current) {
          const text = inputRef.current.value.trim();
          if (!text) {
            setInputActive(false);
            return;
          }
  
          const sprite = createTextSprite(
            text,
            font,
            fontSize * 10,
            alignment,
            bold,
            italic,
            underline,
            color
          );
          sprite.position.copy(worldPosition);
  
          const width = sprite.scale.x;
          if (alignment === 'right') {
            sprite.position.x -= width / 2;
          } else if (alignment === 'left') {
            sprite.position.x += width / 2;
          }
  
          scene.add(sprite);
          inputRef.current.value = '';
          setInputActive(false);
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
  }, [scene, camera, renderer, isInputActive, worldPosition, commandType, snapPoints, cancelled]);

  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);
  useEffect(() => {
    if (commandType === 'drawSingleLineText') {
      setCancelled(false);
    }
  }, [commandType]);
  return (
    isInputActive && !cancelled && (
      <input
        ref={inputRef}
        type="text"
        style={{
          position: 'absolute',
          top: inputPosition.y,
          left: inputPosition.x,
          zIndex: 1000,
          fontSize: '16px',
          padding: '4px',
        }}
        placeholder="Enter text and press Enter"
        onBlur={() => {
          if (worldPosition && inputRef.current) {
            const text = inputRef.current.value.trim();
            lastInputClosedTime.current = Date.now();
            if (text) {
              const sprite = createTextSprite(
                text,
                font,
                fontSize * 10,
                alignment,
                bold,
                italic,
                underline,
                color
              );
              sprite.position.copy(worldPosition);
  
              const width = sprite.scale.x;
              if (alignment === 'right') {
                sprite.position.x -= width / 2;
              } else if (alignment === 'left') {
                sprite.position.x += width / 2;
              }
  
              scene.add(sprite);
            }
          }
  
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          setInputActive(false);
        }}
      />
    )
  );
  
};

export default useDrawText;
