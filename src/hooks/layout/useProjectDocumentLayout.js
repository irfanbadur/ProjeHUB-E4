// GÜNCELLENMİŞ: Header görünür, sürüklenebilir
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { dxfDrawCore } from '../../utils/dxfDrawCore';
import { createTekHatSema } from '../../documents/createTekHatSema';
import { ClippingGroup } from 'three/webgpu';
//import { createDocumentHeaderGroup } from '../../documents/createDocumentHeaderGroup';
 
  const headerHeight = 100; 

const DOCUMENT_OFFSET = 100;
// Standart ozalit yükseklikleri
const STANDARD_WIDTHS = [310, 457, 620, 760, 860, 914, 1070];
const MULTIPLIER = 5;
let MAIN_FRAME_HEIGHT = STANDARD_WIDTHS[0] * MULTIPLIER;
const branchies = [
  {
    id: 'branch-1',
    type: 'light',
    sorti: 3,
    totalPower: 54 // Watt
  },
  {
    id: 'branch-2',
    type: 'socket',
    sorti: 'Priz-1',
    totalPower: 1500 // Watt
  },
  {
    id: 'branch-3',
    type: 'socketOven',
    sorti: 'Fırın Hattı',
    totalPower: 2000 // Watt
  },
  {
    id: 'branch-4',
    type: 'socketDish',
    sorti: 'Bulaşık Makinesi',
    totalPower: 1800 // Watt
  },
  {
    id: 'branch-5',
    type: 'socketWash',
    sorti: 'Çamaşır Makinesi',
    totalPower: 1800 // Watt
  }
];

function createDocumentContent(name, def) {
  console.log("CREATE DOCUMENT CONTENT : ",name)
  switch (name) {
    case 'TekHat  Şeması':
    return createTekHatSema(0, -500, def.w, def.h, branchies || []);
 //   case 'Kat Planı':
  //    return createKatPlan(0, 0, def.w, def.h, def.someData);
    // Diğer dokümanlar...
    default:
      return { result: [], width: def.w, height: def.h };
  }
}
function createDocumentHeaderParts(title, width, height) {
  const objects = [];

  // 1. Polyline çerçeve
const safeFrameWidth = Number.isFinite(width) && width > 0 ? width : 1;
const safeFrameHeight = Number.isFinite(height) && height > 0 ? height : 1;
const points = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(safeFrameWidth, 0, 0),
  new THREE.Vector3(safeFrameWidth, -safeFrameHeight, 0),
  new THREE.Vector3(0, -safeFrameHeight, 0),
  new THREE.Vector3(0, 0, 0),
];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x666666 });
  const outline = new THREE.LineLoop(geometry, material);
  objects.push(outline);

  // 2. Başlık arka planı
  const headerHeight = 100;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1;
const safeHeight = Number.isFinite(headerHeight) && headerHeight > 0 ? headerHeight : 1;
const headerGeometry = new THREE.PlaneGeometry(safeWidth, safeHeight);

  const headerMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const header = new THREE.Mesh(headerGeometry, headerMaterial);
  header.position.set(width / 2, -headerHeight / 2, 0.5);
  header.userData.isDraggable = true; // <-- önemli kısım!
  objects.push(header);

  // 3. Başlık yazısı (sprite)
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.font = 'bold 64px Arial';
  ctx.fillText(title, 20, 160);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(500, 120, 1);
  sprite.position.set(width / 2, -headerHeight / 2, 1);
  objects.push(sprite);

  return objects;
}

