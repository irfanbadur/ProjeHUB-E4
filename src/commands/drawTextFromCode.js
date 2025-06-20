// src/commands/drawTextFromCode.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';

/**
 * @param {THREE.Scene} scene
 * @param {{
 *   text: string,
 *   position: { x: number, y: number },
 *   font?: string,
 *   fontSize?: number,
 *   color?: string,
 *   bold?: boolean,
 *   italic?: boolean,
 *   underline?: boolean,
 *   alignment?: 'left' | 'center' | 'right',
 *   halign?: number,
 *   valign?: number,
 * }} options
 */
export function drawTextFromCode( target, {
  text = 'Hello',
  position = { x: 0, y: 0 },
  endPoint,
  font = 'Arial',
  fontSize = 20,
  color = '#ffffff',
  bold = false,
  italic = false,
  underline = false,
  alignment = 'center',
  halign = 0,
  valign = 0,
  rotation=0
}) {
  if (  !text) return;

 // console.log("text:",text, " halign  : " ,halign , "     valign:",valign,color ,rotation) 
  
  const dpi = window.devicePixelRatio || 1;
  const size = fontSize * 10;
  const padding = 0;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Font stili
  const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${font}`;
  ctx.font = fontStyle;

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = size;

 
  const canvasWidth = (textWidth + padding * 2) * dpi;
  const canvasHeight =  (textHeight + padding * 2) * dpi;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.scale(dpi, dpi);
  ctx.font = fontStyle;
  //ctx.fillStyle = colorToHexString(color);/* 
  
  ctx.fillStyle = colorToHexString(color); // yazının rengi
  //ctx.fillText(text, x, y);

  // Hizalama tanımları (ctx için)
  let hAlignText = 'left';
  let vAlignText = 'middle';

  if (halign === 0) hAlignText = 'right';
  else if (halign === 1) hAlignText = 'center';
  else if (halign === 2) hAlignText = 'right';
  else if (halign === 3) hAlignText = 'right';
  else if (halign === 4) hAlignText = 'right';
  else if (halign === 5) hAlignText = 'right';

  if (valign === 1) vAlignText = 'bottom';
  else if (valign === 0) vAlignText = 'middle';
  else if (valign === 2) vAlignText = 'middle';
  else if (valign === 3) vAlignText = 'top'; 

  ctx.textAlign = hAlignText;
  ctx.textBaseline = vAlignText;

  // Pozisyonlar (canvas üzerinde yazı nereye yerleştirilecek)
  let x = padding;
  let y = canvas.height / dpi / 2;

    if (hAlignText === 'center') x = canvas.width / dpi / 2;
  else if (hAlignText === 'right') x = canvas.width / dpi  - padding;

  if (vAlignText === 'top') y = padding;
  else if (vAlignText === 'middle') y = canvas.height / dpi / 2;
  else if (vAlignText === 'bottom') y = canvas.height / dpi - padding; 

  ctx.fillText(text, x, y);

  // ✏️ Altı çiziliyse çiz
   if (underline) {
    const underlineY = y + size / 2.5;
    const textStartX =
      hAlignText === 'center' ? x - textWidth / 2 :
      hAlignText === 'right' ? x - textWidth :
      x;

    ctx.beginPath();
    ctx.moveTo(textStartX, underlineY);
    ctx.lineTo(textStartX + textWidth, underlineY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
 
  
  const texture = new THREE.CanvasTexture(canvas);
  //const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  //const sprite = new THREE.Sprite(material);

  const scaleFactor = 10;
  let displayWidth = endPoint? (Math.abs(position.x-endPoint.x)):(canvas.width / dpi / scaleFactor);
  if(endPoint&&position.x===endPoint.x)displayWidth=canvas.width / dpi / scaleFactor
  const displayHeight = canvas.height / dpi / scaleFactor;
  //sprite.scale.set(displayWidth, displayHeight, 1);

  // Konum düzeltmesi (halign / valign'e göre)
  const geometry = new THREE.PlaneGeometry(displayWidth, displayHeight);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

   let offsetX = displayWidth ;
  if (hAlignText === 'center') offsetX = 0;
  else if (hAlignText === 'right') offsetX = +displayWidth/2;
  else if (hAlignText === 'left') offsetX = -displayWidth/2;

  let offsetY = displayHeight;
  if (vAlignText === 'middle') offsetY = 0;
  else if (vAlignText === 'top') offsetY = +displayHeight/2  ;
  else if (vAlignText === 'bottom') offsetY = -displayHeight/2; 
 
 // 3. Yazı pozisyonu offset'e göre ayarlanır
mesh.position.set(offsetX, offsetY, 0);

// 4. Grup oluştur ve `position`'a yerleştir
const group = new THREE.Group();
group.add(mesh);
group.position.set(position.x, position.y, 0);

// 5. Rotasyon gruba uygulanır (basepoint etrafında döner)
if (rotation) {
  group.rotation.z = rotation * Math.PI / 180; // AutoCAD saat yönü pozitif, bu yüzden negatifle
}
 // 6. Sahneye ekle
//scene.add(group);
if (target === 'scene') {
  target.add(group);
} 
// 7. userData — hem grup hem mesh için taşı
group.userData = {
  id: generateUniqueId('text'),
  type: 'text',
  text,
  font,
  fontSize,
  alignment,
  bold,
  italic,
  underline,
  color,
  halign,
  valign,
  rotation,
  isSelectable: true,
};

return group;
}



function colorToHexString(color) {
    if (typeof color === 'number') {
      // 24-bit RGB'den fazlasını kes
      const rgb = color & 0xffffff;
      return '#' + rgb.toString(16).padStart(6, '0');
    }
    return color;
  }
  
 
 