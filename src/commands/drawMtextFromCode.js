import * as THREE from 'three';
import { generateUniqueId } from '../utils/generateUniqueId';
import { ColorIndex1 } from '../utils/colorIndex';
export function drawMtextFromCode( target, entity) {
  const parsedTextData = parseText(entity);
  const dpi = window.devicePixelRatio || 1;
  const baseFontSize = entity.height || 10;
  const padding = 0;
   
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const targetLineWidth = (entity.width || Infinity) * dpi * 10;

  
  let colorIndex =ColorIndex1( entity.colorIndex) ;
  let color   =colorToHexString(entity.color)
 
  
  let finalColor = colorIndex || ColorIndex1( color).trim() || '#ffffff';
  
  // Varsayılan format
  let currentFormat = {
    font: entity.font || 'Arial',
    fontSize: baseFontSize,
    color: finalColor,//colorToHexString3(entity.color)||'#ffffff', //entity.color || '#ffffff',
    bold: false,
    italic: false,
    superScript: false,
    subScript: false,
    paddingLeft:0,

  };

  // 🧠 Satır sarmalama için tüm context'leri birleştirerek tek tek ekrana yaz
  let lines = [];
  let currentLine = [];
  let currentLineWidth = 0;

  function applyFormatToContext(ctx, format) {
    ctx.font = getFontString(format);
    ctx.fillStyle =  colorToHexString(format.color || finalColor);
   
  }

  
  const flushLine = () => {
    if (currentLine.length > 0) {
      lines.push([...currentLine]);
      currentLine = [];
      currentLineWidth = 0;
      currentFormat.tab = false;
    }
  };
  function getFontString(format) {
    const fontSize = (format.fontSize || 10) * 10; // px cinsinden
    const style = format.italic ? 'italic' : '';
    const weight = format.bold ? 'bold' : '';
    const family = format.font || 'Arial';
    
    // Superscript ve Subscript durumlarında font boyutunu değiştir
    if (format.superScript) {
      return `${style} ${weight} ${fontSize * 0.8}px ${family}`;  // Superscript için daha küçük font
    }
    if (format.subScript) {
      return `${style} ${weight} ${fontSize * 0.8}px ${family}`;  // Subscript için daha küçük font
    }

    return [style, weight, `${fontSize}px`, family].filter(Boolean).join(' ');
  }
  function renderTextWithFormatting(ctx, text, format, x, y) {

    const { fontSize, superScript, subScript, pt,pi, alignment,tab,paddingLeft } = format;
    // Superscript ve Subscript ayarlamaları
    if (superScript) {
      // Superscript için y koordinatını yukarı kaydır
      y -= fontSize * 0.5;  // Font boyutunun %50'si kadar yukarı kaydırma
    } else if (subScript) {
      // Subscript için y koordinatını aşağı kaydır
      y += fontSize * 5;  // Font boyutunun %50'si kadar aşağı kaydırma
    }
  let tabWidth=0;
  if(tab){
    tabWidth=pt*10
  }
    // Font özelliklerini uygulama
    ctx.font = getFontString(format);
    ctx.textAlign = alignment || 'left';
    ctx.textBaseline = 'top';  // 'top' olarak hizalayacağız, alt/üst farkı için `y` koordinatını ayarlıyoruz
  
    // Metni çizme

    ctx.fillText(text, x
      //+currentFormat.pi
      //+paddingLeft*10
      +pi*10
      +(tab? tabWidth:paddingLeft*10)
      , y);
  }

  parsedTextData.forEach(({ context }) => {
    let tabWidth=0;

    if (context.format) {
      const format = context.format;
      if (format.f) currentFormat.font = format.f;
      if (format.H) currentFormat.fontSize = currentFormat.fontSize*format.H;
      if (format.C) currentFormat.color = ColorIndex1(format.C).trim()// `#${format.C.toString(16).padStart(6, '0')}`;
      if (format.b === 1) currentFormat.bold = true;
      if (format.b === 0) currentFormat.bold = false;
      if (format.i === 1) currentFormat.italic = true;
      if (format.i === 0) currentFormat.italic = false;      
      if (format.tab) {currentFormat.tab = true;}     
      if (format.superScript === true) {currentFormat.superScript = true;}else if(!format.superScript){currentFormat.superScript = false;}
      if (format.subScript === true) {currentFormat.subScript = true;}else if(!format.subScript){currentFormat.subScript = false;}
      
      if (format.paraghraph === true) {
        currentFormat.paraghraph = true;flushLine();
         
      }
      if (format.pt&&format.pt>0 ){currentFormat.pt= format.pt;  
        tabWidth=format.pt*10
        } 
      if (format.pi&&format.pi>0 ){      currentFormat.pi= format.pi;    }else {currentFormat.pi=0}
      if (format.paddingLeft ){  currentFormat.paddingLeft= format.paddingLeft;     }
      
      
    }
          
    if (context.text) {
      const words = context.text.split(' ');

      words.forEach((word, index) => {
        const displayWord = (index !== words.length - 1) ? word + ' ' : word;  
        // ✅ Her kelime için context fontunu uygula ve ölç
        applyFormatToContext(ctx, currentFormat);
        const width = ctx.measureText(displayWord).width;  
        if (currentLineWidth + width     > targetLineWidth) {
          flushLine();
        }
        currentLine.push({
          text: displayWord,
          format: { ...currentFormat },
          width,
        });  
        currentLineWidth += width+currentFormat.paddingLeft*10*2; //burada sağ taraf için paddingLeft *2 yapılıyor ama paddingRigth yapılırsa paddingLeft+ paddingRight şeklinde güncellenebilir.
      });
    }
  });
  

  if (currentLine.length > 0) flushLine();

  // 🎨 Canvas boyutunu hesapla
  const lineHeight = baseFontSize * 10 ;
  const canvasWidth = targetLineWidth + currentFormat.paddingLeft * 2;
  const canvasHeight = (lines.length * lineHeight + currentFormat.fontSize/3*5);
  canvas.width = canvasWidth*dpi;
  canvas.height = canvasHeight*dpi;

  // Render
 // ctx.scale(dpi, dpi);
  let y = padding;

  lines.forEach(line => {
    let x =0// paddingX*10;
    line.forEach(fragment => {

      applyFormatToContext(ctx, fragment.format);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';  // 'top' olarak hizalayacağız, alt/üst farkı için `y` koordinatını ayarlıyoruz
      renderTextWithFormatting(ctx, fragment.text, fragment.format, x, y);  // Formatlı metni çiz
      x += fragment.width  ;
    });
    y += lineHeight;
  });

  // 🎭 Sprite oluştur
  const texture = new THREE.CanvasTexture(canvas);
texture.needsUpdate = true;
texture.minFilter = THREE.LinearFilter;

const material = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  depthTest: false, // isteğe bağlı: text üstte olsun
});
const widthWorld = canvas.width / dpi / 10;
const heightWorld = canvas.height / dpi / 10;
const geometry = new THREE.PlaneGeometry(widthWorld, heightWorld);
const mesh = new THREE.Mesh(geometry, material);

  // 🎯 Konumlandırma (attachmentPoint)
  let offsetX = 0;
  let offsetY = 0;

  switch (entity.attachmentPoint) {
    case 1: offsetX = widthWorld/2; offsetY = -heightWorld/2; break; // Top Left
    case 2: offsetX = 0; offsetY = -heightWorld/2; break;
    case 3: offsetX = -widthWorld/2; offsetY = -heightWorld/2; break;
    case 4: offsetX = widthWorld/2; offsetY = heightWorld; break;
    case 5: offsetX = 0; offsetY = heightWorld; break;
    case 6: offsetX = -widthWorld/2; offsetY = heightWorld; break;
    case 7: offsetX = widthWorld/2; offsetY = heightWorld / 2; break;
    case 8: offsetX = 0; offsetY = heightWorld / 2; break;
    case 9: offsetX = -widthWorld/2; offsetY = heightWorld / 2; break;
    default: offsetX = -widthWorld / 2; offsetY = -heightWorld / 2;
  }
  mesh.position.set(
    entity.position.x + offsetX,
    entity.position.y + offsetY,
    0
  );
  mesh.userData = {
    id: generateUniqueId('mtext'),
    type: 'mtext',
    rawText: entity.text,
    font: entity.font,
    fontSize: entity.height,
    color: entity.color,
    width: entity.width,
    alignment: entity.attachmentPoint,
    isSelectable: true,
  };
  
 // scene.add(mesh);
 if (target === 'scene') {
    target.add(mesh);
  } else if (target === 'group') {
    target.add(mesh);
  }
  return mesh;
}


