import { useEffect, useRef,useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  setOperationStep,
  setOperationData,
  resetOperation,
  setCommandMessage,
} from '../../redux/operationSlice';
import { createSnapMarker } from '../../utils/createSnapMarker';
import { useInputText } from '../../utils/useInputText';
import { generateUniqueId } from '../../utils/generateUniqueId';
import { getSnappedPoint } from '../../utils/getSnappedPoint';
import { createMachineSymbol } from '../../symbolDrawings/createMachines';
 
 
const useElectricalWiring = (scene, camera, renderer,snapPoints, options = {}) => {
  const {
    enabled = () => true,
    onWireEnd = () => {},
    onWireStart = () => {},
    onPreviewUpdate = () => {},
  }  = options;

  const verticesRef = useRef([]);
  const tempLineRef = useRef(null);
  const finalPointRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const previewSymbolRef = useRef(null);
  const startRef = useRef(false);
  const snapSourceRef = useRef(null);

  const lastMouse = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const previewEndPointRef= useRef({ x: 0, y: 0 });
  const [step, setStep] = useState(0); // 0: ilk nokta, 1+: devam

  const inputText = useInputText(scene, camera);
  const dispatch = useDispatch();

  const { commandType } = useSelector((state) => state.operation);
  const gridSnap = useSelector((state) => state.mods.gridSnap);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const operationData = useSelector((state) => state.operation.data);

  const snapMode = useSelector((state) => state.mods.snapMode);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // Ortho modu Redux'tan

  const gridSize = 10;
  const snapState = {
    x: 0, // 0: İlk adım, 1: Tam hizalama, 2: Üçüncü adım (5 birim kayma)
    y: 0, // Aynı şekilde Y için de
  };
  const applyGridSnap = (point) => {
    return new THREE.Vector3(
      Math.round(point.x / gridSize) * gridSize,
      Math.round(point.y / gridSize) * gridSize,
      0
    );
  };
// Yardımcı fonksiyon: Ortho hizalama
const getOrthoSnappedPoint = (startPoint, currentPoint) => {
  const dx = Math.abs(currentPoint.x - startPoint.x);
  const dy = Math.abs(currentPoint.y - startPoint.y);
  if (dx > dy) {
    return new THREE.Vector3(currentPoint.x, startPoint.y, 0);
  } else {
    return new THREE.Vector3(startPoint.x, currentPoint.y, 0);
  }
};

 useEffect(() => { 
      if (
     step === 0 &&
     operationData?.initialPoint &&
     operationData?.source &&
     enabled()
   ) {
     const point = new THREE.Vector3(
       operationData.initialPoint.x,
       operationData.initialPoint.y,
       0
     );
 
     // Snap source sahte olarak oluşturuluyor (panel snap'ine benzetilmiş)
     const snapSource = {
       type: 'panelConnection',
       position: point.clone(),
       p: {
         type: operationData.source.type,
         no: operationData.source.no,
         outNo: operationData.source.outNo,
         UUID: operationData.source.UUID,
         OutID:operationData.source.OutID,
         panelID:operationData.source.panelID
        
       },
       userData: {
         type: 'panelConnection',
         sourceObject: scene.children.find(obj => obj.userData?.id === operationData.source.panelID),
       },
     };
 
     // Snap işaretçisi oluşturuluyorsa sahneye ekle
     const marker = createSnapMarker(8, snapSource);
     marker.position.copy(point);
     scene.add(marker);
     snapMarkerRef.current = marker;
 
     // Snap etkisi taklit ediliyor
     verticesRef.current.push(point);
     startRef.current = true;
     snapSourceRef.current = snapSource;
 
     dispatch(setCommandMessage("Sonraki noktaları seçin. Bitirmek için Enter/Space, iptal için ESC."));
     setStep(1);
   }
 }, [operationData, step, enabled]);
  useEffect(() => {
if (!enabled() || !scene || !camera || !renderer) return;

    const domElement = renderer.domElement;
    dispatch(setCommandMessage("İlk noktayı seçin"));

    const handleClick = (event) => {
      if (!enabled()) return;
      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastMouse.current = { x, y };
    
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
    
      //const dynamicSnapPoints = step === 0 ? snapPoints : snapPoints.filter(p => p.type !== 'panelConnection');
      let dynamicSnapPoints = [...snapPoints]; // Başlangıç snap noktaları
      if (step === 0) {
        scene.traverse(obj => {
          if (obj.userData?.connectionPoints) {
            obj.userData.connectionPoints.forEach(p => {
              if (p.type === 'panelCon_out') {
              const worldPos = p.position.clone().applyMatrix4(obj.matrixWorld);
        
              dynamicSnapPoints.push({no:obj.uuid,position:worldPos,type:"panelConnection"});
            }
            });
          }
        });
      }
      

      let { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC,worldPoint,dynamicSnapPoints,camera,renderer, {snapMode:snapMode });

     // let finalPoint = snapPoint;
      if (!snapped) {
        if (gridSnap) {
          finalPoint = applyGridSnap(worldPoint);
        } else {
          finalPoint = worldPoint;
        }
      }
    
      // Ortho modu aktifse ve önceki bir vertex varsa, yeni noktayı hizala
      if (orthoMode && verticesRef.current.length > 0) {
        const lastVertex = verticesRef.current[verticesRef.current.length - 1];
        finalPoint = getOrthoSnappedPoint(lastVertex, finalPoint);
      }
    
      // Snap marker'ı temizle ve yenisini oluştur
      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }
    
      if (snapped && snapSource) {
        const marker = createSnapMarker(8, snapSource);
        marker.position.copy(finalPoint);
        scene.add(marker);
        snapMarkerRef.current = marker;
      }
    
      // Noktayı ekle
      verticesRef.current.push(finalPoint);
      if (verticesRef.current.length === 1 && onWireStart) {
        onWireStart(finalPoint);
      }
      // İki veya daha fazla nokta varsa geçici çizgiyi oluştur
      if (verticesRef.current.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
        }
    
        tempLineRef.current = new THREE.Line(geometry, material);
        scene.add(tempLineRef.current);
      }
      finalPointRef.current=finalPoint
      dispatch(setCommandMessage("Sonraki noktaları seçin. Bitirmek için Enter/Space, iptal için ESC."));
    };
    
    

    
    const handleMouseMove = (event) => {
      if (!enabled()) return;
      if (!startRef.current) return; // Escape sonrası mouseMove'u engelle

      const rect = domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastMouse.current = { x, y };
      const mouseNDC = new THREE.Vector2(x, y);
      const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
      let dynamicSnapPoints = [...snapPoints]; // dışarıdan gelen snapPoints (örneğin line endpointleri)

      if (step === 0) {
        scene.traverse(obj => {
          if (obj.userData?.connectionPoints) {
            obj.userData.connectionPoints.forEach(p => {
              if (p.type === 'panelCon_out') {
              const worldPos = p.position.clone().applyMatrix4(obj.matrixWorld);
        
              dynamicSnapPoints.push({no:obj.uuid,position:worldPos,type:"panelConnection"});
            }
            });
          }
        });
      }
      
     //  const dynamicSnapPoints =snapPoints 
      const { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC,worldPoint, dynamicSnapPoints,camera,renderer,{snapMode:snapMode });
      if (snapped && snapSource?.userData?.type === 'panelConnection') {
        const targetPanel = snapSource.userData.sourceObject;
        console.log("Bağlanılan panel:", targetPanel.userData.id);
      }
      // Snap marker'ı temizle ve yenisini oluştur
      if (snapMarkerRef.current) {
        scene.remove(snapMarkerRef.current);
        snapMarkerRef.current.geometry.dispose();
        snapMarkerRef.current.material.dispose();
        snapMarkerRef.current = null;
      }
    
      if (snapped && snapSource) {
        const marker = createSnapMarker(8, snapSource);
        marker.position.copy(snapSource.position);
        scene.add(marker);
        snapMarkerRef.current = marker;
      }
    
      // Önizleme noktasını belirle
      let previewPoint = finalPoint;
      if (orthoMode && verticesRef.current.length > 0) {
        const lastVertex = verticesRef.current[verticesRef.current.length - 1];
        previewPoint = getOrthoSnappedPoint(lastVertex, finalPoint);
      }
    
      // Eğer en az bir vertex varsa geçici çizgiyi güncelle
      if (verticesRef.current.length > 0) {
        const previewPoints = [...verticesRef.current, previewPoint];
        const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    
        if (tempLineRef.current) {
          scene.remove(tempLineRef.current);
          tempLineRef.current.geometry.dispose();
          tempLineRef.current.material.dispose();
        }
    
        tempLineRef.current = new THREE.Line(geometry, material);
        scene.add(tempLineRef.current);
        previewEndPointRef.current=previewPoint

      }
      // 🔁 Çamaşır makinesi ön izlemesini göster
if (previewSymbolRef.current) {
  scene.remove(previewSymbolRef.current);
  previewSymbolRef.current.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });
  previewSymbolRef.current = null;
}

