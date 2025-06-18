import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDispatch,useSelector } from "react-redux";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useMemo } from 'react';

import useDrawLine from '../../hooks/useDrawLine'; // doğru yola göre güncelle
import useDrawPolyline from '../../hooks/useDrawPolyline';
import useDrawSpline from '../../hooks/useDrawSpline';
import useDrawCircle from '../../hooks/useDrawCircle';
import useDrawArc from '../../hooks/useDrawArc';
import useDrawEllipse from '../../hooks/useDrawEllipse';
import useDrawRect from '../../hooks/useDrawRect';
import useDrawText from '../../hooks/useDrawText';
import useDrawMText from '../../hooks/useDrawMtext';
import { useSelection } from '../../hooks/useSelection';
import { useGizmo } from '../../hooks/useGizmo';
import { useGizmoRender } from '../../hooks/useGizmoRender';
import useGizmoManager from '../../hooks/gizmos/useGizmoManager'

import { useTestScene } from '../../hooks/useTestScene';

import { setCommandType,resetOperation  } from "../../redux/operationSlice"
import useSnapPoints from '../../hooks/useSnapPoints';
import useErase from '../../hooks/useErase';
import useModifyMove from '../../hooks/useModifyMove';
import useModifyCopy from '../../hooks/useModifyCopy';
import useModifyRotate from '../../hooks/useModifyRotate';
import { dxfDrawCore } from '../../utils/dxfDrawCore';

import  {useElectricalPanels} from '../../hooks/wiring/useElectricalPanels';
import useDrawMachine from '../../hooks/wiring/useMachines';
import useDrawSockets from '../../hooks/wiring/useDrawSocket';
import useDrawLigthing from '../../hooks/Lighting/useDrawLighting';
import useDrawLigthFixture from '../../hooks/Lighting/useDrawLightFixture';

import useElectricalWiring from '../../hooks/wiring/useElectricalWiring';
import { selectDxfEntities,selectDxfBlocks} from '../../utils/dxfSelectors';
 
import { createSingleSocket } from '../../symbolDrawings/createSocketSymbols';
import { createLightSwich } from '../../symbolDrawings/createLightingSymbols';
import { createLightFixture } from '../../symbolDrawings/createLightFixtureSymbols';
import DropdownMenu,{SocketTypeMenu,LightSwitchTypeMenu,
//  LightFixtureTypeMenu
} from '../TypeMenus/DropDownMenu';
import { useGizmoTitle } from '../../hooks/gizmos/useGizmoTitle';
import  LightFixtureTypeMenu  from '../TypeMenus/LightFixtureTypeMenu';
import PanelTypeMenu from '../TypeMenus/PanellTypeMenu';
import MachineTypeMenu from '../TypeMenus/MachineTypeMenu';
import useGlobalUndoRedo from '../../hooks/useGlobalUndoRedo';
//-----------------------------------------------
import useDrawWire from '../../hooks/installation/useDrawWire';
import { useBranchManager } from '../../hooks/installation/useBranchManager';
//import useWiring from '../../hooks/installation/useWiring';
import './DrawingCanvas.css';
//snapPoints=snapPoints.filter(obj=>obj.type==="lightingBuat")
//---------------------------------
import { useProjectDocumentLayout } from '../../hooks/layout/useProjectDocumentLayout';
import { useDocumentDragging } from '../../hooks/layout/useDocumentDragging';
import { useSupplyPoint } from '../../hooks/wiring/useSupplyPoint';
const documentDefs = [
  { name: "TekHat  \u015eemas\u0131", w: 1050, h: 500 },
  { name: "Vaziyet Planı", w: 1500, h: 2250 },
  { name: "Topraklama Detayları", w: 2500, h: 2250 },
  { name: "Kat Planı", w: 2500, h: 2250 },
  { name: "Kat Planı", w: 2500, h: 2250 },
  { name: "Kat Planı", w: 2500, h: 2250 },
  { name: "Kat Planı", w: 2500, h: 2250 },
  { name: "Yükleme Cetveli", w: 1250, h: 1750 },
  { name: "Gerilim Düşümü", w: 1250, h: 550 },
  { name: "Akım Hesabı", w: 1250, h: 350 },
  { name: "Kolon Şeması", w: 1650, h: 2650 },
  { name: "TekHat  \u015eemas\u0131", w: 1050, h: 500 },
  { name: "TekHat  \u015eemas\u0131", w: 1050, h: 500 },
  { name: "TekHat  \u015eemas\u0131", w: 1050, h: 500 },
  { name: "TekHat  \u015eemas\u0131", w: 1050, h: 500 },
  { name: "Kablo Ak\u0131m T.Kap", w: 1050, h: 2000 },
  { name: "Pano Detay", w: 250, h: 250 },
  { name: "Enerji Odas\u0131", w: 375, h: 375 },
  { name: "Sembol Listesi", w: 1050, h: 1500 },
  { name: "Ba\u015fl\u0131k", w: 1050, h: 1500 },
];
const DrawingCanvas = ({ onSceneReady }) => {  //>>{ onSceneReady }  test amaçlı toolScene e sahneyi prop olarak göndermek için daha sonra slilinecek
  const canvasRef = useRef();

  const [threeState, setThreeState] = useState(null); // scene, camera, renderer burada tutulacak
  const { commandType, lastCommandType } = useSelector(state => state.operation);
  const { snapPoints, refreshSnapPoints } = useSnapPoints(threeState?.scene);
  const dxfEntities = useSelector(selectDxfEntities);
  const dxfBlocks = useSelector(selectDxfBlocks);
  const alreadyDrawn = useRef(false);
  const [targetPlanes, setTargetPlanes] = useState([]);
  const dispatch = useDispatch();

  //-----------------------------------
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);
  const selections = useSelector((state) => state.selection);

  const [menuVisible, setMenuVisible] = useState(false);