// ✅ Text parse fonksiyonu
function parseText(element) {
  let rawText = element.text || '';
  rawText += element.TextString || '';
  let rawText2 = rawText.split("\\");
  let contexts = [];


  
  rawText2.forEach((item, index) => {
    if (item !== '') {
      let parts = item.split(';'); 
    

      let formats = parts[0];
      let text = parts[1];
      if(parts.length===1){
        if (parts.length === 1 && typeof parts[0] === 'string' && parts[0].length === 1) {
          formats= parts[0] +"_"
          text= ""
        }else{
          formats= parts[0].slice(0, 1);
          text= parts[0].slice( 1);  
        }
      }

      if (text === "{") text = "";
      if (rawText2.length - 1 === index && text?.endsWith("}")) {
        text = text.slice(1, -1);
      }
      if (  text?.startsWith("^I")) {
        text = text.slice(2);
        formats= formats+"|^I"

      }

      let context;
      if (formats === item) {
        context = { text: formats };
      } else {
        if (formats.startsWith('S')) {
          if (formats[1] === '^') {
            context = { formats: "Sub", text: formats.slice(2) };
          } else {
            context = { formats: "Super", text: formats.slice(1, -2) };
          }
        } else {
          context = text === '' ? { formats } : { formats, text };
        }
      }


      contexts.push(context);
    }
  });
   return contexts.map((item) => {

    const context = {};
    if (item.formats) context.format = parseFormatString(item.formats);
    if (item.text) context.text = item.text;
    return { context };
  });
}


