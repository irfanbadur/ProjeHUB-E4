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
import { getSnappedPoint,getSnappedPointForPanel } from '../../utils/getSnappedPoint';
import { createSingleSocket } from '../../symbolDrawings/createSocketSymbols';
import { singleCircleBuat } from '../../symbolDrawings/createSocketSymbols';
import { singleSquareBuat } from '../../symbolDrawings/createSocketSymbols';
import { getPerpendicularIntersection } from '../../utils/getPrependicularIntersection';
import { createOffsetLine } from '../../utils/wiring/createOffsetLine';

const useSocketWiring = (scene, camera, renderer,snapPoints, options = {}) => {
  const {
    enabled = () => true,
    onWireEnd = () => {},
    onWireStart = () => {},
    onPreviewUpdate = () => {},
  }  = options;

  const startRef = useRef(false);
  const verticesRef = useRef([]);
  const tempLineRef = useRef(null);
  const finalPointRef = useRef(null);
  const snapMarkerRef = useRef(null);
  const snapSourceRef = useRef(null);
  const previewSymbolRef = useRef(null);
  const previewMarkersRef = useRef([]); // [{ startIdx, line }]
  const offsetLineRef = useRef(null); // SnapWall kopya çizgisi
  const intersectedLineRef = useRef(null); // Mavi olacak çizgi

  const lastMouse = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const previewEndPointRef= useRef({ x: 0, y: 0 });
  const [step, setStep] = useState(0); // 0: ilk nokta, 1+: devam
  
  const socketCountRef = useRef(0);
  const socketTypes = ['normal', 'kapaklı', 'etanj'];
  const socketTypeIndex = useRef(0);
  const socketTypeRef = useRef('normal');
  const socketsRef=useRef([])
  const previewSocketsRef = useRef([]);
  const snapWall = true;

  const wireColor=0x0045ff
  const inputText = useInputText(scene, camera);
  const dispatch = useDispatch();
   const wireCounterRef = useRef(1); // 1'den başlasın

  const { commandType } = useSelector((state) => state.operation);
  const gridSnap = useSelector((state) => state.mods.gridSnap);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const operationData = useSelector((state) => state.operation.data);

  const snapMode = useSelector((state) => state.mods.snapMode);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // Ortho modu Redux'tan
  const flipDirectionRef = useRef(1);
  const [flipDir, setFlipDir] = useState(1);
  
  const setFlipDirection = (valOrUpdater) => {

    const newValue = typeof valOrUpdater === 'function' ? valOrUpdater(flipDirectionRef.current) : valOrUpdater;
    flipDirectionRef.current = newValue;
    setFlipDir(newValue);
  };
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
      let panel
      let forWhere="panel"
      if (step === 0) {
        forWhere="panel"
        scene.traverse(obj => {
          if (obj.userData?.connectionPoints) {
            obj.userData.connectionPoints.forEach(p => {
              if (p.type === 'panelCon_out') {             
              const worldPos = p.position.clone().applyMatrix4(obj.matrixWorld);
                dynamicSnapPoints.push({
                no:obj.uuid,
                position:worldPos,
                type:"panelConnection",
                connection: p
              });
              panel=p 
            }
            });
          }
        });
      }else{
        forWhere="draw"
      }
      
 
      let { finalPoint, snapped, snapSource } = getSnappedPointForPanel(mouseNDC,worldPoint,dynamicSnapPoints,camera,renderer, {snapMode:snapMode, forWhere:forWhere });
      // let finalPoint = snapPoint;
     if( snapSource ){
      startRef.current=true      
     
      snapSourceRef.current=snapSource
     } 
     if (snapped && snapSource?.p) {
      const con = snapSource.p;
      console.log("Bağlanılan connectionPoint bilgisi:", con.no, con.outNo, con.type);
    }
    
     if(!startRef.current){return}

      if (!snapped) {
        if (gridSnap) {
          finalPoint = applyGridSnap(worldPoint);
        } else {
          finalPoint = worldPoint;
        }
      }
          if (snapWall && offsetLineRef.current && verticesRef.current.length > 0) {
            const targetLine = offsetLineRef.current;
            const positions = targetLine.geometry.attributes.position.array;
            const start = new THREE.Vector3(positions[0], positions[1], positions[2]);
            const end = new THREE.Vector3(positions[3], positions[4], positions[5]);
            const lastVertex = verticesRef.current[verticesRef.current.length - 1];
            finalPoint = getPerpendicularIntersection(lastVertex, { start, end });
          } else if (!snapped) {
            finalPoint = gridSnap ? applyGridSnap(worldPoint) : worldPoint;
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
        
              dynamicSnapPoints.push({no:obj.uuid,position:worldPos,type:"panelConnection" });
            }
            });
          }
        });
      }
      if (step === 0 && verticesRef.current.length === 1) {
        const position = verticesRef.current[0].clone();
        const wireNumber = wireCounterRef.current ; // örnek numara üretimi
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
        //---------------Kablo Sayısı Gösteren  Çizgiler  ----------------
        // 150 birimden büyükse segment ortasına dik ön izleme çizgisi (sadece bir tane)
// 150 birimden büyükse segment ortasına dik ön izleme çizgisi (sadece bir tane)
// 🔄 Segment uzunluğu kontrolü (150 birimden büyükse marker ekle)
// ✅ Mevcut tüm marker'ları geçici olarak gizle (yeniden kullanılabilir)
previewMarkersRef.current.forEach(marker => {
  if (marker.lines && Array.isArray(marker.lines)) {
    marker.lines.forEach(line => {
      if (line) line.visible = false;
    });
  }
});
const rotateVector = (vector, angleRad) => {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return new THREE.Vector3(
    vector.x * cos - vector.y * sin,
    vector.x * sin + vector.y * cos,
    0
  );
};


// ✅ Tüm segmentleri kontrol et
for (let i = 0; i < verticesRef.current.length - 1; i++) {
  const p1 = verticesRef.current[i];
  const p2 = verticesRef.current[i + 1];
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();

  if (length < 150) continue;

  const normal = dir.clone().normalize();
  const angleRad = THREE.MathUtils.degToRad(45); // 30 derece açı

  const angledDir = rotateVector(normal, angleRad); // eğimli yön
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

  let existing = previewMarkersRef.current.find(m => m.startIdx === i);
  const forwardOffset = normal.clone().setLength(3); // çizgi yönünde 4 birim ileri/geri
  const halfLength = 2.5;

  const positions = [
    mid.clone().sub(forwardOffset),
    mid.clone(),
    mid.clone().add(forwardOffset),
  ];

  if (!existing) {
    const markers = [];

    positions.forEach((centerPoint) => {
      const start = centerPoint.clone().add(angledDir.clone().multiplyScalar(-halfLength));
      const end = centerPoint.clone().add(angledDir.clone().multiplyScalar(halfLength));

      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geo, mat);
      line.userData.role = 'wireMarker';
      scene.add(line);
      markers.push(line);
    });

    previewMarkersRef.current.push({ startIdx: i, lines: markers });

  } else {
    positions.forEach((centerPoint, j) => {
      const marker = existing.lines[j];
      const start = centerPoint.clone().add(angledDir.clone().multiplyScalar(-halfLength));
      const end = centerPoint.clone().add(angledDir.clone().multiplyScalar(halfLength));
      marker.geometry.setFromPoints([start, end]);
      marker.visible = true;
    });
  }
}