export const useProjectDocumentLayout = (scene, documentDefs) => {
  const allGroupsRef = useRef([]);
  const boundsRef = useRef({ frameWidth: 0, frameHeight: 0 });
  useEffect(() => {
    if (!scene || !Array.isArray(documentDefs)) return;

    // Yükseklik kontrolü ve uygun MAIN_FRAME_HEIGHT belirleme
    const maxDocHeight = Math.max(...documentDefs.map(doc => doc.h));
    for (let w of STANDARD_WIDTHS) {
      if (maxDocHeight <= w * MULTIPLIER) {
        MAIN_FRAME_HEIGHT = w * MULTIPLIER;
        break;
      }
    }

    const mainFrameGroup = new THREE.Group();
    let currentX = 0;
    let currentY = 0;
    let rowMaxHeight = 0;

        let columnHeight = 0;
/* 
    documentDefs.forEach((docDef) => {

      const group = createDocumentHeaderGroup(docDef.name, docDef.w, docDef.h);
      // kullanılabilir sütun yüksekliği: mainFrame - 2*offset
      const maxColumnHeight = MAIN_FRAME_HEIGHT - 2 * DOCUMENT_OFFSET;
      const nextHeight = columnHeight + docDef.h + (columnHeight > 0 ? DOCUMENT_OFFSET : 0);

      if (nextHeight > maxColumnHeight) {
        currentX += rowMaxHeight + DOCUMENT_OFFSET;
        columnHeight = 0;
        rowMaxHeight = 0;
      }

      group.position.set(currentX, -DOCUMENT_OFFSET - columnHeight, 0);
      columnHeight += docDef.h + (columnHeight > 0 ? DOCUMENT_OFFSET : 0);
      rowMaxHeight = Math.max(rowMaxHeight, docDef.w);

      mainFrameGroup.add(group);
      allGroupsRef.current.push(group);
    }); */

documentDefs.forEach((docDef) => {
  const documentGroup = new THREE.Group();

  // 🔄 Yeni header parçalarını doğrudan ekle
  console.log("Creating header for  Width:", docDef.w,docDef.h);
   
  const headerParts = createDocumentHeaderParts(docDef.name, docDef.w, docDef.h);
  headerParts.forEach(obj => documentGroup.add(obj)); 

  // İçeriği ekle
  const docContentJson = createDocumentContent(docDef.name, docDef);
 

 
/*    if (docContentJson && docContentJson.result?.length > 0) {
    const contentGroup = dxfDrawCore(scene, docContentJson.result,[], "group"); 
    contentGroup.position.set(0, -docDef.h, 0); // İçeriği başlığın altına yerleştir
    documentGroup.add(contentGroup);
  }  */
  
 if (docContentJson && docContentJson.result?.length > 0) {
  const contentGroup = new THREE.Group();
dxfDrawCore(contentGroup, docContentJson.result, [], "scene");
  if (contentGroup && contentGroup.children.length > 0) {
    contentGroup.position.set(0, -docDef.h, 0);
    documentGroup.add(contentGroup);
  } else {
    console.warn("⚠️ contentGroup is empty:", docContentJson.result);
  }
} 

  // Konumlandırma
  const maxColumnHeight = MAIN_FRAME_HEIGHT - 2 * DOCUMENT_OFFSET;
  const nextHeight = columnHeight + docDef.h + (columnHeight > 0 ? DOCUMENT_OFFSET : 0);
  if (nextHeight > maxColumnHeight) {
    currentX += rowMaxHeight + DOCUMENT_OFFSET;
    columnHeight = 0;
    rowMaxHeight = 0;
  }
  documentGroup.position.set(currentX, -DOCUMENT_OFFSET - columnHeight, 0);
  columnHeight += docDef.h + (columnHeight > 0 ? DOCUMENT_OFFSET : 0);
  rowMaxHeight = Math.max(rowMaxHeight, docDef.w);

  // Ekle
  mainFrameGroup.add(documentGroup);
  allGroupsRef.current.push(documentGroup);
});

   // Ana çerçeve polylinesi
   const frameWidth = currentX + rowMaxHeight;
    const frameHeight = MAIN_FRAME_HEIGHT;
    const framePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(frameWidth, 0, 0),
      new THREE.Vector3(frameWidth, -frameHeight, 0),
      new THREE.Vector3(0, -frameHeight, 0),
      new THREE.Vector3(0, 0, 0),
    ];
    
    const frameGeometry = new THREE.BufferGeometry().setFromPoints(framePoints);
    const frameMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const mainFrameOutline = new THREE.LineLoop(frameGeometry, frameMaterial);
    mainFrameGroup.add(mainFrameOutline);

    scene.add(mainFrameGroup);
boundsRef.current = {
  frameWidth,
  frameHeight: MAIN_FRAME_HEIGHT,
  minX: 0,
  maxX: frameWidth,
  minY: -MAIN_FRAME_HEIGHT,
  maxY: 0
};


    return () => {
      scene.remove(mainFrameGroup);
    };
  }, [scene, documentDefs]);

  return {
    allGroupsRef,
    boundsRef
  };
};

 