import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

export function useInputText(scene, camera) {
  const meshRef = { current: null };
  const backgroundRef = { current: null };
  const lastValue = { current: '' };
  const fontLoader = new FontLoader();
  let loadedFont = null;

  fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
    loadedFont = font;
  });

  const update = (value, screenCoord, options = {}) => {
    if (!scene || !camera || !loadedFont || !screenCoord) return;
    if (options.disabled) return;

  // Eğer input değeri varsa ama kullanıcı girişi değilse (örneğin tıklama sonucu gelen sabit değer), gösterme:
  if (!options.force && !value) return;

    const mouse = new THREE.Vector3(screenCoord.x, screenCoord.y, 0).unproject(camera);
    const displayValue = value || `${mouse.x.toFixed(2)} , ${mouse.y.toFixed(2)}`;

    const shouldRebuild =
      displayValue !== lastValue.current ||
      !meshRef.current ||
      options.forceRebuild;

    if (!shouldRebuild) {
      meshRef.current.position.set(mouse.x + 10, mouse.y + 10, 0);
      if (backgroundRef.current) {
        const box = new THREE.Box3().setFromObject(meshRef.current);
        const size = new THREE.Vector3();
        box.getSize(size);
        backgroundRef.current.position.set(mouse.x + size.x / 2 + 10, mouse.y + size.y / 2 + 10, -0.1);
      }
      return;
    }

    lastValue.current = displayValue;

    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
      meshRef.current = null;
    }

    if (backgroundRef.current) {
      scene.remove(backgroundRef.current);
      backgroundRef.current.geometry.dispose();
      backgroundRef.current.material.dispose();
      backgroundRef.current = null;
    }

    const textGeo = new TextGeometry(displayValue, {
      font: loadedFont,
      size: 10,
      height: 1,
    });

    const material = new THREE.MeshBasicMaterial({ color: options.color || 0xffff00 });
    const textMesh = new THREE.Mesh(textGeo, material);
    textMesh.userData.ignoreRaycast = true
    textMesh.position.set(mouse.x + 10, mouse.y + 10, 0);

    const box = new THREE.Box3().setFromObject(textMesh);
    const size = new THREE.Vector3();
    box.getSize(size);

    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: options.backgroundColor || 0x000000,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      })
    );
    background.scale.set(size.x + 10, size.y + 10, 1);
    background.userData.ignoreRaycast = true

    background.position.set(mouse.x + size.x / 2 + 10, mouse.y + size.y / 2 + 10, -0.1);

    scene.add(background);
    scene.add(textMesh);

    meshRef.current = textMesh;
    backgroundRef.current = background;
  };

  const clear = () => {
    lastValue.current = '';
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
      meshRef.current = null;
    }
    if (backgroundRef.current) {
      scene.remove(backgroundRef.current);
      backgroundRef.current.geometry.dispose();
      backgroundRef.current.material.dispose();
      backgroundRef.current = null;
    }
  };

  return { update, clear };
}