// ✅ Formatları çöz
function parseFormatString(formatString) {

  
  let format = {};

  if(formatString.indexOf("|")!=-1){
    let parts = formatString.split('|'); 
    parts.forEach((part) => {
      
          if (part.startsWith("A")) format.A = part.slice(1);
         // if (part.startsWith("pl")) format.pl = part.slice(2).split(',')[0];
          if (part.startsWith("f")) format.f = part.slice(1);
          if (part.startsWith("i")) format.i = parseInt(part.slice(1));
          if (part.startsWith("b")) format.b = parseInt(part.slice(1));
          if (part.startsWith("c")) format.c = parseInt(part.slice(1));
        
          if (part.startsWith("H")) format.H = parseFloat(part.slice(1, -1));
          if (part.startsWith("O")) format.overLine = true;
          if (part.startsWith("o")) format.overLine = false;
          if (part.startsWith("L")) format.underLine = true;
          if (part.startsWith("l")) format.underLine = false;
          if (part==="^I"){ format.tab = true;}else{format.tab = false;}
      
        });
  }else{
    if (formatString.startsWith("P_")) format.paraghraph =true ;

    if (formatString.startsWith("C")) format.C = parseInt(formatString.slice(1));
    let pi_pl = formatString.split(',')[0];
    let pt =    formatString.split(',')[1];
    let pl=0 
    let pi=0 

    if(pi_pl.startsWith("pl"))pl=parseFloat(pi_pl.slice(2));
    if(pi_pl.startsWith("pi"))pi=parseFloat(pi_pl.slice(2));
     
   
    if (pt) {pt = parseFloat(pt.slice(1) ) ;
      format.pt = pt
    }
    if (pi) format.pi = pi;
    if (pl) format.paddingLeft = pl;
    if (formatString === "Sub") format.subScript = true;
    else if (formatString === "Super") format.superScript = true;
    
  }
 

     return format;
}


// ✅ Renk çözümleyici

function colorToHexString(color) {
  if (typeof color === 'number') {
    return '#' + color.toString(16).padStart(6, '0');
  }
  return color;
}