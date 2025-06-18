import * as THREE from 'three';
import { drawPolylineFromCode } from '../commands/drawPolylineFromCode';
import { createSolidHatchFromBoundary } from '../commands/createSolidHatchFromBoundary';
import { generateUniqueId } from '../utils/generateUniqueId';
import { createTextSprite } from '../utils/createTextSprite';
export function createSupplyPoint(
  scene, 
  mousePos,
  text = "Panel" 

) {
  const group = new THREE.Group(); // ana grup
  group.name="panel"
  const panelID = generateUniqueId('panel');

  const offsetGroup = new THREE.Group(); // içerikler için offset grubu
  offsetGroup.name="offsetGroup"
  // Panel boyutları
  const panelWidth =  25;
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
      { x: -halfW, y: -halfH },
      { x: -halfW, y: halfH },
      { x: halfW ,y: halfH },
      { x: halfW, y: -halfH },
    ],
    color: 0xff3333,
    closed: true,
  });

  if (polyline) {
    polyline.userData = { isPanelPart: true,panelID };
    polyline.name = 'panel-outer';
    offsetGroup.add(polyline);
  }

  const textSprite = createTextSprite(text, {
    fontSize: 40,
    color: '#ffffff',
    backgroundColor: 'transparent',
    strokeColor: 'black',
    padding: 4,
  });

  textSprite.position.set(0, 0, 0.1); // dörtgen ortasına
  offsetGroup.add(textSprite);

  group.userData = {
    id: panelID,
    type: 'supplyPoint',
    function: 'supplyPoint',
    name: 'supplyPoint', 

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

    },
    salt:{ 
    }
  };

  if (scene) {
    scene.add(group);
  }
  return group;
}
 