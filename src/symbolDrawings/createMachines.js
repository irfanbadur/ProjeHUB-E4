import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';
import { createTextSprite } from '../utils/createTextSprite';
import { drawTextFromCode } from '../commands/drawTextFromCode';
import { drawPolylineFromCode } from '../commands/drawPolylineFromCode';
import { drawCircleFromCode } from '../commands/drawCircleFromCode'; 

export function createMachineSymbol(
  scene = null, 
  mousePos, 
  dir = 1, 
  color, 
  isPreview = false,
  type="Bulaşık Makinası",
  power="0",
  angle

) {
  const group = new THREE.Group();
  const offsetGroup = new THREE.Group();

  const boxSize = 50;
  const outerRadius = 20;
  const middleRadius = 12;
  const filledPointRadius = 5 ;
  const innerRadius = 9;
  const colorResult = isPreview ? 0xcc5600 :color;
 
  const basePoint = { x: mousePos.x, y: mousePos.y };
  const machineId = generateUniqueId('machine');

  group.position.set(basePoint.x, basePoint.y, 0); 
 // offsetGroup.position.set(-boxSize / 2, 0, 0);
 // Çizgisel daire fonksiyonu
 console.log(" MACHINES TYPE :",mousePos,type,dir,power,angle)
 group.userData = {
   id: machineId,
   type: 'machine',
   isSelectable: true,
   isPreview: isPreview,
   power: power,
   stretchLength :0,
   machineType:type,
   isPanelPreview: isPreview,
   basePoint,
   connectionPoints: [],
   angle,
   dir
  };
  group.add(offsetGroup);

  // Kare çizimi
  const squarePoints = [
    new THREE.Vector3(0, -boxSize / 2, 0),
    new THREE.Vector3(0, boxSize / 2, 0),
    new THREE.Vector3(boxSize, boxSize / 2, 0),
    new THREE.Vector3(boxSize, -boxSize / 2, 0)
  ];
  const square = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(squarePoints),
    new THREE.LineBasicMaterial({ color: colorResult})
  );
  offsetGroup.add(square);