if (verticesRef.current.length > 0 && previewPoint) {
  // Son nokta ile yön vektörü hesapla
  const lastPoint = verticesRef.current[verticesRef.current.length - 1];
  const directionVector = new THREE.Vector3().subVectors(previewPoint, lastPoint).normalize();

  // Açıyı hesapla (polyline yönüne göre)
  const angle = Math.atan2(directionVector.y, directionVector.x);

  // Oluştur
  const symbolPreview = createMachineSymbol(
    null, // sahneye hemen eklemeyeceğiz
    previewPoint,
    1,                  // dir (her zaman sağ varsayalım, istersen hesaplayabiliriz)
    0,                  // symmetrical offset (şimdilik gerek yok)
    true                // isPreview
  );

  symbolPreview.children[0].rotation.z = angle; // offsetGroup'u döndür
  scene.add(symbolPreview);
  previewSymbolRef.current = symbolPreview;
}

    };

    
 
 const handleKeyDown = (e) => {

  if (!enabled()) return;
  const movementOffset = 5; // Ofset miktarı (5 birim)

  if (snapMarkerRef.current) {
    const snapPos = snapMarkerRef.current.position;
    // Önceki pozisyonu saklayalım
    const previousPos = verticesRef.current[verticesRef.current.length - 1];
    let newPos = new THREE.Vector3(previousPos.x, previousPos.y, 0); // Başlangıç noktasını alıyoruz

    // Snap'ın sağda olup olmadığını kontrol et
    const isSnapRight = (snapPos.x >= previousPos.x)
    const isSnapLeft = (snapPos.x <= previousPos.x)
    const isSnapUp = (snapPos.y >= previousPos.y)
    const isSnapDown = (snapPos.y <= previousPos.y)
    // Aşağıda, yukarıda, solda ve sağda aktif olacak tuşları kontrol et
    if (e.key === 'a' && isSnapLeft) { // Sola hareket
      snapState.y = 0;
      if (!snapState.x) {
        newPos.x = snapPos.x + movementOffset;
        snapState.x = 1;
      } else if (snapState.x === 1) {
        newPos.x = snapPos.x;
        snapState.x = 2;
      } else if (snapState.x === 2) {
        newPos.x = snapPos.x - movementOffset;
        snapState.x = 0;
      }
    } else if (e.key === 'd' && isSnapRight) { // Sağa hareket
      snapState.y = 0;
      if (!snapState.x) {
        newPos.x = snapPos.x - movementOffset;
        snapState.x = 1;
      } else if (snapState.x === 1) {
        newPos.x = snapPos.x;
        snapState.x = 2;
      } else if (snapState.x === 2) {
        console.log("SNAP STATE 2 D TUŞU")
        newPos.x = snapPos.x + movementOffset;
        snapState.x = 0;
      }
    } else if (e.key === 'w' && isSnapUp) { // Yukarı hareket
      snapState.x = 0;
      if (!snapState.y) {
        newPos.y = snapPos.y - movementOffset;
        snapState.y = 1;
      } else if (snapState.y === 1) {
        newPos.y = snapPos.y;
        snapState.y = 2;
      } else if (snapState.y === 2) {
        newPos.y = snapPos.y + movementOffset;
        snapState.y = 0;
      }
    } else if (e.key === 's' && isSnapDown) { // Aşağı hareket
      snapState.x = 0;
      if (!snapState.y) {
        newPos.y = snapPos.y + movementOffset;
        snapState.y = 1;
      } else if (snapState.y === 1) {
        newPos.y = snapPos.y;
        snapState.y = 2;
      } else if (snapState.y === 2) {
        newPos.y = snapPos.y - movementOffset;
        snapState.y = 0;
      }
    }

    // Yeni pozisyonu ekleyelim ve geçici çizgiyi güncelleyelim
    if (newPos !== previousPos) {
      verticesRef.current.push(newPos);
      if (tempLineRef.current) {
        scene.remove(tempLineRef.current);
        tempLineRef.current.geometry.dispose();
        tempLineRef.current.material.dispose();
      }

      const previewPoints = [...verticesRef.current];
      const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
      const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
      tempLineRef.current = new THREE.Line(geometry, material);
      scene.add(tempLineRef.current);
    }
  }

  if (e.key === 'q') {
    // Mouse pozisyonunu world koordinatlarına dönüştür
     
    // Çizgiye ilk 5 birimi ekle
    const previousPos = verticesRef.current[verticesRef.current.length - 1];
    
    const direction = new THREE.Vector3(
      previewEndPointRef.current.x - previousPos.x,
      previewEndPointRef.current.y - previousPos.y,
      0
    ).normalize(); // Yönü normalize et

    // Yeni pozisyonu bu yöne göre hesapla
    let newPos = new THREE.Vector3(
      previousPos.x + direction.x * movementOffset,
      previousPos.y + direction.y * movementOffset,
      0
    );

    // Yeni pozisyonu ekleyelim ve geçici çizgiyi güncelleyelim
    verticesRef.current.push(newPos);
    if (tempLineRef.current) {
      scene.remove(tempLineRef.current);
      tempLineRef.current.geometry.dispose();
      tempLineRef.current.material.dispose();
    }

    const previewPoints = [...verticesRef.current];
    const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    tempLineRef.current = new THREE.Line(geometry, material);
    scene.add(tempLineRef.current);

    console.log("Çizgi ön izlemesi, mouse yönünde hareket etti: ", newPos);
  }

  if (e.key === 'Escape') {
    // Temp çizgi temizle
    if (tempLineRef.current) {
      scene.remove(tempLineRef.current);
      tempLineRef.current.geometry.dispose();
      tempLineRef.current.material.dispose();
      tempLineRef.current = null;
    }
  
    // Ön izleme sembolünü temizle
    if (previewSymbolRef.current) {
      scene.remove(previewSymbolRef.current);
      previewSymbolRef.current.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      previewSymbolRef.current = null;
    }
  
    // Snap işaretçisini temizle
    if (snapMarkerRef.current) {
      scene.remove(snapMarkerRef.current);
      snapMarkerRef.current.geometry.dispose();
      snapMarkerRef.current.material.dispose();
      snapMarkerRef.current = null;
    }
  
    // Tüm referansları sıfırla
    verticesRef.current = [];
    finalPointRef.current = null;
    previewEndPointRef.current = null;
    snapSourceRef.current = null;
    startRef.current = false;
    setStep(0); // ⬅️ bu adım en önemli kısım
  
    dispatch(resetOperation());
    dispatch(setCommandMessage(""));
  }
  
   else if (e.key === 'Enter' || e.key === ' ') {
    // Eğer çizim başladıysa ve 1'den fazla nokta varsa
    if (verticesRef.current.length > 0 && previewEndPointRef.current) {
      // 👇 Son noktayı önizlemeden al ve ekle
      verticesRef.current.push(previewEndPointRef.current.clone());
    }
  
    if (verticesRef.current.length > 1) {
      onWireEnd(verticesRef.current, previewEndPointRef.current.clone());
    }
  
    // Temizlik
    if (tempLineRef.current) {
      scene.remove(tempLineRef.current);
      tempLineRef.current.geometry.dispose();
      tempLineRef.current.material.dispose();
      tempLineRef.current = null;
    }
  
    if (previewSymbolRef.current) {
      scene.remove(previewSymbolRef.current);
      previewSymbolRef.current.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      previewSymbolRef.current = null;
    }
  
    verticesRef.current = [];
    dispatch(resetOperation());
    dispatch(setCommandMessage(""));
  }
  
};

 

    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      domElement.removeEventListener('click', handleClick);
      domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [commandType, scene, camera, renderer, gridSnap, objectSnap, snapPoints, dispatch]);

};

export default useElectricalWiring;
