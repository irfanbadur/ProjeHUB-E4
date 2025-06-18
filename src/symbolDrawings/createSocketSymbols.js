//src/symbolDrawings/createSocketSymbols.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function createSingleSocket(
  scene,
  mousePos,
  dir = 1,
  color = 0x0045ff,
  isPreview = false,
  type = "kapaklı",
  tempLineUUID,
  rotateValue
) {
  const group = new THREE.Group();
  const offsetGroup = new THREE.Group();
  dir = dir ?? 1;
  const width = 14;
  const height = 28;
  const rotationGizmoColor = isPreview ? 0x3333ff : 0x00ffff;
  const strechGizmoColor = isPreview ? 0x33ff33 : 0x00ffff;
  const symetricGizmoColor = isPreview ? 0xff3aa3 : 0x00ffff;
  const moveGizmoColor = isPreview ? 0xff3223 : 0x00ffff;
  const innerRadius = 2;
  const basePoint = { x: mousePos.x, y: mousePos.y };
  const socketId = generateUniqueId('socket');
  group.userData = {
    id: socketId,
    type: 'socket',
    isSelectable: true,
    isPreview: isPreview,
    connectedTo: null,
    basePoint,
    tempLineUUID,
    power: 300,
    rotate: rotateValue,
    stretchLength :0
  }; 
  group.position.set(basePoint.x, basePoint.y, 0);
  group.add(offsetGroup); 
  const lineMaterial = new THREE.LineBasicMaterial({ color: color });

  // Dikey çizgi
  const line1Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 21, 0),
  ]);
  const line1 = new THREE.Line(line1Geo, lineMaterial);
  line1.userData = { originalColor: lineMaterial.color.getHex(), role: 'line1', socketId };
  offsetGroup.add(line1);

  // Yatay çizgi
  const line2Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-7, 21, 0),
    new THREE.Vector3(7, 21, 0),
  ]);
  const line2 = new THREE.Line(line2Geo, lineMaterial);
  line2.userData = { originalColor: lineMaterial.color.getHex(), role: 'line2', socketId };
  offsetGroup.add(line2);



  // Yeni: Kapaklı priz için line3 ekle
  if (type === 'kapaklı') {
    const line3Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 21, 0),
      new THREE.Vector3(0, 28, 0),
      new THREE.Vector3(7, 28, 0),
    ]);
    const line3 = new THREE.Line(line3Geo, lineMaterial);
    line3.userData = { originalColor: lineMaterial.color.getHex(), role: 'line3', socketId };
    offsetGroup.add(line3);
  }

  // Yeni: Etanj priz için çeyrek daire dolgu ekle
  if (type === 'etanj') {
    const etanjShape = new THREE.Shape();
    etanjShape.moveTo(0, 0);
    etanjShape.absarc(0, 0, 7, 0, Math.PI / 2, false);
    etanjShape.lineTo(0, 0);

    const geometry = new THREE.ShapeGeometry(etanjShape);
    const material = new THREE.MeshBasicMaterial({ color: lineMaterial.color.getHex(), side: THREE.DoubleSide });
    const etanjFill = new THREE.Mesh(geometry, material);
    etanjFill.position.set(0, 28, 0);
    etanjFill.rotation.z = Math.PI; // çeyrek yayın içeriye dönük olması için
    etanjFill.userData = { role: 'etanjFill', socketId };
    offsetGroup.add(etanjFill);
  }


  const createFilledTriangle = (p1, p2, p3, color) => {
    const shape = new THREE.Shape();
    shape.moveTo(p1.x, p1.y);
    shape.lineTo(p2.x, p2.y);
    shape.lineTo(p3.x, p3.y);
    shape.lineTo(p1.x, p1.y); // üçgeni kapat

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
  };
  const createFilledTetragon = (p1, p2, p3, p4, color) => {
    const shape = new THREE.Shape();
    shape.moveTo(p1.x, p1.y);
    shape.lineTo(p2.x, p2.y);
    shape.lineTo(p3.x, p3.y);
    shape.lineTo(p4.x, p4.y);
    shape.lineTo(p1.x, p1.y); // üçgeni kapat

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
  };
  const createFilledCircle = (radius, color) => {
    const geometry = new THREE.CircleGeometry(radius, 64);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
  };


  const strechGizmoP1 = new THREE.Vector3(10, 31, 0);
  const strechGizmoP2 = new THREE.Vector3(7, 34, 0);
  const strechGizmoP3 = new THREE.Vector3(4, 31, 0);
  const strechGizmo = createFilledTriangle(strechGizmoP1, strechGizmoP2, strechGizmoP3, strechGizmoColor)
  const symetricGizmoP1 = new THREE.Vector3(-10, 33, 0);
  const symetricGizmoP2 = new THREE.Vector3(-7, 36, 0);
  const symetricGizmoP3 = new THREE.Vector3(-4, 33, 0);
  const symetricGizmoP4 = new THREE.Vector3(-7, 30, 0);

  const symetrical = createFilledTetragon(symetricGizmoP1, symetricGizmoP2, symetricGizmoP3, symetricGizmoP4, symetricGizmoColor)

  const moveGizmoP1 = new THREE.Vector3(7, 7, 0);
  const moveGizmoP2 = new THREE.Vector3(7, 13, 0);
  const moveGizmoP3 = new THREE.Vector3(13, 13, 0);
  const moveGizmoP4 = new THREE.Vector3(13, 7, 0);

  const moveGizmo = createFilledTetragon(moveGizmoP1, moveGizmoP2, moveGizmoP3, moveGizmoP4, moveGizmoColor)

  const innerCircle = createFilledCircle(innerRadius, rotationGizmoColor);
  innerCircle.userData = {
    type: 'rotateGizmo',
    parentSocketId: group.userData.id,
  };
  symetrical.userData = {
    type: 'symetricGizmo',
    parentSocketId: group.userData.id,
  };
  strechGizmo.userData = {
    type: 'stretchGizmo',
    parentSocketId: group.userData.id,
  };
  moveGizmo.userData = {
    type: 'moveGizmo',
    parentSocketId: group.userData.id,
  };
  innerCircle.position.set(width / 2 - 7, height + 5, 0.2);



  innerCircle.visible = false
  strechGizmo.visible = false
  symetrical.visible = false
  moveGizmo.visible = false


  offsetGroup.add(innerCircle);
  offsetGroup.add(strechGizmo);
  offsetGroup.add(symetrical);
  offsetGroup.add(moveGizmo);


  // Yarım yay
  const arcRadius = 7;
  const arcCenter = new THREE.Vector3(0, 28, 0);
  const arcPoints = [];
  for (let i = 0; i <= 16; i++) {
    const angle = -Math.PI * (i / 16);
    const x = arcCenter.x + arcRadius * Math.cos(angle);
    const y = arcCenter.y + arcRadius * Math.sin(angle);
    arcPoints.push(new THREE.Vector3(x, y, 0));
  }
  const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
  const arcLine = new THREE.Line(arcGeometry, lineMaterial);
  arcLine.userData = { originalColor: lineMaterial.color.getHex(), role: 'arc' };

  offsetGroup.add(arcLine);

  // 🔧 Offset uygulaması (merkez uca oturtulacak)
  offsetGroup.scale.set(1, dir, 1); // dir parametresi burada kullanıldı
  offsetGroup.position.set(0, 0, 0);
  offsetGroup.rotation.z  = rotateValue*Math.PI/180
    if (dir instanceof THREE.Vector3) {
      const angle = Math.atan2(dir.y, dir.x); // Radyan cinsinden açı
      group.rotation.z +=  angle ;
    }
 /*  if (scene && !isPreview) {
    scene.add(group);
  } */

  return group;
}