const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
const [menuSocketId, setMenuSocketId] = useState(null);
const [socketType, setSocketType] = useState('normal');

const [lightMenuVisible, setLightMenuVisible] = useState(false);
const [lightMenuPosition, setLightMenuPosition] = useState({ x: 0, y: 0 });
const [lightSwitchType, setLightSwitchType] = useState('normal');
const [lightSwitchId, setLightSwitchId] = useState(null);

const [lightFixtureMenuVisible, setLightFixtureMenuVisible] = useState(false);
const [lightFixtureMenuPosition, setLightFixtureMenuPosition] = useState({ x: 0, y: 0 });
const [lightFixtureType, setLightFixtureType] = useState('normal');
const [lightFixtureId, setLightFixtureId] = useState(null);
const [fixtureDetails, setFixtureDetails] = useState({});
const [lightFixtureMoved, setLightFixtureMoved] = useState(false);

//-------------------------------------------
// inside DrawingCanvas()
const [panelMenuVisible,   setPanelMenuVisible]   = useState(false);
const [panelMenuPosition,  setPanelMenuPosition]  = useState({ x: 0, y: 0 });
const [panelMenuId,        setPanelMenuId]        = useState(null);
const [panelDetails,       setPanelDetails]       = useState({});
const [panelMenuMoved,     setPanelMenuMoved] = useState(false);

//---------------------------------------------------------------------
const [machineMenuVisible,   setMachineMenuVisible]   = useState(false);
const [machineMenuPosition,  setMachineMenuPosition]  = useState({ x: 0, y: 0 });
const [machineMenuId,        setMachineMenuId]        = useState(null);
const [machineDetails,       setMachineDetails]       = useState({});
const [machineMenuMoved,     setMachineMenuMoved] = useState(false);

  const {
  allGroupsRef: layoutGroupsRef,
  boundsRef: layoutBoundsRef
} = useProjectDocumentLayout(
  threeState?.scene,
  documentDefs
);
const wireTitles = useMemo(() => {
  console.log("selectedObjectIds: ",selections)
  const titles = [];
  if (!threeState?.scene) return titles;

  threeState.scene.traverse(child => {
    if (
      child.userData?.type === 'wireTitle' &&
      selectedObjectIds.includes(child.userData.id)
    ) {
      titles.push(child);
    }
  });
  return titles;
}, [threeState, selectedObjectIds]);
 
