// src/hooks/useBranchManager.js
import { useRef, useEffect ,useState} from 'react';
import * as THREE from 'three';
import { generateUniqueId } from '../../utils/generateUniqueId';
import useWiring from './useWiring';
import { setCommandType } from '../../redux/operationSlice';
import { useSelector,useDispatch } from 'react-redux';
 import useSocketGizmo from '../gizmos/useSocketGizmo';
 import useSocketGizmoEvents from '../gizmos/useSocketGizmoEvents';
 
import { useComponent } from './useComponent';


export const useBranchManager = (scene, camera, renderer, snapPoints) => {
  const branchGroupRef = useRef(null); // Tüm branch'leri içeren ana grup
  const activeBranchRef = useRef(null); // Aktif branch (kullanıcının şu anda kablo çektiği)
  const branchesRef = useRef([]); // Tüm branch yapıların bilgileri
  const wireRef = useRef(null);        // Son eklenen wire referansı
  const polylineRef = useRef(null);    // Gerekirse orijinal polyline referansı
  const [isWireComplete, setWireComplete] = useState(false);

  const commandType = useSelector((state) => state.operation.commandType);
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjects);
  const dispatch = useDispatch();
  // 🧩 Yeni socket gizmo sistemini bağla
  useSocketGizmo(scene, selectedObjectIds);
  useSocketGizmoEvents({ scene, camera, renderer });
  
  const wiring = useWiring(scene, camera, renderer, snapPoints, {
    enabled: () => !!activeBranchRef.current,
    onPolylineComplete: (points) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const wireLine = new THREE.Line(geometry, material);
      wireRef.current = wireLine;
      addWireToBranch(wireLine);
      createPermanentSymbol(); 
      removePreview(); // kalıcı bileşen sonrası önizlemeyi kaldır
    },
    onPreviewUpdate: (previewPoints) => {
        updatePreview(previewPoints); // 💡 her mouseMove'da çalışacak
      }
  });
  

  const createNewBranch = () => {
    const branchId = generateUniqueId('branch');
    const branchGroup = new THREE.Group();
    branchGroup.name = `branch-${branchId}`;
    branchGroup.userData.type = 'branch';
    branchGroup.userData.id = branchId;
    branchGroup.userData.wires = [];
    branchGroup.userData.buatlar = [];
    branchGroup.userData.endpoints = [];

    scene.add(branchGroup);
    activeBranchRef.current = branchGroup;
    branchesRef.current.push(branchGroup);

    // ✅ Komutu güncelle: useWiring aktif hale gelsin
    dispatch(setCommandType('createWire'));

    return branchGroup;
  };

  const addWireToBranch = (wireLine) => {
    if (!activeBranchRef.current) return;

    const wireId = generateUniqueId('wire');
    wireLine.name = `wire-${wireId}`;
    wireLine.userData.id = wireId;
    wireLine.userData.type = 'wire';
    wireLine.userData.branchId = activeBranchRef.current.userData.id;

    activeBranchRef.current.userData.wires.push(wireLine);
    activeBranchRef.current.add(wireLine);
  };
//-------------------------------------------------
const { updatePreview, removePreview, previewRef,createPermanentSymbol } = useComponent(scene, wireRef, polylineRef, { size: 15, color: 0x00ff00 });

useEffect(() => {
  if (isWireComplete) {
    updatePreview(); // Wire tamamlandıktan sonra çağrılır
  }
}, [isWireComplete]);

//-------------------------------------------------
  const getActiveBranch = () => activeBranchRef.current;
  const getAllBranches = () => branchesRef.current;

  useEffect(() => {
    if (commandType === 'createNewBranch' && scene && camera && renderer) {
      createNewBranch();
      wiring?.startWiring?.();
    }
  }, [commandType, scene, camera, renderer]);

  return {
    createNewBranch,
    addWireToBranch,
    getActiveBranch,
    getAllBranches,
    startWiring: wiring?.startWiring,
    stopWiring: wiring?.stopWiring,
    isDrawing: wiring?.isDrawing,
    wireDataRef: wiring?.wireDataRef,
  };
};