export function socketBuatControl(
  scene,
  sockets,
  color = 0x0045ff,
  generatedWireID,
  branchID
) {
  const createFilledCircle = (radius, color) => {
    const geometry = new THREE.CircleGeometry(radius, 64);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
  };

  sockets.forEach((socket, s) => {
    if (s < sockets.length - 1) {
      const buatCircle = createFilledCircle(2, color);
      buatCircle.userData = {
        type: 'buatCircle',
        socketUUID: socket.uuid,
        wireID: generatedWireID,
        branchID
      };
      buatCircle.position.set(socket.position.x, socket.position.y, 0.2);
      if (scene) {
        scene.add(buatCircle);
      }
    }
  });

}
export function singleCircleBuat(

  point, panelID,
  socketUUID,
  color = 0x0045ff,
) {
  const createFilledCircle = (radius, color) => {
    const geometry = new THREE.CircleGeometry(radius, 64);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
  };

  const buatCircle = createFilledCircle(2, color);
  buatCircle.userData = {
    socketUUID,
    type: 'buatCircle',
    panelID

  };
  buatCircle.position.set(point.x, point.y, 0);
  return buatCircle

}

export function singleSquareBuat(
  scene,
  point,
  color = 0x0045ff,
  uuid
) {
  console.log(" singleSquareBuat uuid ", uuid)
  const square = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );
  square.position.set(point.x, point.y, 0.2);
  square.userData = {
    type: 'buatSquare',
    socketUUID: uuid,

  };
  scene.add(square);


}