useEffect(() => {
  if (!threeState?.scene) return; 
  // Socket seçildiyse:
  const selectedSocket = threeState.scene.children.find(obj =>
    obj.userData?.type === 'socket' &&
    selectedObjectIds.includes(obj.userData.id)
  );
  if (selectedSocket) {
    const vec = selectedSocket.position.clone().project(threeState.camera);
    const x = ((vec.x + 1) / 2) * threeState.renderer.domElement.clientWidth;
    const y = ((-vec.y + 1) / 2) * threeState.renderer.domElement.clientHeight;
    setMenuPosition({ x, y });
    setMenuSocketId(selectedSocket.userData.id);
    setSocketType(selectedSocket.userData.subtype || 'normal');
    setMenuVisible(true);
    } else {
    setMenuVisible(false);
  }

  // LightSwitch seçildiyse:
  const selectedLight = threeState.scene.children.find(obj =>
    obj.userData?.type === 'LightSwitch' &&
    selectedObjectIds.includes(obj.userData.id)
  );
 
  if (selectedLight) {
    const vec2 = selectedLight.position.clone().project(threeState.camera);
    const lx = ((vec2.x + 1) / 2) * threeState.renderer.domElement.clientWidth;
    const ly = ((-vec2.y + 1) / 2) * threeState.renderer.domElement.clientHeight;
    setLightMenuPosition({ x: lx, y: ly });
    setLightSwitchType(selectedLight.userData.subtype || 'normal');
    setLightSwitchId(selectedLight.userData.id);
    setLightMenuVisible(true);   
  } else {
    setLightMenuVisible(false);
    
  } 
  const selectedLightFixture = threeState.scene.children.find(obj =>
    obj.userData?.type === 'LightFixture' &&
    selectedObjectIds.includes(obj.userData.id)
  );
 
  if (selectedLightFixture) {
    const vec2 = selectedLightFixture.position.clone().project(threeState.camera);
    const lx = ((vec2.x + 1) / 2) * threeState.renderer.domElement.clientWidth;
    const ly = ((-vec2.y + 1) / 2) * threeState.renderer.domElement.clientHeight;
    if (!lightFixtureMoved) {
      setLightFixtureMenuPosition({ x: lx, y: ly });
    }

    setLightFixtureType(selectedLightFixture.userData.subtype || 'normal');
    setLightFixtureId(selectedLightFixture.userData.id);
    setLightFixtureMenuVisible(true);
    setFixtureDetails({ 'ID': selectedLightFixture.userData.id,  });

  } else {
    setLightFixtureMenuVisible(false);
  } 
  const selectedPanel = threeState.scene.children.find(obj =>
    obj.userData?.type === 'electricalPanel' &&
    selectedObjectIds.includes(obj.userData.id)
  );
  if (selectedPanel) {
    // compute screen coords
    const vec = selectedPanel.position.clone().project(threeState.camera);
    const x = ((vec.x + 1) / 2) * threeState.renderer.domElement.clientWidth;
    const y = ((-vec.y + 1) / 2) * threeState.renderer.domElement.clientHeight;
    if (!panelMenuMoved) {
      setPanelMenuPosition({ x, y });
    }
    
    setPanelMenuId(selectedPanel.userData.id);

    // pull whatever details you need out of userData or elsewhere:
    setPanelDetails({
      'ID': selectedPanel.userData.id,
      'Tip': selectedPanel.userData.subtype || '—',
      'Konum': `(${selectedPanel.position.x.toFixed(1)}, ${selectedPanel.position.y.toFixed(1)})`,
      // add more detail fields as needed…
    });

    setPanelMenuVisible(true);
  } else {
    setPanelMenuVisible(false);
  }

  const selectedMachine = threeState.scene.children.find(obj =>
    obj.userData?.type === 'machine' &&
    selectedObjectIds.includes(obj.userData.id)
  );
  if (selectedMachine) {
    // compute screen coords
    const vec = selectedMachine.position.clone().project(threeState.camera);
    const x = ((vec.x + 1) / 2) * threeState.renderer.domElement.clientWidth;
    const y = ((-vec.y + 1) / 2) * threeState.renderer.domElement.clientHeight;
    if (!machineMenuMoved) {
      setMachineMenuPosition({ x, y });
    }
    
    setMachineMenuId(selectedMachine.userData.id);

    // pull whatever details you need out of userData or elsewhere:
    setMachineDetails({
      'ID': selectedMachine.userData.id,
      'Tip': selectedMachine.userData.subtype || '—',
      'Konum': `(${selectedMachine.position.x.toFixed(1)}, ${selectedMachine.position.y.toFixed(1)})`,
      // add more detail fields as needed…
    });

    setMachineMenuVisible(true);
  } else {
    setMachineMenuVisible(false);
  }
 }, [threeState, selectedObjectIds]);
