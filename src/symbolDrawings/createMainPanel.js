import * as THREE from 'three';
import { drawPolylineFromCode } from '../commands/drawPolylineFromCode';
import { createSolidHatchFromBoundary } from '../commands/createSolidHatchFromBoundary';
import { generateUniqueId } from '../utils/generateUniqueId';
import { drawCircleFromCode } from '../commands/drawCircleFromCode';
export function createMainPanel(scene, mousePos,  text = "Panel" ) {
  const group = new THREE.Group(); // ana grup
  group.name="mainPanel"
  const panelID = generateUniqueId('mainPanel');

  const offsetGroup = new THREE.Group(); // içerikler için offset grubu
  offsetGroup.name="offsetGroup"
  // Panel boyutları
  const panelWidth =  15;
  const panelHeight = 25;

  const basePoint = {
    x: mousePos.x,
    y: mousePos.y,
  };
//------------------------------
  // Ana grup tıklanan yere yerleşir
  group.position.set(basePoint.x, basePoint.y, 0);
  // offsetGroup'u sola kaydırarak panelin sol kenarını basePoint hizasına getiriyoruz
  offsetGroup.position.set(0, 0, 0);
  group.add(offsetGroup); 
  const halfW = panelWidth / 2;
  const halfH = panelHeight / 2;

  // === 1. Polyline ===
  const polyline = drawPolylineFromCode(scene, {
    points: [
      { x: -halfW , y: -halfH },
      { x: -halfW , y: halfH },
      { x: halfW  ,y: halfH },
      { x: halfW , y: -halfH },
    ],
    color:  0xffffff,
    closed: true,
  });

  if (polyline) {
    polyline.userData = { isPanelPart: true,panelID };
    polyline.name = 'mainPanel-outer';
    offsetGroup.add(polyline);
  }

  // === 2. Hatch ===
   const hatch1 = createSolidHatchFromBoundary(scene, {
    segments: [
      { type: 'line', from: { x: -halfW , y: halfH }, 
      to: { x: halfW , y: halfH } },
      { type: 'line', from: { x: halfW , y:  halfH }, 
      to: { x: 0  , y: 0 } },
    
    ],
    color: 0xff0000,
  });

  if (hatch1) {
    hatch1.name = 'mainPanel-hatch1';
    hatch1.userData = { isPanelPart: true,panelID };
    offsetGroup.add(hatch1);
  }
 
   const hatch2 = createSolidHatchFromBoundary(scene, {
    segments: [
      { type: 'line', from: { x: -halfW , y: -halfH }, 
      to: { x: halfW , y: -halfH } },
      { type: 'line', from: { x: halfW , y:  halfH }, 
      to: { x: 0  , y: 0 } },
    
    ],
    color: 0xff0000,
  });

  if (hatch2) {
    hatch1.name = 'mainPanel-hatch2';
    hatch2.userData = { isPanelPart: true,panelID };
    offsetGroup.add(hatch2);
  }
 

  group.userData = {
    id: panelID,
    type: 'mainPanel',
    function: 'electricalPanel',
    name: 'ADP', 

    isSelectable: true,
    isPanelPreview: true,
    originalColor: 0xffffff,
    outs: [],
    outSnaps: [],
    basePoint: { ...basePoint }, 
    height:panelHeight,
    startH:panelHeight/2,
    endH:panelHeight/2-5,
  
    details:{
      kullanimAmac:"Mesken",
      aboneTipi:"Mesken",
      kuruluGuc:5,
      talepFak:"60-40%",
      talepGuc:5,
      faz:"rst",
      akim:5,

    },
    salt:{
      kesici:{no:7,Etiket:"4xB-25A"},
      kolon:{no:7,Etiket:"4x4mm2 NYM"},
      kAKR:{no:9,Etiket:"4P 30mA 25A"},
      SayacKesici:{no:9,Etiket:"4xC-25A"}
    }
  };

  if (scene) {
    scene.add(group);
  }
  return group;
}
 