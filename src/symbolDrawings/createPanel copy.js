import * as THREE from 'three';
import { drawPolylineFromCode } from '../commands/drawPolylineFromCode';
import { createSolidHatchFromBoundary } from '../commands/createSolidHatchFromBoundary';
import { generateUniqueId } from '../utils/generateUniqueId';
import { drawCircleFromCode } from '../commands/drawCircleFromCode';
export function createPanel(scene, mousePos,dir,symmetricalOffset, isPreview = false,panelKatPlanNo) {
  const group = new THREE.Group(); // ana grup
  const offsetGroup = new THREE.Group(); // içerikler için offset grubu

  // Panel boyutları
  const panelWidth = dir*15;
  const panelHeight = 25;

  const basePoint = {
    x: mousePos.x,
    y: mousePos.y,
  };
//------------------------------

  // Ana grup tıklanan yere yerleşir
  group.position.set(basePoint.x, basePoint.y, 0);

  // offsetGroup'u sola kaydırarak panelin sol kenarını basePoint hizasına getiriyoruz
  offsetGroup.position.set(-panelWidth / 2, 0, 0);
  group.add(offsetGroup);

  const halfW = panelWidth / 2;
  const halfH = panelHeight / 2;

  // === 1. Polyline ===
  const polyline = drawPolylineFromCode(scene, {
    points: [
      { x: -halfW+symmetricalOffset*dir, y: -halfH },
      { x: -halfW+symmetricalOffset*dir, y: halfH },
      { x: halfW+symmetricalOffset*dir ,y: halfH },
      { x: halfW+symmetricalOffset*dir, y: -halfH },
    ],
    color: isPreview ? 0xcccccc : 0xffffff,
    closed: true,
  });

  if (polyline) {
    polyline.userData = {
      isPanelPart: true,
    };
    polyline.name = 'panel-outer'
    offsetGroup.add(polyline); // dikkat! offsetGroup'a ekleniyor
  }

  // === 2. Hatch ===
  const hatch = createSolidHatchFromBoundary(scene, {
    segments: [
      { type: 'line', from: { x: -halfW+symmetricalOffset*dir, y: halfH }, to: { x: halfW+symmetricalOffset*dir, y: -halfH } },
      { type: 'line', from: { x: -halfW+symmetricalOffset*dir, y: -halfH }, to: { x: -halfW+symmetricalOffset*dir, y: -halfH } },
    ],
    color: 0xff0000,
  });

  if (hatch) 
  {  
    hatch.name = 'panel-hatch'
  offsetGroup.add(hatch);
}

  
  const panelID=generateUniqueId('panel')
  group.userData = {
    id: panelID,
    type: 'electricalPanel',
    function: 'electricalPanel',
    name:"ZKT",
    panelKatPlanNo:panelKatPlanNo,
    isSelectable: true,
    isPanelPreview: true,
    originalColor: 0xffffff,
    outs:[],
    basePoint: { ...basePoint },
  //  connectionPoints
  };

  for( var a =1;a<=5;a++){

 const outSnap = drawCircleFromCode(scene, {
    center: { x: symmetricalOffset*dir , y: 0+a*5, z: 0 },
    radius: 2,
    color: 0xff0000, 
  });
 outSnap.userData={
  type:"panelCon_out",
  panelID: panelID,
  no:a,
  outNo:a,
  isSelectable:true
 }
 outSnap.visible=false
 group.add(outSnap);
} 

  // === 4. Sahneye ekle ===
  if (scene) {
    scene.add(group);
  }

  return group;
}
 