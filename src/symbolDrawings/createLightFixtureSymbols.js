//src/symbolDrawings/createLightSwichSymbols.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';
import { drawTextFromCode } from '../commands/drawTextFromCode';
export function createLightFixture(
  scene,
  mousePos,
  dir = 1,
  color = 0x00ffff,
  isPreview = false,
  symbol = "normal",
  tempLineUUID,
  rotateValue=0,
  fixtureId      = null
   
) {
  const group = new THREE.Group();
  const textGroup = new THREE.Group();
  const offsetGroup = new THREE.Group();
  const LightSwichId    = fixtureId || generateUniqueId('LightFixture');
  offsetGroup.name="offsetGroup"
  dir = dir ?? 1;
  const radius = 16;
  const height = 28; 
  const basePoint = { x: mousePos.x, y: mousePos.y };
  const rotationGizmoColor = isPreview ? 0x3333ff : 0x00ffff;
  
  group.userData = {
    id: LightSwichId,
    type: 'LightFixture',
    isSelectable: true,
    isPreview: isPreview,
    connectedTo: null,
    basePoint,
    tempLineUUID,
    power: "10W",    
    lampPower: 18,    
    lampCount: 1,    
    fixtureType:"B2",
    description:"",
    rotate:rotateValue,
    symbol:"normal"

  };
  group.position.set(basePoint.x, basePoint.y, 0);
  const lineMaterial = new THREE.LineBasicMaterial({ color: isPreview ? color : 0x00ffff });
  // Dikey çizgi buat ile daire arası ilk yaaty çizgi
   //------------DAİRE-------------------------- 
   const createCircle=(radius,color,position)=>{ 
    const circleRadius = radius||16;
    const circleCenter = position ;
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
    return circleLine
  }


  if (symbol===('normal')) {
    const circle=createCircle(radius,color,{x:0,y:0,z:0})  
    offsetGroup.add(circle);
    // Yatay çizgi daireden sonraki
    const line1Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, radius, 0),
      new THREE.Vector3(0, -radius, 0),
    ]);
    const line1 = new THREE.Line(line1Geo, lineMaterial);
    line1.userData = { originalColor: lineMaterial.color.getHex(), role: 'LF_line3' };
    offsetGroup.add(line1);

    const line2Geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-radius, 0, 0),
      new THREE.Vector3(radius, 0, 0),
    ]);
    const line2 = new THREE.Line(line2Geo, lineMaterial);
    line2.userData = { originalColor: lineMaterial.color.getHex(), role: 'LF_line2' };
    offsetGroup.add(line2);


  }else if (symbol===('etanj')) {
    const circle=createCircle(radius,color,{x:0,y:0,z:0})  
    offsetGroup.add(circle);
    // Yatay çizgi daireden sonraki
    const etanjShape = new THREE.Shape();
    etanjShape.moveTo(0, 0);
    etanjShape.absarc(0, 0, radius, 0, Math.PI, false);
    etanjShape.lineTo(0, 0);
    const geometry = new THREE.ShapeGeometry(etanjShape);
    const material = new THREE.MeshBasicMaterial({ color: lineMaterial.color.getHex(), side: THREE.DoubleSide });
    const etanjFill = new THREE.Mesh(geometry, material);
    offsetGroup.add(etanjFill);  
  
  }else if (symbol===('Asma Tavan Kare Floresans')) {
    const squarePoints = [
      new THREE.Vector3(-30, -30, 0),
      new THREE.Vector3(-30,  30, 0),
      new THREE.Vector3( 30,  30, 0),
      new THREE.Vector3( 30, -30, 0),      
    ];
    const square = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(squarePoints),
      new THREE.LineBasicMaterial({ color: isPreview ? 0xcccccc : 0xffffff })
    );
    offsetGroup.add(square);
