import * as THREE from 'three';
import { findObjectByUUID } from '../utils/findObjectByUUID'; // veya utils içindeyse doğru path
import { createWireTitle } from '../utils/createWireTitle';
import { generateUniqueId } from '../utils/generateUniqueId';
import { createMachineSymbol } from '../symbolDrawings/createMachines';
 
let polylineVerticesRef = null;
let machineWireVerticesRef = null;
let verticesRef = null;
let tempLineRef = null;

export function setGlobalPolylineVerticesRef(ref) {
  polylineVerticesRef = ref;
}
export function setGlobaVerticesRef(ref) {
  verticesRef = ref;
}
export function setGlobalTempLineRef(ref) {
  tempLineRef = ref;
}
export function setGlobalMachineWireVerticesRef(ref) {
  machineWireVerticesRef = ref;
}

export function applySceneAction(action, scene, direction = 'forward', refs = {}) {
  console.log("ACTION OBJECT ",action)
  const { verticesRef, tempLineRef } = refs;
     const state = direction === 'forward' ? action.after : action.before;
     if (action.type === 'machineWireCreate') {
        console.log("🎯 applySceneAction → machineWireCreate", direction);
      
        const {
          vertices,
          lastPoint,
          sourceUUID,
          title,
          machineType,
          power,
          length,
          machineSymbol,
          wireMarkers
        } = action.after;
      
        if (direction === 'forward') {
          const points = vertices.map(p => new THREE.Vector3(...p));
          const source = findObjectByUUID(scene, sourceUUID);
      
          const branchGroup = new THREE.Group();
          branchGroup.userData = {
            branchID: action.objectUUID,
            function: "machine",
            panelID: null,
            power,
            length
          };
      
          // 🔷 Başlık (title) etiketi
          if (title && source?.p?.OutID) {
            const titleGroup = createWireTitle(points[0], title, "#00ffff", points, source.p.OutID);
            branchGroup.add(titleGroup);
          }
      
          // 🔷 Makine sembolü tekrar oluşturuluyor
          if (machineSymbol) {
            const symbol = createMachineSymbol(
              null,
              new THREE.Vector3(...machineSymbol.position),
              1,
              0,
              false,
              machineSymbol.type
            );
            symbol.userData = {
              type: machineSymbol.type,
              power: machineSymbol.power,
              direction: machineSymbol.direction
            };
            branchGroup.add(symbol);
          }
      
          // 🔷 Wire marker'ları tekrar oluşturuluyor
          if (wireMarkers?.length) {
            wireMarkers.forEach(({ position, text }) => {
              const marker = new THREE.Mesh(
                new THREE.CircleGeometry(3, 16),
                new THREE.MeshBasicMaterial({ color: 0x00ffff })
              );
              marker.position.set(...position);
              marker.userData = { text };
              branchGroup.add(marker);
            });
          }
      
          // 🔷 Asıl polyline çizgisi
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ color: 0x2233ff });
          const line = new THREE.Line(geometry, material);
          line.userData = {
            id: generateUniqueId(),
            type: "polyline",
            isSelectable: true,
            connectedFrom: points[0],
            connectedTo: points[points.length - 1]
          };
      
          branchGroup.add(line);
          scene.add(branchGroup);
      
        } else {
          // 🔴 UNDO: Sahneden grubu çıkar
          const toRemove = scene.children.find(obj => obj.userData?.branchID === action.objectUUID);
          console.log("🔴 UNDO → Removing:", action.objectUUID, "→ Found:", !!toRemove);
      
          if (toRemove) {
            toRemove.traverse(obj => {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) obj.material.dispose();
            });
            scene.remove(toRemove);
          }
        }
      
        return;
      }
      if (action.type === 'polylineWireCreate') {
        if (direction === 'forward') {
          const points = action.after.vertices.map(p => new THREE.Vector3(...p));
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ color: action.after.color || 0x2233ff });
          const line = new THREE.Line(geometry, material);
          line.userData = {
            id: action.objectUUID,
            type: 'polyline',
            isSelectable: true,
          };
          scene.add(line);
        } else {
          const toRemove = scene.getObjectByProperty('uuid', action.objectUUID);
          if (toRemove) {
            toRemove.traverse(obj => {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) obj.material.dispose();
            });
            scene.remove(toRemove);
          }
        }
      
        return;
      }
         
      if (action.type === 'vertexAdd' && action.objectUUID === 'wireTemp') {

        const points = state.map((p) => new THREE.Vector3(p.x, p.y, p.z));
        let tempLine = scene.getObjectByName(action.objectUUID);
        if (verticesRef) {
          verticesRef.current = points;
        }
      
        // tempLine mevcutsa temizle
     //   let tempLine = scene.getObjectByName('wirePolyline');
        if (tempLine) {
          scene.remove(tempLine);
          tempLine.geometry.dispose();
          tempLine.material.dispose();
        }
      console.log("direction ",direction,tempLine)
        // yeniden oluştur
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const newLine = new THREE.Line(geometry, material);
        //newLine.name = 'wirePolyline';
        newLine.name = action.objectUUID;
        if (verticesRef) verticesRef.current = points;
        if (tempLineRef) tempLineRef.current = newLine;
        scene.add(newLine);
      
        if (refs?.tempLineRef) refs.tempLineRef.current = newLine;
      }
      

       
    // ✅ Önce machineWireTemp için kontrol
    if (action.type === 'vertexAdd' && action.objectUUID === 'machineWireTemp') {
      const points = state.map(p => new THREE.Vector3(...p));
  
      if (machineWireVerticesRef) {
        machineWireVerticesRef.current = points;
      }
  
      let tempLine = scene.getObjectByName('tempMachineWirePreview');
      if (tempLine) {
        scene.remove(tempLine);
        tempLine.geometry.dispose();
        tempLine.material.dispose();
      }
  
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const newLine = new THREE.Line(geometry, material);
      newLine.name = 'tempMachineWirePreview';
      scene.add(newLine);
      return; // ✅ burada çık
    }
  
    // 💡 polyline için ayrı kontrol
    if (action.type === 'vertexAdd' && action.objectUUID === 'polylineDrawing') {
      const points = state.map(p => new THREE.Vector3(...p));
  
      if (polylineVerticesRef) {
        polylineVerticesRef.current = points;
      }
  
      let tempLine = scene.getObjectByName('tempPolylinePreview');
      if (tempLine) {
        scene.remove(tempLine);
        tempLine.geometry.dispose();
        tempLine.material.dispose();
      }
  
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const newLine = new THREE.Line(geometry, material);
      newLine.name = 'tempPolylinePreview';
      scene.add(newLine);
      return;
    }
  
    // 🔁 diğer işlemler (create, delete, modify)
    const target = scene.getObjectByProperty('uuid', action.objectUUID);
    if (!target && !action.after?.object) return;
  
    if (action.type === 'create') {
      if (direction === 'forward') {
        scene.add(state.object);
      } else {
        const toRemove = scene.getObjectByProperty('uuid', action.objectUUID);
        if (toRemove) {
          toRemove.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          scene.remove(toRemove);
        }
      }
    }
  
    if (action.type === 'delete') {
      if (direction === 'forward') {
        const toRemove = scene.getObjectByProperty('uuid', action.objectUUID);
        if (toRemove) {
          toRemove.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          scene.remove(toRemove);
        }
      } else {
        scene.add(state.object);
      }
    }
  
    if (action.type === 'modify') {
      if (!target) return;
      if (state.position) {
        target.position.set(state.position.x, state.position.y, state.position.z);
      }
      if (state.rotation) {
        target.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
      }
    }

      
      
      
  }
  