//---------------------------------------------------------

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
  const symbolPreview = createSingleSocket(
    null, // sahneye hemen eklemeyeceğiz
    previewPoint,
    flipDirectionRef.current,   // dir (her zaman sağ varsayalım   )
    wireColor,                  // symmetrical offset (şimdilik gerek yok)
    true ,// isPreview
    socketTypeRef.current   ,
    null   ,
    0        
  );

  symbolPreview.children[0].rotation.z = angle; // offsetGroup'u döndür
  scene.add(symbolPreview);
  previewSymbolRef.current = symbolPreview;
}
      if (snapWall) {
        const raycaster = new THREE.Raycaster();
        raycaster.params.Line.threshold = 5;
        raycaster.setFromCamera(mouseNDC, camera);
      
        // 🔹 Hem Line hem Polyline tipi nesneleri al
        const lines = [];
        scene.traverse(obj => {
          if (
            obj.type === 'Line' &&
            (obj.userData?.type === 'line' || obj.userData?.type === 'polyline')
          ) {
            lines.push(obj);
          }
        });
        
      
        const intersects = raycaster.intersectObjects(lines);
      
        // 🔹 Önceki intersected çizgiyi temizle
   /*      if (intersectedLineRef.current) {
        //  intersectedLineRef.current.material.color.set(0xffffff);    
        intersectedLineRef.current = null;
        } */
      
        if (
          intersectedLineRef.current &&
          intersectedLineRef.current.userData?.isIntersectPreview
        ) {
          scene.remove(intersectedLineRef.current);
          intersectedLineRef.current.geometry.dispose();
          intersectedLineRef.current.material.dispose();
          intersectedLineRef.current = null;
        }
        
        if (offsetLineRef.current) {
          scene.remove(offsetLineRef.current);
          offsetLineRef.current.geometry.dispose();
          offsetLineRef.current.material.dispose();
          offsetLineRef.current = null;
        }
      
        if (intersects.length > 0) {
          const intersected = intersects[0].object;
          const geometry = intersected.geometry;
          const isPolyline = intersected.userData?.type === 'polyline';
      
          let targetSegment = null;
      
          if (isPolyline) {
            // polyline üzerindeki en yakın kenarı bul
            const vertices = geometry.attributes.position.array;
            let minDist = Infinity;
      
            for (let i = 0; i < vertices.length - 3; i += 3) {
              const start = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
              const end = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      
              const closest = getPerpendicularIntersection(worldPoint, { start, end });
              const dist = closest.distanceTo(worldPoint);
      
              if (dist < minDist) {
                minDist = dist;
                targetSegment = { start, end };
              }
            }
          } else {
            // normal line ise
            const pos = geometry.attributes.position.array;
            targetSegment = {
              start: new THREE.Vector3(pos[0], pos[1], pos[2]),
              end: new THREE.Vector3(pos[3], pos[4], pos[5]),
            };
          }
      
          if (targetSegment) {
            // 🔹 geçici intersectedLine gibi davranması için sahte nesne oluştur
            const tempGeometry = new THREE.BufferGeometry().setFromPoints([
              targetSegment.start,
              targetSegment.end,
            ]);
            const tempMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const tempLine = new THREE.Line(tempGeometry, tempMaterial);
            tempLine.userData.isIntersectPreview = true;

            scene.add(tempLine);
            intersectedLineRef.current = tempLine;
      
            if (verticesRef.current.length > 0) {
              const lastVertex = verticesRef.current[verticesRef.current.length - 1];
              const offsetLine = createOffsetLine(tempLine, lastVertex, 5);
              scene.add(offsetLine);
              offsetLineRef.current = offsetLine;
            }
          }
        }
        
      }

    };

    
 
 const handleKeyDown = (e) => {

  if (!enabled()) return;
  const movementOffset = 5; // Ofset miktarı (5 birim)

  if (snapMarkerRef.current) {
    const snapPos = snapMarkerRef.current.position;
    // Önceki pozisyonu saklayalım
    const previousPos = verticesRef.current[verticesRef.current.length - 1];
    if (!previousPos) return; 
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
  if (e.key === 't') {
    socketTypeIndex.current = (socketTypeIndex.current + 1) % socketTypes.length;
    socketTypeRef.current = socketTypes[socketTypeIndex.current];
    dispatch(setCommandMessage(`Priz tipi: ${socketTypeRef.current}`));
    return;
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
  if (e.key === 'e') {
    const previousPos = verticesRef.current[verticesRef.current.length - 1];
    if (!previousPos) return;
  
    // Mouse'un sahnedeki son konumunu hesapla
    const mouseNDC = new THREE.Vector2(lastMouse.current.x, lastMouse.current.y);
    const mouseWorld = new THREE.Vector3(lastMouse.current.x, lastMouse.current.y, 0).unproject(camera);
  
    // Mouse yönü ile son nokta arasındaki fark
    const deltaX = mouseWorld.x - previousPos.x;
    const deltaY = mouseWorld.y - previousPos.y;
  
    // 45 derece yönlerde ofset vektör
    const offsetLength = 7.07106781187; // toplam uzunluk
    const dx = offsetLength / Math.sqrt(2); // 3.5355
    const dy = dx;
  
    let offset = new THREE.Vector3();
  
    if (deltaX >= 0 && deltaY >= 0) {
      // Sağ üst (45°)
      offset.set(dx, dy, 0);
    } else if (deltaX < 0 && deltaY >= 0) {
      // Sol üst (135°)
      offset.set(-dx, dy, 0);
    } else if (deltaX < 0 && deltaY < 0) {
      // Sol alt (225°)
      offset.set(-dx, -dy, 0);
    } else {
      // Sağ alt (315°)
      offset.set(dx, -dy, 0);
    }
  
    const newPos = new THREE.Vector3().addVectors(previousPos, offset);
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
  const cancelWiring=()=>{
    if (tempLineRef.current) {
      scene.remove(tempLineRef.current);
      tempLineRef.current.geometry.dispose();
      tempLineRef.current.material.dispose();
      tempLineRef.current = null;
    }
    const toRemove = [];

    scene.traverse((child) => {
      if (child.userData?.type === 'socket' && child.userData?.isPreview) {
        toRemove.push(child);
      }
    });
    
    toRemove.forEach((child) => {
      // Alt nesneleri temizle
      if (child.traverse && typeof child.traverse === 'function') {
        child.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
      }
    
      scene.remove(child);
    });
    
      
      
      
    verticesRef.current = [];
    dispatch(resetOperation());
    dispatch(setCommandMessage(""));

   //---- Kablo sayısı gösteren Markerları temizleme
   previewMarkersRef.current.forEach(markerGroup => {
    markerGroup.lines.forEach(line => {
      scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
  });
  previewMarkersRef.current = [];
  socketsRef.current=[]
  startRef.current=false
  snapSourceRef.current=null
  }
  const addSoket=()=>{
    if (verticesRef.current.length > 1 && previewEndPointRef.current) { 
      verticesRef.current.push(previewEndPointRef.current.clone());
      const p1 = verticesRef.current.at(-2);
      const p2 = verticesRef.current.at(-1);
      const direction = new THREE.Vector3().subVectors(p2, p1);
      const angle = Math.atan2(direction.y, direction.x);
      socketsRef.current.push({position:p2.clone(),type:socketTypeRef.current,buat:null,direction:direction,power:300 })
      const socket = createSingleSocket(scene, 
        p2.clone(), 
        flipDirectionRef.current,
        wireColor, 
        true, 
        socketsRef.current,
        tempLineRef.current.uuid ,
        0); 
      socketsRef.current[socketsRef.current.length-1].uuid=socket.uuid
      socket.children[0].rotation.z = angle;
      socketCountRef.current++      
      scene.add(socket);   

    }
  }
  if (e.key === 'Escape') {
    cancelWiring();

  } 
  
  if (e.key === ' ') {
    addSoket()

  }
      if (e.key === 'Enter') {
        setStep(0)
        if (!socketsRef.current.length) {
          addSoket()         
        }

      if (previewEndPointRef.current && verticesRef.current.length > 0)
      if (verticesRef.current.length > 1) {    
        onWireEnd(verticesRef.current,socketsRef.current,snapSourceRef.current ,tempLineRef.current.uuid );
      }

      if (previewSymbolRef.current) {
        scene.remove(previewSymbolRef.current);
        previewSymbolRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        previewSymbolRef.current = null;
      }
      socketsRef.current = [];
      verticesRef.current = [];
      dispatch(resetOperation());
      dispatch(setCommandMessage(''));

      if(snapSourceRef.current?.type==="buatCircle"){
        const p1=snapSourceRef.current.position
        singleCircleBuat(scene,p1)
        const tolerance = 0.1;
 
        scene.traverse((obj) => {
          if (obj.userData?.type === 'buatCircle') {
            const socketUUID=obj.userData.socketUUID
            if (!socketUUID) return;      
            const socket = scene.getObjectByProperty('uuid', socketUUID);
            if (!socket) {
              console.warn('⚠️ Socket bulunamadı:', socketUUID, 'için buatCircle:', obj);
              return;                               // socket yoksa singleSquareBuat'a geçme
            }
            const dist = distance2D(obj.position, p1);
            if (dist < tolerance) {
              // objeyi kare ile değiştir
              scene.remove(obj);
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) obj.material.dispose();        
              singleSquareBuat(scene,p1, 0x0045ff,socket.userData.tempLineUUID);              
            }
          }
        });
        
        // Yardımcı fonksiyon
        function distance2D(a, b) {
          return Math.hypot(a.x - b.x, a.y - b.y);
        }  

        
      }
      startRef.current=false
      snapSourceRef.current=null
      if (tempLineRef.current) {
        scene.remove(tempLineRef.current);
        tempLineRef.current.geometry.dispose();
        tempLineRef.current.material.dispose();
        tempLineRef.current = null;
      }      
    }
    
    if (e.key === 'r') {
      setFlipDirection((prev) => -prev);
      return;
    }

}; 

    domElement.addEventListener('click', handleClick);
    domElement.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keyup', handleKeyDown);

    return () => {
      domElement.removeEventListener('click', handleClick);
      domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, [commandType, scene, camera, renderer, gridSnap, objectSnap, flipDir ,snapPoints, dispatch]);

};

export default useSocketWiring;
