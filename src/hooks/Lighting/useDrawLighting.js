// src/hooks/useDrawLigthing.js
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCommandMessage, resetOperation } from '../../redux/operationSlice';
import { generateUniqueId } from '../../utils/generateUniqueId';
import { createLightSwich   } from '../../symbolDrawings/createLightingSymbols'
import { singleCircleBuatForLight, singleSquareBuat } from '../../symbolDrawings/createLightingSymbols';
import useSnapPoints from '../useSnapPoints';
import useLightingWiring from './useLightingWiring'; 
import { createWireTitle } from '../../utils/createWireTitle'; // az önce yazdığımız

///import { useWireTitle } from './useWireTitle';

const useDrawLigthing = (scene, camera, renderer) => {
  const dispatch = useDispatch();
  const { commandType } = useSelector((state) => state.operation);
  const { snapPoints } = useSnapPoints(scene);

  const dynamicSnapPoints = useRef([]);
  const wiringActiveRef = useRef(false);
  const sceneRef = useRef(null);
  const placedLightSwichsRef = useRef([]);
  // const { addTitleToScene } = useWireTitle();

  const getOffsetPositionAtDirection = (base, direction, width = 14, height = 28) => {
    return base.clone().add(
      new THREE.Vector3(-direction.x * (width / 2), -direction.y * (height / 2), 0)
    );
  };

  const handleLightSwichPlace = (position, direction) => {
    const adjustedPos = getOffsetPositionAtDirection(position, direction);
    const LightSwitch = createLightSwich(sceneRef.current, adjustedPos, direction, 0xffffff, false, "normal", null, 0);
    const angle = Math.atan2(direction.y, direction.x);
    LightSwitch.children[0].rotation.z = angle;

    LightSwitch.userData = {
      id: generateUniqueId(),
      type: 'LightSwitch',
      isSelectable: true,
      originalColor: 0xffffff,
      connectedFrom: null,
      connectedTo: position.clone(),
    };

    sceneRef.current.add(LightSwitch);
    return LightSwitch;
  };

  const handleLightSwichRemove = (lightSwitch) => {
    if (!lightSwitch) return;
    sceneRef.current.remove(lightSwitch);
    lightSwitch.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  };

  const handlePreviewUpdate = (point) => {
    if (!sceneRef.current || !point || placedLightSwichsRef.current.length < 1) return;

    const lastLightSwich = placedLightSwichsRef.current[placedLightSwichsRef.current.length - 1];
    if (!lastLightSwich) return;

    const direction = new THREE.Vector3().subVectors(point, lastLightSwich.userData.connectedTo).normalize();
    const angle = Math.atan2(direction.y, direction.x);

    lastLightSwich.children[0].rotation.z = angle;
    lastLightSwich.position.copy(getOffsetPositionAtDirection(point, direction));
  };
  const findObjectByUUID = (scene, uuid) => {
    let found = null;

    scene.traverse((obj) => {
      if (obj.uuid === uuid) {
        found = obj;
      }
    });

    return found;
  };

  const findWireGroupByID = (scene, wireID) => {
    let found = null;
    scene.traverse(obj => {
      if (obj.userData?.wireID === wireID) {

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
  const handleWireEnd = (vertices, switchs, source) => {
    let panelID = null;
    let wireID = null;
    let branchID
    let totalLength = 0;
    for (let i = 0; i < vertices.length - 1; i++) {
      totalLength += vertices[i].distanceTo(vertices[i + 1]);
    }
    let panel
    let power = 0
    switchs.forEach(soc => power += soc.power)
    let foundPanelOutSnap //= findObjectByUUID(scene, source.no);
    console.log("handleWireEnd DRAWLİGHTİNG source ----------------------------: ", vertices, source)
    let title;

    if (source.type === "panelConnection") {
      title = source.p.no
      foundPanelOutSnap = findObjectByUUID(scene, source.p.UUID);
    } else {
      // title= source.parent.no
      foundPanelOutSnap = findObjectByUUID(scene, source.no);
    }
    let foundObject
    console.log("DRAWLİGHTİNG foundPanelOutSnap : ", foundPanelOutSnap, switchs)
 
    if (foundPanelOutSnap.userData.type === "panelCon_out") {
      scene.traverse(obj => {
        if (obj.userData.id === foundPanelOutSnap.userData.panelID) {
          foundObject = obj
          panelID = foundObject.userData.id;
          panel = foundObject
          console.log("DRAWLİGHTİNG  panel=foundObject : ", panel)

        }
      })
    } else if (foundPanelOutSnap.userData.type === "buatCircle") {
      wireID = foundPanelOutSnap.userData.wireID;
      const wireGroup = findWireGroupByID(scene, wireID);
      console.log("FOUND OBJECT wireGroup : ", wireGroup)

      panelID = wireGroup.userData.panelID;
      scene.traverse(obj => {
        if (obj.userData.id === panelID) {
          panel = obj
        }
      })

    } else if (foundPanelOutSnap.userData.type === "polyline") {
      wireID = foundPanelOutSnap.userData.wireID;
      panelID = foundPanelOutSnap.userData.panelID;    
    } else if (foundPanelOutSnap.userData.type === "buatLightingSquare") {
      wireID = foundPanelOutSnap.parent.userData.wireID;
      panelID = foundPanelOutSnap.parent.userData.panelID;

    }
    console.log("FOUND OBJECT : ", foundObject)
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
      const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
      const material = new THREE.LineBasicMaterial({ color: 0xff0045 });
      const line = new THREE.Line(geometry, material);
      const generatedWireID = generateUniqueId("wireLighting");
     const  wireID= generatedWireID
      line.userData = {
        id: generatedWireID,
        masterId: source.no,
        tempLineId: switchs[0].masterPolylineUUID,
        type: 'polyline',
        panelID,
        wireID: wireID,
        function: 'wireLighting',
        isSelectable: true,
        connectedFrom: vertices[0],
        connectedTo: vertices[vertices.length - 1],
        branchID
      };
      wireGroup.userData.wireID=wireID
      wireGroup.name = "wireGroup"
      if (source.type === "panelConnection") {
        switchs.forEach((lightSwitch, v) => {
          
          if (v <= switchs.length-2) {
            const buat = singleSquareBuat(scene, lightSwitch.position,0x00ff00,lightSwitch.uuid)
            wireGroup.add(buat)
          }else{
            const buat = singleCircleBuatForLight(scene, lightSwitch.position,0x00ff00,lightSwitch.uuid)
            wireGroup.add(buat)    
          }

        })
      }else if (source.type === "vertex"||source.type === "lightingBuat") {
        switchs.forEach((lightSwitch, v) => {
          if (v <= switchs.length-2) {
            const buat = singleSquareBuat(scene, lightSwitch.position,0x00ff00,lightSwitch.uuid)
            wireGroup.add(buat)
          }else{
            const buat = singleCircleBuatForLight(scene, lightSwitch.position,0x00ff00,lightSwitch.uuid)
            wireGroup.add(buat)    
          }

        })
      }
      wireGroup.add(line)
      if (title) {
        const titleGroup = createWireTitle(vertices[0], title, "#00ffff", vertices, source.p.OutID);
        wireGroup.add(titleGroup);
      }
      switchs.forEach((soc) => {
        scene.traverse((s) => {
          if (s.uuid === soc.uuid) {
            s.userData.branchID = branchID;
            s.traverse((ss) => {
              ss.userData.branchID = branchID;
            });
          }
        });
      });
      return wireGroup;
    };

    // 📌 YENİ WIRE GROUP OLUŞTURULUYORSA
    if (panelID && !wireID) {
      const brachGroup = new THREE.Group();
      branchID = generateUniqueId("branchLight");
      brachGroup.userData.id = branchID
      brachGroup.name = "branchGroup"
      const wireGroup = makeWire();
      const userData = {
        branchID,
        panelID,
        function: "wireLight",
        power,
        length: totalLength.toFixed(2),
        //  title:5,
        wireID:wireGroup. userData.wireID,
        switchs: switchs,
      }
      if (!brachGroup.userData.wireLighting) {
        brachGroup.userData.wireLighting = [];
      }
      brachGroup.userData.wireLighting.push(userData);
      wireGroup.userData = userData;
      wireGroup.name = "wireLight"
      brachGroup.add(wireGroup);
      panel.userData.outs.push(
        {
          branchID,
          power: 0,
          branchType:"lighting",
          wires: [{
            wireID:wireGroup. userData.wireID,
            length: userData.length,
            switchs: userData.switchs,
            power: userData.power
          }]
        })

      scene.add(brachGroup);
    }
    // 📌 VAR OLAN WIRE GROUP'A EKLEME YAPILIYORSA
    if (wireID) {

      const wireGroup = findWireGroupByID(scene, wireID); // Kaynak wireGroup
      branchID = wireGroup.userData.branchID
      const branchGroup = findBranchGroupByID(scene, branchID);
      console.log(" wireGroup:", wireGroup);
      console.log(" branchID:", branchID);
      console.log(" branchGroup:", branchGroup);


      if (branchGroup) {
        const wireGroup = makeWire();

        const userData = {
          branchID,
          panelID,
         // wireID,
          function: "wireLight",
          power,
          length: totalLength.toFixed(2),
          title: 5,
          switchs: switchs,
          wireID:wireGroup. userData.wireID,


        };
        wireGroup.userData = userData
        let brachGroup
        scene.traverse(obj => {
          if (obj.userData.id === branchID) {
            brachGroup = obj
            brachGroup.userData.wireLighting.push(userData);
          }
        })

        branchGroup.worldToLocal(wireGroup.position);
        branchGroup.add(wireGroup);
        let outs = panel.userData.outs
        const newWire = {
          length: userData.length,
          switchs: userData.switchs,
          power: userData.power,
          wireID: userData.wireID
        }
        let out = outs.find(obj => obj.branchID === branchID)
         out.wires.push(newWire)
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
    for (let i = 0; i < vertices.length - 1; i++) {
      const p1 = vertices[i];
      const p2 = vertices[i + 1];
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const length = dir.length();

      if (length < 150) continue;

      const normal = dir.clone().normalize();
      const angleRad = THREE.MathUtils.degToRad(45); // 30 derece açı

      const angledDir = rotateVector(normal, angleRad); // eğimli yön
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      //  let existing = previewMarkersRef.current.find(m => m.startIdx === i);
      const forwardOffset = normal.clone().setLength(1.5); // çizgi yönünde 4 birim ileri/geri
      const halfLength = 2.5;

      const positions = [
        mid.clone().sub(forwardOffset),
        mid.clone().add(forwardOffset),
      ];

      //  if (!existing) {
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


    }
  }
 
  




  useEffect(() => {
    if (commandType !== 'drawLight' || !scene || !camera || !renderer) return;
    dispatch(setCommandMessage('Aydınlatma hattı çizin, Space ile anahtarları ekleyin, Enter ile bitirin.'));
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
    //------------------------------
  }, [commandType, scene, camera, renderer]);

  useLightingWiring(
    scene,
    camera,
    renderer,
    [...snapPoints, ...dynamicSnapPoints.current],
    {
      enabled: () => wiringActiveRef.current,
      onWireEnd: handleWireEnd,
      onLightSwichPlace: handleLightSwichPlace,
      onLightSwichRemove: handleLightSwichRemove,
      onPreviewUpdate: handlePreviewUpdate,
      onWireCancel: () => {
        wiringActiveRef.current = false; // ESC ile iptal edildiğinde devre dışı bırak
      }
    }
  );
};

export default useDrawLigthing; 