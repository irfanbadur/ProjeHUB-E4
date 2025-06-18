import { useEffect, useRef,useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetOperation,
  setCommandMessage,
} from '../../redux/operationSlice';
import { createSnapMarker } from '../../utils/createSnapMarker';
import { generateUniqueId } from '../../utils/generateUniqueId';
import { setOperationData,setCommandType } from '../../redux/operationSlice';
import { getSnappedPoint,getSnappedPointForPanel } from '../../utils/getSnappedPoint';
import { createLightSwich } from '../../symbolDrawings/createLightingSymbols';
import { singleCircleBuatForLight } from '../../symbolDrawings/createLightingSymbols';
import { singleSquareBuat } from '../../symbolDrawings/createSocketSymbols';
 import useDrawPolyline from '../useDrawPolyline';
const useLightingWiring = (scene, camera, renderer,snapPoints, options = {}) => {
  const {
    enabled = () => true,
    onWireEnd = () => {},
    onWireStart = () => {},
    onPreviewUpdate = () => {},
  }  = options;

  const startRef = useRef(false);

  const snapMarkerRef = useRef(null);
  const snapSourceRef = useRef(null);
  const previewSymbolRef = useRef(null);  
  const previewEndPointRef = useRef({ x: 0, y: 0 });

  const lastMouse = useRef({ x: 0, y: 0 });
  const [step, setStep] = useState(0); // 0: ilk nokta, 1+: devam
  
  const lightCountRef = useRef(0);
  const lightTypes = ['normal',  'normal etanj','Komütatör','etanj Komütatör','vaviyen'];
  const lightTypeIndex = useRef(0);
  const LightTypeRef = useRef('normal');
  const lightSwichsRef=useRef([])

  const wireColor=0x0045ff
  const dispatch = useDispatch();
  const wireCounterRef = useRef(1); // 1'den başlasın

  const { commandType } = useSelector((state) => state.operation);
  const gridSnap = useSelector((state) => state.mods.gridSnap);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const operationData = useSelector((state) => state.operation.data);
  const operation = useSelector((state) => state.operation);

  const snapMode = useSelector((state) => state.mods.snapMode);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // Ortho modu Redux'tan
  const flipDirectionRef = useRef(1);
  const [flipDirection, _setFlipDirection] = useState(1);
  

  const gridSize = 10;
  const snapState = {
    x: 0, // 0: İlk adım, 1: Tam hizalama, 2: Üçüncü adım (5 birim kayma)
    y: 0, // Aynı şekilde Y için de
  };
  let shouldStartDrawing =false
  if(
  commandType === 'drawLight' &&
  operationData?.initialPoint &&
  operationData?.source )shouldStartDrawing =true
 
console.log("use operation",commandType,operationData?.initialPoint,operationData?.source,shouldStartDrawing )  
  
  useDrawPolyline(scene, camera, renderer, snapPoints, {
    enabled: () => shouldStartDrawing,
    initialPoint: snapSourceRef.current?.position,  
    onPolylineComplete: (polyline, vertices) => {
      polyline.userData = {
        id: generateUniqueId(),
        isSelectable: true,
        type: 'lightingWire',
        switches: lightSwichsRef.current,
        buat: null,
        panelInfo: {
          source: operationData?.source,
        },
        lightType: LightTypeRef.current,
      };
  
      if (vertices.length > 1 && onWireEnd) {
        onWireEnd(vertices, lightSwichsRef.current, snapSourceRef.current, polyline.uuid);
      }
  
      // Önizlemeleri temizle
      if (previewSymbolRef.current) {
        scene.remove(previewSymbolRef.current);
        previewSymbolRef.current.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        previewSymbolRef.current = null;
      }
  
      lightSwichsRef.current = [];
      snapSourceRef.current = null;
      dispatch(resetOperation());
      dispatch(setCommandMessage(''));
    },
    onPreviewUpdate: (previewPoint) => {
      previewEndPointRef.current = previewPoint;
    },
  });
  
  
  const applyGridSnap = (point) => {
    return new THREE.Vector3(
      Math.round(point.x / gridSize) * gridSize,
      Math.round(point.y / gridSize) * gridSize,
      0
    );
  };
// Yardımcı fonksiyon: Ortho hizalama
 

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
     if (commandType !== 'drawPolyline') {
      dispatch(setCommandType('drawPolyline'));
    }
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
      startRef.current = true;
     snapSourceRef.current = snapSource;
 
     dispatch(setCommandMessage("Sonraki noktaları seçin. Bitirmek için Enter/Space, iptal için ESC."));
     setStep(1);
   }
 }, [operationData, step, enabled]);
 
};

export default useLightingWiring;
