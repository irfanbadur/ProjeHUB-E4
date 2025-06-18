// src/hooks/useDrawSockets.js
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCommandMessage, resetOperation } from '../../redux/operationSlice';
import { generateUniqueId } from '../../utils/generateUniqueId';
import { createSingleSocket, socketBuatControl } from '../../symbolDrawings/createSocketSymbols';
import useSnapPoints from '../useSnapPoints';
import useSocketWiring from './useSocketWiring';
import { singleCircleBuat, singleSquareBuat } from '../../symbolDrawings/createSocketSymbols';
import { createWireTitle } from '../../utils/createWireTitle'; // az önce yazdığımız
import { useWireTitle } from './useWireTitle';

const useDrawSockets = (scene, camera, renderer) => {
  const dispatch = useDispatch();
  const { commandType } = useSelector((state) => state.operation);
  const { snapPoints } = useSnapPoints(scene);

  const dynamicSnapPoints = useRef([]);
  const wiringActiveRef = useRef(false);
  const sceneRef = useRef(null);
  const placedSocketsRef = useRef([]);
  // const { addTitleToScene } = useWireTitle();

  const getOffsetPositionAtDirection = (base, direction, width = 14, height = 28) => {
    return base.clone().add(
      new THREE.Vector3(-direction.x * (width / 2), -direction.y * (height / 2), 0)
    );
  };

  const handleSocketPlace = (position, direction) => {
    const adjustedPos = getOffsetPositionAtDirection(position, direction);
    const socket = createSingleSocket(sceneRef.current, adjustedPos, direction, 0x0045ff, false, "normal", null, 45);
    const angle = Math.atan2(direction.y, direction.x);
    socket.children[0].rotation.z = angle;

    socket.userData = {
      id: generateUniqueId(),
      type: 'socket',
      isSelectable: true,
      originalColor: 0x0045ff,
      connectedFrom: null,
      connectedTo: position.clone(),
    };

    sceneRef.current.add(socket);
    return socket;
  };

  const handleSocketRemove = (socket) => {
    if (!socket) return;
    sceneRef.current.remove(socket);
    socket.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  };

  const handlePreviewUpdate = (point) => {
    if (!sceneRef.current || !point || placedSocketsRef.current.length < 1) return;

    const lastSocket = placedSocketsRef.current[placedSocketsRef.current.length - 1];
    if (!lastSocket) return;

    const direction = new THREE.Vector3().subVectors(point, lastSocket.userData.connectedTo).normalize();
    const angle = Math.atan2(direction.y, direction.x);

    lastSocket.children[0].rotation.z = angle;
    lastSocket.position.copy(getOffsetPositionAtDirection(point, direction));
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



  const handleWireEnd = (vertices, sockets, source,tempLineUUID) => {
    let panelID = null;
    let wireID = null;
    let branchID
    let totalLength = 0;

    for (let i = 0; i < vertices.length - 1; i++) {
      totalLength += vertices[i].distanceTo(vertices[i + 1]);
    }
    let panel
    let power = 0
    sockets.forEach(soc => power += soc.power)
    let foundPanelOutSnap// = findObjectByUUID(scene, source.no);
    console.log("UseDraw Socket  sockets ----------------------------: ", sockets)
    let title;

    if (source.type === "panelConnection") {
      title = source.p.no
      foundPanelOutSnap = findObjectByUUID(scene, source.p.UUID);
    } else {
      // title= source.parent.no
      foundPanelOutSnap = findObjectByUUID(scene, source.no);
    }
    console.log("foundPanelOutSnap UseDraw Socket  : ", foundPanelOutSnap)

    let foundObject
    if (foundPanelOutSnap.userData.type === "panelCon_out") {
      scene.traverse(obj => {
        if (obj.userData.id === foundPanelOutSnap.userData.panelID) {
          foundObject = obj
          panelID = foundObject.userData.id;
          panel = foundObject
          console.log("FOUND OBJECT  panel=foundObject : ", panel)

        }
      })
    } else if (foundPanelOutSnap.userData.type === "buatCircle") {
      wireID = foundPanelOutSnap.userData.wireID;
      const wireGroup = findWireGroupByID(scene, wireID);
      console.log("FOUND OBJECT wireGroup : ", wireGroup)

      panelID = wireGroup.userData.panelID;
      if(!panelID){
      panelID = foundPanelOutSnap.userData.panelID;

      }
      scene.traverse(obj => {
        if (obj.userData.id === panelID) {
          panel = obj
        }
      })

    } else if (foundPanelOutSnap.userData.type === "polyline") {
      wireID = foundPanelOutSnap.userData.wireID;
      panelID = foundPanelOutSnap.userData.panelID;

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
      const material = new THREE.LineBasicMaterial({ color: 0x0045ff });
      const line = new THREE.Line(geometry, material);
      const generatedWireID = generateUniqueId("wireSocket");
     
 

      line.userData = {
        id: generatedWireID,
        masterId: source.no,
        tempLineId:  tempLineUUID,
        type: 'polyline',
        panelID,
        wireID: generatedWireID,
        function: 'wireSocket',
        isSelectable: true,
        connectedFrom: vertices[0],
        connectedTo: vertices[vertices.length - 1],
        branchID
      };
      socketBuatControl(scene, sockets, 0x0045ff, generatedWireID, branchID);
      if (source.type === "vertex")
       {
        console.log("VERTEX PANEL ID , panelID",panelID,wireID)
        const socketUUID=sockets[sockets.length-1].uuid
        const buat = singleCircleBuat(vertices[0], panelID,socketUUID)
        wireGroup.add(buat)
      }

      wireGroup.add(line)
      if (title) {
        const titleGroup = createWireTitle(vertices[0], title, "#00ffff", vertices, source.p.OutID);
        wireGroup.add(titleGroup);
      }
      sockets.forEach((soc) => {
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
      branchID = generateUniqueId("branchSocket");
      brachGroup.userData.id = branchID
      brachGroup.name = "brachGroup"
      const wireGroup = makeWire();
      const userData = {
        branchID,
        panelID,
        function: "wireSocket",
        power,
        length: totalLength.toFixed(2),
        //  title:5,
        sockets: sockets,
      }
      if (!brachGroup.userData.wireSocket) {
        brachGroup.userData.wireSocket = [];
      }
      brachGroup.userData.wireSocket.push(userData);
      wireGroup.userData = userData;
      wireGroup.name = "wireGroup"
      brachGroup.add(wireGroup);
      panel.userData.outs.push(
        {
          branchID,
          power: sockets.length * 300,
          wires: [{
            length: userData.length,
            sockets: userData.sockets,
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
          wireID,
          function: "wireSocket",
          power,
          length: totalLength.toFixed(2),
          title: 5,
          sockets: sockets,
        };

        wireGroup.userData = userData
        let brachGroup
        scene.traverse(obj => {
          if (obj.userData.id === branchID) {
            brachGroup = obj
            brachGroup.userData.wireSocket.push(userData);
          }
        })

        branchGroup.worldToLocal(wireGroup.position);
        branchGroup.add(wireGroup);
        let outs = panel.userData.outs
        const newWire = {
          length: userData.length,
          sockets: userData.sockets,
          power: userData.power
        }

        let out = outs.find(obj => obj.branchID === branchID)
        out.power += sockets.length * 300
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
      const forwardOffset = normal.clone().setLength(3); // çizgi yönünde 4 birim ileri/geri
      const halfLength = 2.5;

      const positions = [
        mid.clone().sub(forwardOffset),
        mid.clone(),
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

      //    previewMarkersRef.current.push({ startIdx: i, lines: markers });

      /*   } else {
          positions.forEach((centerPoint, j) => {
            const marker = existing.lines[j];
            const start = centerPoint.clone().add(angledDir.clone().multiplyScalar(-halfLength));
            const end = centerPoint.clone().add(angledDir.clone().multiplyScalar(halfLength));
            marker.geometry.setFromPoints([start, end]);
            marker.visible = true;
          });
        } */
    }
  }





  useEffect(() => {
    if (commandType !== 'drawSocket' || !scene || !camera || !renderer) return;

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

  useSocketWiring(
    scene,
    camera,
    renderer,
    [...snapPoints, ...dynamicSnapPoints.current],
    {
      enabled: () => wiringActiveRef.current,
      onWireEnd: handleWireEnd,
      onSocketPlace: handleSocketPlace,
      onSocketRemove: handleSocketRemove,
      onPreviewUpdate: handlePreviewUpdate,
      onWireCancel: () => {
        wiringActiveRef.current = false; // ESC ile iptal edildiğinde devre dışı bırak
      }
    }
  );
};

export default useDrawSockets; 