for(var a=-1;a<=2 ;a++){
    const squarePoints2 = [
      new THREE.Vector3(-25, (a*12.5), 0),
      new THREE.Vector3(-25, (a*12.5-8), 0),
      new THREE.Vector3(25,  (a*12.5-8), 0),
      new THREE.Vector3( 25,   (a*12.5), 0),      
    ];
    const square2 = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(squarePoints2),
      new THREE.LineBasicMaterial({ color: isPreview ? 0xcccccc : 0xffffff })
    );
    offsetGroup.add(square2); 
  }
  
  }else if (symbol===('Kare Led Spot')) {
    const squarePoints = [
      new THREE.Vector3(-30, -30, 0),
      new THREE.Vector3(-30,  30, 0),
      new THREE.Vector3( 30,  30, 0),
      new THREE.Vector3( 30, -30, 0),
      
    ];
    const square = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(squarePoints),
      new THREE.LineBasicMaterial({ color: isPreview ? 0xcccccc : 0xffffff })
    );
    offsetGroup.add(square);
    const squarePoints2 = [
      new THREE.Vector3(-25, 25, 0),
      new THREE.Vector3(-25, 0, 0),
      new THREE.Vector3(25,  0, 0),
      new THREE.Vector3( 25,  -25, 0),
      new THREE.Vector3( -25, -25, 0),
      new THREE.Vector3( -25, 25, 0),
      new THREE.Vector3( 25, 25, 0),
      new THREE.Vector3( 25, -25, 0),
      new THREE.Vector3( 0, -25, 0),
      new THREE.Vector3( 0, 25, 0),
      
    ];
    const square2 = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(squarePoints2),
      new THREE.LineBasicMaterial({ color: isPreview ? 0xcccccc : 0xffffff })
    );
    offsetGroup.add(square2);
  
  }else  if (symbol===('Yuvarlak Led Spot')) {
    const circle=createCircle(18,color,{x:0,y:0,z:0})  
    offsetGroup.add(circle);
    const circle2=createCircle(13,color,{x:0,y:0,z:0})  
    offsetGroup.add(circle2);
 

 }else  if (symbol===('Yuvarlak Led Spot-Etanj')) {
    const circle=createCircle(18,color,{x:0,y:0,z:0})  
    offsetGroup.add(circle);
    const circle2=createCircle(13,color,{x:0,y:0,z:0})  
    offsetGroup.add(circle2);
    const etanjShape = new THREE.Shape();
    etanjShape.moveTo(0, 0);
    etanjShape.absarc(0, 0, 13, 0, Math.PI, false);
    etanjShape.lineTo(0, 0);
    const geometry = new THREE.ShapeGeometry(etanjShape);
    const material = new THREE.MeshBasicMaterial({ color: lineMaterial.color.getHex(), side: THREE.DoubleSide });
    const etanjFill = new THREE.Mesh(geometry, material);
    offsetGroup.add(etanjFill);  
 
 }else  if (symbol===('aplik')) {
  const circle=createCircle(12,color,{x:0,y:24,z:0})  
  offsetGroup.add(circle);
  const linePoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0,  6, 0),
    new THREE.Vector3( -6, 6, 0),
    new THREE.Vector3( 6, 6, 0),
    new THREE.Vector3( 0, 6, 0),
    new THREE.Vector3( 0, 12, 0),    
  ];
  const polyLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(linePoints),
    new THREE.LineBasicMaterial({ color: isPreview ? color : 0xffffff })
  );
  offsetGroup.add(polyLine);
  const linePoints1 = [
    new THREE.Vector3(-8.4853, 15.5147, 0),
    new THREE.Vector3(8.4853,  32.4853, 0),
  ];
  const line1 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(linePoints1),
    new THREE.LineBasicMaterial({ color: isPreview ? color : 0xffffff })
  );
  offsetGroup.add(line1);
  const linePoints2 = [
    new THREE.Vector3(8.4853, 15.5147, 0),
    new THREE.Vector3(-8.4853,  32.4853, 0),
  ];
  const line2 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(linePoints2),
    new THREE.LineBasicMaterial({ color: isPreview ? color: 0xffffff })
  );
  offsetGroup.add(line2);
  
 }else  if (symbol===('tablo')) {
  const squarePoints = [
    new THREE.Vector3(-38, -13, 0),
    new THREE.Vector3(-38,  -17, 0),
    new THREE.Vector3( 38,  -17, 0),
    new THREE.Vector3( 38, -11, 0),
    new THREE.Vector3( -38, -11, 0),
    new THREE.Vector3( -38, -13, 0),
    new THREE.Vector3( -40, -13, 0),
    new THREE.Vector3( -40, -5, 0),
    new THREE.Vector3( 4, -5, 0),
    new THREE.Vector3( 4, 0, 0),
    new THREE.Vector3( -4, 0, 0),
    new THREE.Vector3( -4, -5, 0),
    new THREE.Vector3( 40, -5, 0),
    new THREE.Vector3( 40, -13, 0),
    new THREE.Vector3( 38, -13, 0),
    
  ];
  const square = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(squarePoints),
    new THREE.LineBasicMaterial({ color: isPreview ? 0xcccccc : 0xffffff })
  );
  offsetGroup.add(square);
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
  textGroup.rotation.z = -rotateValue
  
if(group.userData.fixtureType){
  const label = drawTextForFixture(group.userData.fixtureType, { x: 40, y: 30 }, 0);
  label.name="textType"
  textGroup.add(label);
}

  if(group.userData.power){
  const label2 = drawTextForFixture(group.userData.power, { x: 40, y: 15 }, 0);
  label2.name="textPower"
  textGroup.add(label2);
}

  if(group.userData.description){
  const label3 = drawTextForFixture(group.userData.description, { x: 40, y: 0 }, 0);
  label3.name="textDesc"
  textGroup.add(label3);
  }

  //--------------------------------------------------------------------
  const innerCircle = createFilledCircle(2, rotationGizmoColor);
  innerCircle.userData = {
    type: 'rotateGizmo',
   // parentFixtureId: group.userData.id,
    parentFixtureId: LightSwichId,
  }; 
  innerCircle.visible = false
  innerCircle.position.set(0, -25, 0.2);

  offsetGroup.add(innerCircle);
// Sonra o açıyı Z ekseni etrafında rotasyona uygulayın:
  
  group.add(textGroup);
  textGroup.name="textGroup"
  
  group.add(offsetGroup);
  group.rotation.z=rotateValue
//------------------------------------------------

  if (scene && !isPreview) {
    scene.add(group);
  }

  return group;
}
 function drawTextForFixture(text, position,  rotationRad = 0, fontSize = 18) {
   const dummyScene = new THREE.Scene(); // Sahte sahne
   const group = drawTextFromCode(dummyScene, {
     text,
     position,  
     fontSize,
     color: "#ffffff",
     alignment : 'center',
     halign:1,
     valign: 0,
     rotation: (rotationRad * 180) / Math.PI,
   });
    if (!group || !(group instanceof THREE.Object3D)) {
     console.warn("drawTextForMachine failed to return valid Object3D.");
     return new THREE.Group(); // boş grup döndür
   } 
   return group;
 }
 
 
 