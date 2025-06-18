import * as THREE from 'three';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCommandMessage, resetOperation } from '../../redux/operationSlice';
import useMachineWiring from './useMachineWiring';
import { createMachineSymbol } from '../../symbolDrawings/createMachines';
import { generateUniqueId } from '../../utils/generateUniqueId';
import useSnapPoints from '../useSnapPoints';
import { createWireTitle } from '../../utils/createWireTitle'; // az önce yazdığımız
import { addAction } from '../../redux/operationHistorySlice';

const useDrawMachine = (scene, camera, renderer) => {
  const dispatch = useDispatch();
  const { commandType } = useSelector((state) => state.operation);
  const { snapPoints } = useSnapPoints(scene);

  const dynamicSnapPoints = useRef([]);
  const previewMachineRef = useRef(null);
  const verticesRef = useRef(null);
  const wiringActiveRef = useRef(false);
  const sceneRef = useRef(null); // ✅ scene'i güvenli saklamak için

    const getOffsetPositionAtDirection = (base, direction, width = 50, height = 50) => {
      return base.clone().add(
        new THREE.Vector3(-direction.x * (width / 2), -direction.y * (height / 2), 0)
      );
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
  
 
  
  useEffect(() => {
    if (commandType !== 'drawWashingMach' || !scene || !camera || !renderer) return;

    dispatch(setCommandMessage('Makineyi bağlamak için hatta tıklayın'));

    sceneRef.current = scene; // 🔁 güvenli erişim için sakla

    // Sadece panel çıkışlarını snap noktası olarak al
    dynamicSnapPoints.current = [];
    scene.traverse(obj => {
      if (obj.userData?.connectionPoints) {
        obj.userData.connectionPoints.forEach(p => {
          if (p.type === 'panelCon_out') {
            const worldPos = p.position.clone().applyMatrix4(obj.matrixWorld);
            dynamicSnapPoints.current.push({
              no: obj.uuid,
              position: worldPos,
              type: 'panelConnection'
            });
          }
        });
      }
    });

    wiringActiveRef.current = true;
  }, [commandType, scene, camera, renderer]);

  useMachineWiring(
    scene,
    camera,
    renderer,
    [...snapPoints, ...dynamicSnapPoints.current], // birleşik snap listesi
    {
      enabled: () => wiringActiveRef.current,
  
      onPreviewUpdate: (point) => {
        if (!sceneRef.current || !point || !verticesRef.current || verticesRef.current.length < 1) return;
      
        const p1 = verticesRef.current[verticesRef.current.length - 1];
        const p2 = point;
        const direction = new THREE.Vector3().subVectors(p2, p1);
        const adjustedPos = getOffsetPositionAtDirection(p2, direction, 50, 50);
      
        if (previewMachineRef.current) {
          sceneRef.current.remove(previewMachineRef.current);
          previewMachineRef.current.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
          previewMachineRef.current = null;
        }
      
        const preview = createMachineSymbol(null, adjustedPos, 1, 0, true);
        sceneRef.current.add(preview);
        previewMachineRef.current = preview;
      },
      onWireEnd: (vertices, lastPoint, source, machine,machineSymboll,wireMarkers) => {
        let panelID = null;
        const power = machine.power;
        const machineType = machine.type;
        let branchID;
        let totalLength = 0;
        let foundPanelOutSnap;
        let title;
      
        for (let i = 0; i < vertices.length - 1; i++) {
          totalLength += vertices[i].distanceTo(vertices[i + 1]);
        }
      
        if (source.type === "panelConnection") {
          title = source.p.no;
          foundPanelOutSnap = findObjectByUUID(scene, source.p.UUID);
        } else {
          foundPanelOutSnap = findObjectByUUID(scene, source.no);
        }
      
        const panel = source?.userData?.sourceObject ?? foundPanelOutSnap;
      
        // ✅ Serializable veriyi kaydedecek payload objesi
        function sanitizeMachines(machines) {
          return machines.map(machine => ({
            ...machine,
            position: Array.isArray(machine.position) ? machine.position : machine.position?.toArray(),
            direction: Array.isArray(machine.direction) ? machine.direction : machine.direction?.toArray()
          }));
        }
        
        const payload = {
          type: 'machineWireCreate',
          objectUUID: generateUniqueId(),
          after: {
            vertices: vertices.map(v => v.toArray()),
            lastPoint: sanitizeMachines(lastPoint),
            sourceUUID: source.no,
            title: title ?? '',
            machineType,
            power,
            length: totalLength.toFixed(2),
        
            // 🔽 Eklenen görsel bileşen verileri (redo için şart)
            machineSymbol: {
              position: machineSymboll.position.toArray(),
              direction: machineSymboll.userData?.direction ?? [1, 0, 0],
              power: machineSymboll.userData?.power ?? 0,
              type: machineSymboll.userData?.type ?? '',
            },
            wireMarkers: wireMarkers.map(marker => ({
              position: marker.position.toArray(),
              text: marker.userData?.text ?? '',
            }))
          }
        };
        
        
        dispatch(addAction({
          type: 'polylineWireCreate',
          objectUUID: branchID,
          after: {
            vertices: vertices.map(v => v.toArray()),
            color: 0x2233ff
          }
        }));
        
        
 
      
       
        // 💡 Artık sadece sahneye ekle (eski kodun olduğu gibi)
        const branchGroup = new THREE.Group();
        sceneRef.current.add(branchGroup);
        
        branchID = payload.objectUUID;
      
        branchGroup.userData = {
          branchID,
          panelID,
          function: "machine",
          power,
          length: payload.after.length
        };
      
        if (title) {
          const titleGroup = createWireTitle(vertices[0], title, "#00ffff", vertices, source.p.OutID);
         }
 
        const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
        const material = new THREE.LineBasicMaterial({ color: 0x2233ff });
      
        const line = new THREE.Line(geometry, material);
        line.userData = {
          id: generateUniqueId(),
          type: "polyline",
          isSelectable: true,
          connectedFrom: vertices[0],
          connectedTo: lastPoint
        };
      
        panel.userData.outs.push({
          branchID,
          power,
          branchType: "machine",
          description: machineType,
          length: payload.after.length,
          power: payload.after.power
        });
      
        branchGroup.add(line);
      
        dispatch(setCommandMessage('Makine yerleştirildi'));
        dispatch(resetOperation());
        wiringActiveRef.current = false;
      }
      
 
      
      
    }
  );

  
};

export default useDrawMachine;