//------------------------------------------------------------
  
  useEffect(() => {
    if (threeState?.scene && dxfEntities.length > 0 && !alreadyDrawn.current) {
      dxfDrawCore(threeState.scene, dxfEntities, dxfBlocks,"scene");
  
      // ✅ DXF çizildikten sonra sahneyi gez ve targetPlane objelerini topla
      const planes = [];
      threeState.scene.traverse((obj) => {
        if (
          (obj.isLine || obj.isMesh || obj.isLineLoop || obj.isLineSegments) &&
          obj.geometry &&
          obj.visible !== false
        ) {
          planes.push(obj);
        }
      });
      setTargetPlanes(planes); // 🔄 targetPlanes güncellendi
  
      alreadyDrawn.current = true;
    }
  }, [threeState?.scene, dxfEntities]);

  

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene ve Camera
    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -1000,
      1000
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.enableZoom = true;

    // Helpers
/*     const axesHelper = new THREE.AxesHelper(1000);
    axesHelper.userData.ignoreRaycast = true;
    scene.add(axesHelper); */

/*     const gridHelper = new THREE.GridHelper(10000, 100);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2 ; // çok soluk
    gridHelper.material.depthWrite = false; // daha arka planda kalsın
    gridHelper.userData.isSelectable = false; // seçimden hariç tut
    gridHelper.userData.ignoreRaycast = true;
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper); */



    setThreeState({ scene, camera, renderer }); //{ onSceneReady }daha sonra slilinecek 
    onSceneReady?.(scene); // ✅ App'e sahneyi bildir   >>test amaçlı toolScene e sahneyi prop olarak göndermek için daha sonra slilinecek
  

    // THREE objelerini state'e koy
    setThreeState({ scene, camera, renderer });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      container.removeChild(renderer.domElement);
    };
  }, []);
 
  useEffect(() => {
  //  console.log("commandType:", commandType, "lastCommandType:", lastCommandType);

    const handleKeyDown = (e) => {
      if ((e.key === "Enter" || e.key === " ") && !commandType && lastCommandType) {
        dispatch(setCommandType(lastCommandType));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandType, lastCommandType]);
  //-----------------------------
  useGlobalUndoRedo(threeState?.scene, threeState?.camera, threeState?.renderer);

    //------------- DRAW KOMUTLARI -----------------------------

/*     useWiring(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  ); */
  useBranchManager(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  useDrawWire(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  useDrawLine(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  useDrawPolyline(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  
  useDrawSpline(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  useDrawCircle(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  ); 
  useDrawArc(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  useDrawEllipse(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
  useDrawRect(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );

  const textInput = useDrawText(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints 
  );
  const mTextInput = useDrawMText(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer,
    snapPoints
  );
   //--------------LAYOUT------------------------------
 
 
useDocumentDragging(
  layoutGroupsRef.current,
  threeState?.camera,
  threeState?.renderer?.domElement,
  layoutBoundsRef.current
);


  //-------------   KOMUTLARI -----------------------------

   useSelection(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer
  ); 
  useGizmoManager(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer
  ); 

/*    useGizmo(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer.domElement
  ); 
   useGizmoRender(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer.domElement
  );  */
 
  useTestScene(
    threeState?.scene,
    threeState?.camera,
    threeState?.renderer.domElement
  ); 

  //------------- MODIFY KOUTLARI -----------------------------
  useErase(threeState?.scene);
  useModifyMove(threeState?.scene, threeState?.camera, threeState?.renderer,refreshSnapPoints);
  useModifyCopy(threeState?.scene, threeState?.camera, threeState?.renderer,refreshSnapPoints);
  useModifyRotate(threeState?.scene, threeState?.camera, threeState?.renderer,refreshSnapPoints);

//------------------------ELECTRICAL ---------------------------------
useSupplyPoint(
  threeState?.scene,
   threeState?.camera,
  threeState?.renderer,
  snapPoints,
  targetPlanes   
);
useElectricalPanels(
  threeState?.scene,
   threeState?.camera,
  threeState?.renderer,
  snapPoints,
  targetPlanes   
);
useDrawMachine(
  threeState?.scene,
   threeState?.camera,
  threeState?.renderer,
  snapPoints,
  targetPlanes   
);
useDrawSockets(
  threeState?.scene,
   threeState?.camera,
  threeState?.renderer,
  snapPoints,
  targetPlanes   
);
 useDrawLigthing(
  threeState?.scene,
  threeState?.camera,
  threeState?.renderer,
  snapPoints,
  targetPlanes   
);
 
const lightingSnapPoints = useMemo(() => {
  return snapPoints.filter(p =>
    p.type === 'buatLightingCircle' || p.type === 'buatLightingSquare'
  );
}, [snapPoints]);
useDrawLigthFixture(
  threeState?.scene,
  threeState?.camera,
  threeState?.renderer,
  lightingSnapPoints,
  targetPlanes   
);
/* useElectricalWiring(
  threeState?.scene,
  threeState?.camera,
  threeState?.renderer,
  snapPoints,
  targetPlanes  // hedef duvar/kolon objeleri
);
 */
useGizmoTitle(threeState?.scene, threeState?.camera, threeState?.renderer, wireTitles);

  return   <div className="drawing-canvas-container" ref={canvasRef}>
     {textInput}
    {mTextInput} 

    {/* ------------------------------------------ */}

    {menuVisible && (
        <SocketTypeMenu
          x={menuPosition.x+50}
          y={menuPosition.y+30}
          value={socketType}
          onChange={(newType) => {
            // Redux veya sahne güncellemesi:
            const socket = threeState.scene.children.find(o => o.userData.id === menuSocketId);
  /*           if (socket) {
              socket.userData.subtype = newType;
              // İsterseniz görsel güncelleme de yapabilirsiniz…
            } */
            if (socket) {
              const pos = socket.position.clone();
              threeState.scene.remove(socket);
              const rotate= socket.userData.rotate  
              const newSocket = createSingleSocket(null, pos, 1, 0x0045ff, false, newType,null,rotate);
              newSocket.userData.subtype = newType;
              newSocket.position.copy(pos);
              threeState.scene.add(newSocket);
            }
            setSocketType(newType);
            setMenuVisible(false);
          }}
        />
      )}

      {/* LightSwitch tipi menüsü */}
      {lightMenuVisible && (
        <LightSwitchTypeMenu
          x={lightMenuPosition.x}
          y={lightMenuPosition.y}
          value={lightSwitchType}
          onChange={(newType) => {
            const ls = threeState.scene.children.find(o => o.userData.id === lightSwitchId);
 
            if (ls) {
              const pos = ls.position.clone();
              threeState.scene.remove(ls);
              const newLightSwitch = createLightSwich(null, pos, 1, 0, false, newType);
              newLightSwitch.userData.subtype = newType;
              newLightSwitch.position.copy(pos);
              threeState.scene.add(newLightSwitch);
            }
            setLightSwitchType(newType);
            setLightMenuVisible(false);
          }}
        />
      )}
       {/* -------------------------------------- */}
      {lightFixtureMenuVisible && (
        <LightFixtureTypeMenu
        scene={threeState?.scene}     
          x={lightFixtureMenuPosition.x}
          y={lightFixtureMenuPosition.y}
          value={lightFixtureType}
          fixtureDetails={fixtureDetails}

          onDrag={(dx, dy) => {
            setLightFixtureMenuPosition(pos => ({ x: pos.x + dx, y: pos.y + dy }));
            setLightFixtureMoved(true);
          }}
          onClose={() => setLightFixtureMenuVisible(false)}
        />
      )}

    {panelMenuVisible && (
  <PanelTypeMenu
    scene={threeState?.scene}
    x={panelMenuPosition.x}
    y={panelMenuPosition.y}
    panelDetails={panelDetails}
    onAddPositionChange={(val) => {
      // handle 'Yukarı Ekle' / 'Aşağı Ekle'
    }}
    onDrag={(dx, dy) => {
      setPanelMenuPosition(pos => ({ x: pos.x + dx, y: pos.y + dy }));
      setPanelMenuMoved(true);
    }}
    onClose={() => setPanelMenuVisible(false)}
  />
)}
    {machineMenuVisible && (
  <MachineTypeMenu
    scene={threeState?.scene}
    x={machineMenuPosition.x}
    y={machineMenuPosition.y}
    machineDetails={machineDetails}
    onAddPositionChange={(val) => {
      // handle 'Yukarı Ekle' / 'Aşağı Ekle'
    }}
    onDrag={(dx, dy) => {
      setMachineMenuPosition(pos => ({ x: pos.x + dx, y: pos.y + dy }));
      setMachineMenuMoved(true);
    }}
    onClose={() => setMachineMenuVisible(false)}
  />
)}

    {/* ------------------------------------------ */}

  </div>
};

export default DrawingCanvas;





