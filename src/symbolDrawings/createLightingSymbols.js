//src/symbolDrawings/createLightSwichSymbols.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

export function createLightSwich(
  scene,
  mousePos,
  dir = 1,
  color = 0x00ffff,
  isPreview = false,
  type = "normal",
  tempLineUUID,
  rotateValue=0
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
  const LightSwichId = generateUniqueId('LightSwitch');
  
  group.userData = {
    id: LightSwichId,
    type: 'LightSwitch',
    isSelectable: true,
    isPreview: isPreview,
    connectedTo: null,
    basePoint,
    tempLineUUID,
    power: 1,    
    rotate:rotateValue
  };
  group.position.set(basePoint.x, basePoint.y, 0);
  const lineMaterial = new THREE.LineBasicMaterial({ color: isPreview ? color : 0x00ffff });
  // Dikey çizgi buat ile daire arası ilk yaaty çizgi
  const line1Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 15, 0),
  ]);

  const line1 = new THREE.Line(line1Geo, lineMaterial);
  line1.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_line1' }; // LightSwichLine1
  offsetGroup.add(line1);

  if (type.includes('normal')) {

    // Yatay çizgi daireden sonraki
    const line2Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 27, 0),
      new THREE.Vector3(0, 42, 0),
      new THREE.Vector3(5, 42, 0),
    ]);
    const line2 = new THREE.Line(line2Geo, lineMaterial);
    line2.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_line2' };
    offsetGroup.add(line2);
  }
  if (type.includes('Komütatör')) {

    // Yatay çizgi daireden sonraki
    const line2Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2.92, 26.6, 0),
      new THREE.Vector3(10.7, 39.11, 0),
      new THREE.Vector3(15.02, 36.58, 0),
    ]);
    const line2 = new THREE.Line(line2Geo, lineMaterial);

    line2.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_line2' };
    offsetGroup.add(line2);
    //------------------------------------
    // Yatay çizgi
    const line3Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.92, 26.6, 0),
      new THREE.Vector3(-10.7, 39.11, 0),
      new THREE.Vector3(-15.02, 36.58, 0),
    ]);
    const line3 = new THREE.Line(line3Geo, lineMaterial);
    line3.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_line3' };
    offsetGroup.add(line3);
  }
  if (type === 'vaviyen') {

    // Yatay çizgi daireden sonraki
    const line2Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2.92, 26.6, 0),
      new THREE.Vector3(10.7, 39.11, 0),
      new THREE.Vector3(15.02, 36.58, 0),
    ]);
    const line2 = new THREE.Line(line2Geo, lineMaterial);

    line2.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_line2' };
    offsetGroup.add(line2);
    //------------------------------------
    // Yatay çizgi
    const line3Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.92, 26.6, 0),
      new THREE.Vector3(-10.7, 39.11, 0),
      new THREE.Vector3(-6.07, 41.69, 0),
    ]);
    const line3 = new THREE.Line(line3Geo, lineMaterial);
    line3.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_line3' };
    offsetGroup.add(line3);
  }

  // Yeni: Etanj priz için çeyrek daire dolgu ekle
  if (type.includes('etanj')) {
    const etanjShape = new THREE.Shape();
    etanjShape.moveTo(0, 0);
    etanjShape.absarc(0, 0, 6, 0, Math.PI, false);
    etanjShape.lineTo(0, 0);
    const geometry = new THREE.ShapeGeometry(etanjShape);
    const material = new THREE.MeshBasicMaterial({ color: lineMaterial.color.getHex(), side: THREE.DoubleSide });
    const etanjFill = new THREE.Mesh(geometry, material);
    etanjFill.position.set(0, 21, 0);
    etanjFill.rotation.z = Math.PI; // çeyrek yayın içeriye dönük olması için
    etanjFill.userData = { role: 'etanjFill' };
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
    parentLightSwichId: group.userData.id,
  };
  symetrical.userData = {
    type: 'symetricGizmo',
    parentLightSwichId: group.userData.id,
  };
  strechGizmo.userData = {
    type: 'stretchGizmo',
    parentLightSwichId: group.userData.id,
  };
  moveGizmo.userData = {
    type: 'moveGizmo',
    parentLightSwichId: group.userData.id,
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


  //------------DAİRE-------------------------- 
  const circleRadius = 6;
  const circleCenter = new THREE.Vector3(0, 21, 0);
  const circlePoints = [];
  const segments = 32; // daha düzgün daire için segment sayısını artırdım

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2; // 0'dan 2π'ya kadar
    const x = circleCenter.x + circleRadius * Math.cos(angle);
    const y = circleCenter.y + circleRadius * Math.sin(angle);
    circlePoints.push(new THREE.Vector3(x, y, 0));
  }

  // Burada Line yerine LineLoop kullanıyoruz
  const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
  const circleLine = new THREE.LineLoop(circleGeometry, lineMaterial);

  circleLine.userData = { originalColor: lineMaterial.color.getHex(), role: 'LS_circle' };

  offsetGroup.add(circleLine);
  //--------------------------------------------------------------------
  
  group.add(offsetGroup);
  group.rotation.z=rotateValue

  if (scene && !isPreview) {
    scene.add(group);
  }

  return group;
}
 
export function singleCircleBuatForLight(
  scene,
  point,
  color = 0x00ffff,
  uuid
) {
  
    const geometry = new THREE.CircleGeometry(2, 64);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }); 
    const buatCircle = new THREE.Mesh(geometry, material);  
    buatCircle.position.set(point.x, point.y, 0.2);
    buatCircle.name="lightingBuat"
  buatCircle.userData = {
    type: 'buatLightingCircle', //buatLightingCircle
    LightSwichUUID: uuid,
    snapType: 'lightingBuat',
  };
console.log("SİNGLE BUAT : ", buatCircle.userData)
  return  buatCircle
 

}
export function singleSquareBuat(
  scene,
  point,
  color = 0x00ffff,
  uuid
) { 
  const square = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );
  square.position.set(point.x, point.y, 0.2);
  square.name="lightingBuat"
  square.userData = {
    type: 'buatLightingSquare',
    LightSwichUUID: uuid,
    snapType: 'lightingBuat',

  };
  return  square


}

 