if(type==="Çamaşır Makinası"){
  // Büyük ve küçük içi boş daireleri oluştur
  const outerCircle = createCircleOutline(outerRadius, colorResult);
  outerCircle.position.set(boxSize / 2, 0, 0.1); // hafif yukarı
  offsetGroup.add(outerCircle);

  const innerCircle = createCircleOutline(innerRadius, colorResult);
  innerCircle.position.set(boxSize / 2, 0, 0.2);
  offsetGroup.add(innerCircle);

}else if(type==="Bulaşık Makinası"){
    // Büyük ve küçük içi boş daireleri oluştur
  const outerCircle = createCircleOutline(outerRadius, colorResult);
  outerCircle.position.set(boxSize / 2, 0, 0.1); // hafif yukarı
  offsetGroup.add(outerCircle);
  const innerLinePoints1 = [
    new THREE.Vector3(39.14, 14.14, 0),
    new THREE.Vector3(50,25, 0),
  ];
  const innerLine1 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerLinePoints1),
    new THREE.LineBasicMaterial({ color: colorResult })
  );
  offsetGroup.add(innerLine1);
  const innerLinePoints2 = [  
    new THREE.Vector3(39.14, -14.14, 0),
    new THREE.Vector3(50,-25, 0),
  ];
  const innerLine2 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerLinePoints2),
    new THREE.LineBasicMaterial({ color: colorResult})
  );
  offsetGroup.add(innerLine2);
  const innerLinePoints3 = [
    new THREE.Vector3(0,-25, 0),
    new THREE.Vector3(10.86, -14.14, 0),
  ];
  const innerLine3 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerLinePoints3),
    new THREE.LineBasicMaterial({ color: colorResult })
  );
  offsetGroup.add(innerLine3);

  const innerLinePoints4 = [
    new THREE.Vector3(0,25, 0),
    new THREE.Vector3(10.86, 14.14, 0),
  ];
  const innerLine4 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerLinePoints4),
    new THREE.LineBasicMaterial({ color: colorResult })
  );
  offsetGroup.add(innerLine4);

}else if(type==="Fırın"){
    // Büyük ve küçük içi boş daireleri oluştur
  const outerCircle = createFilledCircle(filledPointRadius, colorResult);
  outerCircle.position.set(boxSize / 2, 0, 0.1); // hafif yukarı
  offsetGroup.add(outerCircle);
  const innerLinePoints1 = [
    new THREE.Vector3(0, 15, 0),
    new THREE.Vector3(50,15, 0),
  ];
  const innerLine1 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerLinePoints1),
    new THREE.LineBasicMaterial({ color: colorResult })
  );
  offsetGroup.add(innerLine1);
 
}else if(type==="Klima"){
    // Büyük ve küçük içi boş daireleri oluştur
  const outerCircle = createFilledCircle(filledPointRadius, colorResult);
  outerCircle.position.set(boxSize / 2, 18, 0.1); // hafif yukarı
  offsetGroup.add(outerCircle);
  const innerLinePoints1 = [
    new THREE.Vector3(0, 11, 0),
    new THREE.Vector3(50,11, 0),
  ];
  const innerLine1 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(innerLinePoints1),
    new THREE.LineBasicMaterial({ color: colorResult })
  );
  offsetGroup.add(innerLine1); 

}else if(type==="Fan"){
    // Büyük ve küçük içi boş daireleri oluştur
  const outerCircle = createCircleOutline(middleRadius, colorResult);
  outerCircle.position.set(boxSize / 2, 0, 0.1); // hafif yukarı
  offsetGroup.add(outerCircle);
  const baseAngleRad = Math.atan2(dir.y, dir.x);
  //offsetGroup.rotation.z = baseAngleRad;

  // Ortalanmış metni oluştur
  const label = drawTextForMachine("F", 
    { x: boxSize / 2, y: 0 },    
     baseAngleRad);
  offsetGroup.add(label);

  // Opsiyonel güç bilgisi
  if (power && power !== "0") {
     const powerLabel = drawTextForMachine(`${power}W`, { x: boxSize / 2, y: -20 }, baseAngleRad, 12);
     offsetGroup.add(powerLabel);
  }
  


}else if(type==="Motor"){
  // Büyük ve küçük içi boş daireleri oluştur
const outerCircle = createCircleOutline(middleRadius, colorResult);
outerCircle.position.set(boxSize / 2, 0, 0.1); // hafif yukarı
offsetGroup.add(outerCircle);
const baseAngleRad = Math.atan2(dir.y, dir.x);
//offsetGroup.rotation.z = baseAngleRad;

// Ortalanmış metni oluştur
const label = drawTextForMachine("M", { x: boxSize / 2, y: 0 }, baseAngleRad);
offsetGroup.add(label);

// Opsiyonel güç bilgisi
if (power && power !== "0") {
  const powerLabel = drawTextForMachine(`${power}W`, { x: boxSize / 2, y: -20 }, baseAngleRad, 12);
  offsetGroup.add(powerLabel);
}

}else if(type==="Hidrofor"){
  // Büyük ve küçük içi boş daireleri oluştur
  const baseAngleRad = Math.atan2(dir.y, dir.x);
//  offsetGroup.rotation.z = baseAngleRad;

  // Ortalanmış metni oluştur
  const label = drawTextForMachine(type, { x: boxSize / 2, y: 0 }, baseAngleRad);
  offsetGroup.add(label);

  // Opsiyonel güç bilgisi
  if (power && power !== "0") {
    const powerLabel = drawTextForMachine(`${power}W`, { x: boxSize / 2, y: -20 }, baseAngleRad, 12);
    offsetGroup.add(powerLabel);
  }

}else if(type==="Kombi"){
  // Büyük ve küçük içi boş daireleri oluştur
  
  const baseAngleRad = Math.atan2(dir.y, dir.x);
//  offsetGroup.rotation.z = baseAngleRad;

  // Ortalanmış metni oluştur
  const label = drawTextForMachine(type, { x: boxSize / 2, y: 0 }, baseAngleRad);
  offsetGroup.add(label);

  // Opsiyonel güç bilgisi
  if (power && power !== "0") {
    const powerLabel = drawTextForMachine(`${power}W`, { x: boxSize / 2, y: -20 }, baseAngleRad, 12);
    offsetGroup.add(powerLabel);
  }
}

 
  return group;
}
const createFilledCircle = (radius, color) => {
  const geometry = new THREE.CircleGeometry(radius, 64);
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  return new THREE.Mesh(geometry, material);
};
function drawTextForMachine(text, position,  rotationRad = 0, fontSize = 18) {
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
 
 
const createCircleOutline = (radius, color) => {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * 2 * Math.PI;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
  }
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color })
  );
};
 
 