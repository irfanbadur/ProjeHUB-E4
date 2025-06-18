// src/hooks/useDrawLigthing.js
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCommandMessage, resetOperation } from '../../redux/operationSlice';
import { generateUniqueId } from '../../utils/generateUniqueId';
import { createLightFixture } from '../../symbolDrawings/createLightFixtureSymbols';
import { singleCircleBuatForLight, singleSquareBuat } from '../../symbolDrawings/createLightingSymbols';
import useSnapPoints from '../useSnapPoints';
import useLightFixtureWiring from './useLightFixtureWiring';
import { useTextGroupDrag } from './useTextGroupDrag';
 
 
const useDrawLigthFixture = (scene, camera, renderer) => {
  const dispatch = useDispatch();
  const { commandType } = useSelector((state) => state.operation);
  const { snapPoints } = useSnapPoints(scene);

  const dynamicSnapPoints = useRef([]);
  const wiringActiveRef = useRef(false);
  const sceneRef = useRef(null);
  const branchID_Ref = useRef(null);
  const placedLightFixturesRef = useRef([]);
   
 
  const getOffsetPositionAtDirection = (base, direction, width = 14, height = 28) => {
    return base.clone().add(
      new THREE.Vector3(-direction.x * (width / 2), -direction.y * (height / 2), 0)
    );
  };

  const handleLightFixturePlace = (position, direction) => {
    const adjustedPos = getOffsetPositionAtDirection(position, direction);
    const LightFixture = createLightFixture(sceneRef.current, adjustedPos, direction, 0xffffff, false, "normal", null, 0 );
    const angle = Math.atan2(direction.y, direction.x);
    let offsetGroup
    LightFixture.children.forEach((obj)=>{
     if(obj.name==="offsetGroup"){
       offsetGroup=obj
       offsetGroup.rotation.z = angle; // offsetGroup'u döndür
     }
    })

    LightFixture.userData = {
      id: generateUniqueId(),
      type: 'LightFixture',
      isSelectable: true,
      originalColor: 0xffffff,
      connectedFrom: null,
      connectedTo: position.clone(),
      branchID:branchID_Ref.current
    };

    sceneRef.current.add(LightFixture);
    placedLightFixturesRef.current.push(LightFixture);

    return LightFixture;
  };

  const handleLightFixtureRemove = (lightFixture) => {
    if (!lightFixture) return;
    sceneRef.current.remove(lightFixture);
    lightFixture.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  };

  const handlePreviewUpdate = (point) => {
    if (!sceneRef.current || !point || placedLightFixturesRef.current.length < 1) return;

    const lastLightFixture = placedLightFixturesRef.current[placedLightFixturesRef.current.length - 1];
    if (!lastLightFixture) return;

    const direction = new THREE.Vector3().subVectors(point, lastLightFixture.userData.connectedTo).normalize();
    const angle = Math.atan2(direction.y, direction.x);

    lastLightFixture.children[0].rotation.z = angle;
    lastLightFixture.position.copy(getOffsetPositionAtDirection(point, direction));
  };
 

  const findWireGroupByID = (scene, wireID) => {
    let found = null;
    scene.traverse(obj => {
      if (obj.userData?.id === wireID) {
        found = obj;
      }
    });
    return found;
  };
  const findBranchGroupByID = (scene, branchID) => {
    let found = null;
    scene.traverse(obj => {
      if (obj.userData?.id === branchID) {
        found = obj;
      }
    });
    return found;
  };
  const handleWireEnd = (vertices, fixtures, source) => {
    console.log("handleWireEnd source ----------------------------: ", fixtures, source)
    if(source.type!="lightingBuat" ){
      return
    }
    let panelID = null;
    let wireID = null;
    let branchID
    let totalLength = 0;
    const lightFixture=fixtures[0]
    for (let i = 0; i < vertices.length - 1; i++) {
      totalLength += vertices[i].distanceTo(vertices[i + 1]);
    }
    let panel
    let power = 0
    fixtures.forEach(fix => power += fix.power)
    console.warn("fixtures",fixtures,power)

    const selectedSwitch=source.parent.children.find(obj=>obj.uuid===source.no)
    console.log("handleWireEnd selectedSwitch ----------------------------: ", selectedSwitch)
     if (source.type === "vertex"||source.type === "end") {
      wireID = source.parent.wireID;
      panelID = source.parent.panelID;
      branchID = source.parent.branchID
    } else if (source.type === "lightingBuat") {
      wireID = source.parent.userData.wireID;
      panelID = source.parent.userData.panelID;
      branchID = source.parent.userData.branchID
    }
    branchID_Ref.current=branchID
    console.log("branchID : ", branchID)
    console.log("panelID : ", panelID)
    console.log("wireID : ", wireID)
    scene.traverse(obj => {
      if (obj.userData.id === panelID) {
        panel = obj
      }
    })
    console.log("panel panel panel : ", panel)
    scene.traverse((obj) => {
      if (
        obj.type === 'Group' &&
        obj.userData?.type === 'socket' &&
        obj.userData?.isPreview === true
      ) {
        obj.userData.isPreview = false;
      }
    });

    const makeWire = () => {
      const wireGroup = new THREE.Group();
      const curve = new THREE.CatmullRomCurve3(
        vertices.map((p) => new THREE.Vector3(p.x, p.y, p.z || 0))
      );

      const divisions = Math.max(10, vertices.length * 10);
      const splinePoints = curve.getPoints(divisions);
      const geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);

      const material = new THREE.LineBasicMaterial({ color: 0x0045ff });
      const line = new THREE.Line(geometry, material);
      const generatedWireID = generateUniqueId("wireLightFixture");

      line.userData = {
        id: generatedWireID,
        masterId: source.no,
        tempLineId: fixtures[0].masterPolylineUUID,
        type: 'polyline',
        panelID,
        wireID: generatedWireID,
        function: 'wireLightFixture',
        isSelectable: true,
        connectedFrom: vertices[0],
        connectedTo: vertices[vertices.length - 1],
        branchID
      };

      wireGroup.add(line)
 

      return wireGroup;
    };

    // 📌 VAR OLAN WIRE GROUP'A EKLEME YAPILIYORSA
    if (wireID) {
      const branchGroup = findBranchGroupByID(scene, branchID);
      const wireIDGroup = findWireGroupByID(scene, wireID);
      console.log(" branchID:", branchID);
      console.log(" branchGroup:", branchGroup);
      console.log(" wireIDGroup:", wireIDGroup);

      if (branchGroup) {
        const wireGroup = makeWire();
        const userData = {
          branchID,
          panelID,
          wireID,
          function: "wireLightFixture",
          power:power,
          length: totalLength.toFixed(2),          
          switchs: fixtures,
        };

        wireGroup.userData = userData       
        branchGroup.worldToLocal(wireGroup.position);
        branchGroup.add(wireGroup);
        let outs = panel.userData.outs     
        console.warn("❌ panel çıkışları:", outs,power);

        let out = outs.find(obj => obj.branchID === branchID)
        out.power+=power
        
        const wire=out.wires.find(obj=>obj.wireID===wireID)
        wire.power+=power
        console.log("❌selectedSwitch.wire:", wire);
        console.log("❌selectedSwitch.LightSwichUUID:", selectedSwitch.userData.LightSwichUUID);

       const thisSwitch=wire.switchs.find(obj=>obj.uuid===selectedSwitch.userData.LightSwichUUID)
       console.log("❌thisSwitch:", thisSwitch);

       thisSwitch.power+=power

        panel.userData.outs = outs
      } else {
        console.warn("❌ wireID bulundu ama wireGroup sahnede bulunamadı:", wireID);
      }
    }
    markering(vertices)
    dispatch(setCommandMessage("Soket hattı tamamlandı"));
    dispatch(resetOperation());
    wiringActiveRef.current = false;
  };
  const markering = (vertices) => {
    if (!vertices || vertices.length < 2) return;
  
    const curve = new THREE.CatmullRomCurve3(vertices);
    const midPoint = curve.getPoint(0.5);             // Eğrinin ortası
    const tangent = curve.getTangent(0.5).normalize(); // Yön vektörü (eğri boyunca)
  
    // Marker çizgilerinin yönü (örneğin 45°)
    const angleRad = THREE.MathUtils.degToRad(45);
    
    const rotateVector = (v, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return new THREE.Vector3(
        v.x * cos - v.y * sin,
        v.x * sin + v.y * cos,
        0
      ).normalize();
    };
  
    const markerDirection = rotateVector(tangent, angleRad); // 45° eğik çizgi yönü
    const halfLength = 2.5;
    const offsetAlongSpline = tangent.clone().multiplyScalar(2.5); // spline yönünde ötelenmiş nokta
  
    const makeMarker = (centerPoint) => {
      const start = centerPoint.clone().add(markerDirection.clone().multiplyScalar(-halfLength));
      const end = centerPoint.clone().add(markerDirection.clone().multiplyScalar(halfLength));
      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geo, mat);
      line.userData.role = 'wireMarker';
      scene.add(line);
    };
  
    makeMarker(midPoint);                              // 1. marker ortada
    makeMarker(midPoint.clone().add(offsetAlongSpline)); // 2. marker ileri kaydırılmış
  };
  
 

  

  useEffect(() => {
    if (commandType !== 'drawFixture' || !scene || !camera || !renderer) return;

    dispatch(setCommandMessage('Soket hattı çizin, Space ile soket ekleyin, Enter ile bitirin.'));
    sceneRef.current = scene;

    dynamicSnapPoints.current = [];
    scene.traverse(obj => {
      if (obj.userData?.connectionPoints) {
        obj.userData.connectionPoints.forEach(p => {
          if (p.type === 'panelCon_out') {
            const worldPos = p.position.clone().applyMatrix4(obj.matrixWorld);
            dynamicSnapPoints.current.push({
              no: obj.uuid,
              position: worldPos,
              type: 'panelConnection',

            });
          }
        });
      }
    });

    wiringActiveRef.current = true;
  }, [commandType, scene, camera, renderer]);

  useLightFixtureWiring(
    scene,
    camera,
    renderer,
    [...snapPoints, ...dynamicSnapPoints.current],
    {
      enabled: () => wiringActiveRef.current,
      onWireEnd: handleWireEnd,
      onLightFixturePlace: handleLightFixturePlace,
      onLightFixtureRemove: handleLightFixtureRemove,
      onPreviewUpdate: handlePreviewUpdate,
      onWireCancel: () => {
        wiringActiveRef.current = false; // ESC ile iptal edildiğinde devre dışı bırak
      }
    }
  );

 
  
  useTextGroupDrag({
    scene,
    camera,
    renderer,
   
    
  });
};

export default useDrawLigthFixture; 