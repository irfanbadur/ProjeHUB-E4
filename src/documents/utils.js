import { dondur } from "./symbols";

export function PolyLine(x, y, vertices, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      shape,
      hasContinuousLinetypePattern
    } = options;
  
    const result = {
      type:"LWPOLYLINE",
      vertices: vertices
    };
  
    // color varsa ekle
    if (color) {
      result.color = color;
    }
    if ( colorIndex  ) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }
    if (shape) {
      result.shape = shape;
    }
    if (  hasContinuousLinetypePattern ) {
      result.hasContinuousLinetypePattern = hasContinuousLinetypePattern;
    }
  
    return result;
  }
export function Rectangle(x, y, w, h, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      shape,
      hasContinuousLinetypePattern
    } = options;
    const result = {
      type:"LWPOLYLINE",
      vertices: [
        { x: x,     y: y     },
        { x: x,     y: y + h },
        { x: x + w, y: y + h },
        { x: x + w, y: y     },
      ]
    };
    if (shape) {
        result.vertices.push({ x: x,     y: y     })
      //  result.shape = shape;
      }

    // color varsa ekle
    if (color) {
      result.color = color;
    }
    if ( colorIndex  ) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }

    if (  hasContinuousLinetypePattern ) {
      result.hasContinuousLinetypePattern = hasContinuousLinetypePattern;
    }
  
    return result;
  }
export function Line(x1, y1, x2, y2, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      lineTypeScale,
       
    } = options;
  
    const result = {
        type:"LINE",
      vertices: [
        { x: x1,     y: y1 ,z:0  },
        { x: x2,     y: y2 ,z:0  }, 
      ]
    };
  
    // color varsa ekle
    if (color) {
      result.color = color;
    }
    if ( colorIndex  ) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }
    if (lineTypeScale) {
      result.lineTypeScale = lineTypeScale;
    }
  
  
    return result;
  }
export function PolarLine(x1, y1, angle, length, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      lineTypeScale,
    } = options;
  
    // Dereceyi radyana çeviriyoruz (eğer açı derece ise).
    const angleRad =  angle*Math.PI/180  ;
    
    // Hedef nokta (x2, y2) polar hesaba göre hesaplanır
    const x2 = x1 + length * Math.cos(angleRad);
    const y2 = y1 + length * Math.sin(angleRad);
  
    const result = {
      type: "LINE",
      vertices: [
        { x: x1, y: y1, z: 0 },
        { x: x2, y: y2, z: 0 },
      ],
    };
  
    // Opsiyonel özellikleri ekleme (koşullu)
    if (color !== undefined) {
      result.color = color;
    }
    if (colorIndex !== undefined) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }
    if (lineTypeScale !== undefined) {
      result.lineTypeScale = lineTypeScale;
    }
  
    return result;
  }
  
export function Hatch(X, Y,pathGroup, rotation, options = {}) {
     
    const {
      color,
      colorIndex,
      layer,
      lineType,
      lineweight
    } = options;
  
    pathGroup= rotatePathGroup(pathGroup,   X,Y,rotation);
 
    const result = {
        type:"HATCH",
        AssociativityFlag:1,
        HatchPatternName: "SOLID",
        Kalinlik: "-3",
        x:X, 
        y:Y,
        NumberOfBoundaryPaths:1,
        SolidFillFlag:1,
        boundaryPath:[
        {
            BoundaryPathTypeFlag:7,
            groups:pathGroup,
            innerGroups:[],
            type:"outer",
        }]
    };
     // color varsa ekle
    if (color) {
      result.color = color;
    }
    if ( colorIndex  ) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }

    if (  lineweight ) {
      result.lineweight = lineweight;
    }
 // return dondur(result,  45,X,Y);
  
    return result;
  }
 
  function rotatePathGroup(pathGroup, centerX, centerY, rotationAngle) {
    // Dereceyi radyana çevir
    const angleRad = (Math.PI / 180) * rotationAngle;
  
    // Yardımcı fonksiyon: Nokta döndürme
    function rotatePoint(x, y, centerX, centerY, angleRad) {
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
  
      const dx = x - centerX;
      const dy = y - centerY;
  
      const newX = dx * cos - dy * sin + centerX;
      const newY = dx * sin + dy * cos + centerY;
  
      return [newX, newY];
    }
  
    // pathGroup üzerinde dönüşüm
    return pathGroup.map((path) => {
      if (path.edgeType === "Polyline" && Array.isArray(path.points)) {
        // points dizisini döndür
        const rotatedPoints = [];
        for (let i = 0; i < path.points.length; i += 2) {
          const [x, y] = rotatePoint(
            path.points[i],
            path.points[i + 1],
            centerX,
            centerY,
            angleRad
          );
          rotatedPoints.push(x, y);
        }
  
        return {
          ...path,
          points: rotatedPoints, // Döndürülmüş noktalar
        };
      }
      // edgeType uygun değilse olduğu gibi döndür
      return path;
    });
  }
  
  export function Text(x, y, text = {}, rotation = 0, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      lineweight,
    } = options;
  
    // **Hata önleme: text nesnesinin içeriği kontrol ediliyor**
    const textContent = text?.text || " "; // Eğer text.text undefined ise, varsayılan olarak boşluk atanır
    const textHandle = text?.handle || `h-${Date.now()}`; // Eğer handle yoksa, benzersiz bir ID oluşturulur
    const textHeight = parseFloat(text?.textHeight) || 10; // Eğer textHeight yoksa, varsayılan 10 atanır
  
    const result = {
      type: "TEXT",
      startPoint: { x: x, y: y, z: 0 },
      endPoint: { x: x, y: y+200, z: 0 },
      text: textContent,
      handle: textHandle,
      rotation: rotation,
      textHeight: textHeight
    };
  
    // **Opsiyonel parametreleri güvenli bir şekilde ekleme**
    if (color) result.color = color;
    if (colorIndex) result.colorIndex = colorIndex;
    if (layer) result.layer = layer;
    if (lineType) result.lineType = lineType;
    if (lineweight) result.lineweight = lineweight;
  
    return result;
  }
  
export function Arc(x, y,r,startAngle,endAngle, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      lineweight
    } = options;
     
  
  // Derece cinsinden merkez açı (fark)
  const angleDiffDeg = Math.abs(endAngle  - startAngle );
  
  // Dereceden radyana dönüşüm
  const angleDiffRad = (Math.PI / 180) * angleDiffDeg;
  
  // Yay uzunluğu: L = r * (radyan cinsinden açı)
  const arcLength = r * angleDiffRad;
    const result = {
        type:"ARC",
        radius: r,
      center:{x:x, y:y,z:0},
      startAngle:startAngle*Math.PI / 180,
      endAngle:endAngle*Math.PI / 180,
      angleLength:arcLength
    };
  
    // color varsa ekle
    if (color) {
      result.color = color;
    }
    if ( colorIndex  ) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }

    if (  lineweight ) {
      result.lineweight = lineweight;
    }
  
    return result;
  }
  export function dimentionVertTextRight(X,Y,Scl,lenght,height,ofset,options){
    let result = []
    result=result.concat(dimention(X , Y  ,Scl,lenght,height,ofset,90, options))  
    let currentY=Y -14*Scl
  let text = { text: `${lenght/Scl} cm`.toString(), x:X-height-ofset-1*Scl  ,y:currentY, textHeight:6* Scl }
  text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    return  result    ;
   }
  export function dimentionVertTextLeft(X,Y,Scl,lenght,height,ofset,options){
    let result = []
    result=result.concat(dimention(X , Y  ,Scl,lenght,height,ofset,270, options))  
    let currentY=Y -14*Scl
  let text = { text: `${lenght/Scl} cm`.toString(), x:X +height+ofset+1*Scl   ,y:currentY, textHeight:6* Scl }
  currentY=Y +14*Scl
  text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    return  result    ;
   }
  export function dimentionHorTextTop(X,Y,Scl,lenght,height,ofset,options){
    let result = []
    result=result.concat(dimention(X , Y  ,Scl,lenght,height,ofset,0, options))  
    let currentY=Y +height+ofset+1*Scl
  let text = { text: `${lenght/Scl} cm`.toString(), x:X -14*Scl  ,y:currentY, textHeight:6* Scl }
  text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    return  result    ;
   }
  export function dimentionHorTextBottom(X,Y,Scl,lenght,height,ofset,options){
    let result = []
    result=result.concat(dimention(X , Y  ,Scl,lenght,height,ofset,180, options))  
    let currentY=Y -height-ofset+1*Scl
  let text = { text: `${lenght/Scl} cm`.toString(), x:X  -14*Scl  ,y:currentY, textHeight:6* Scl }
  text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
   
    return  result    ;
   }
 export function dimention(X,Y,Scl,lenght,height,ofset,rotation,options){
  let result = []

  let currentY=Y+height+ofset
  let posXright=X-lenght/2
  let posXleft=X+lenght/2

  let vertices=[
  { x:posXright+4*Scl ,y:currentY,z:0 },
  { x:posXright+4*Scl ,y:currentY+2*Scl,z:0 },
  { x:posXright  ,y:currentY ,z:0 },
  { x:posXright+4*Scl ,y:currentY-2*Scl,z:0 },
  { x:posXright+4*Scl ,y:currentY,z:0 },
  { x:posXleft-4*Scl ,y:currentY,z:0 },
  { x:posXleft-4*Scl ,y:currentY+2*Scl,z:0 },
  { x:posXleft  ,y:currentY,z:0 },
  { x:posXleft-4*Scl  ,y:currentY-2*Scl,z:0 },
  { x:posXleft-4*Scl  ,y:currentY ,z:0 },

  

  
]
options.shape=true
 
 result=result.concat(PolyLine(X,Y,vertices,options)) 
 result=result.concat(PolarLine(posXright ,Y+ofset ,90,height,  options))
 result=result.concat(PolarLine(posXleft ,Y+ofset ,90,height,  options))
/* let text = { text: `${lenght/Scl} cm`.toString(), x:0   ,y:0, textHeight:6* Scl }
 result = result.concat(Text(X-11*Scl, currentY+Scl*1 , text, rotation, options)) */


  return dondur(result,  rotation,X,Y);
 }
export function Circle(x, y,r, options = {}) {
    const {
      color,
      colorIndex,
      layer,
      lineType,
      lineweight
    } = options;
  
    const result = {
        type:"CIRCLE",
        radius: r,
      center:{x:x, y:y,z:0}
    };
  
    // color varsa ekle
    if (color) {
      result.color = color;
    }
    if ( colorIndex  ) {
      result.colorIndex = colorIndex;
    }
    if (layer) {
      result.layer = layer;
    }
    if (lineType) {
      result.lineType = lineType;
    }

    if (  lineweight ) {
      result.lineweight = lineweight;
    }
  
    return result;
  }
 export  function calculateBoundingBox(result) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    result.forEach(item => {
        switch (item.type) {
            case "LINE":
                item.vertices.forEach(vertex => {
                    minX = Math.min(minX, vertex.x);
                    minY = Math.min(minY, vertex.y);
                    maxX = Math.max(maxX, vertex.x);
                    maxY = Math.max(maxY, vertex.y);
                });
                break;

            case "LWPOLYLINE":
                item.vertices.forEach(vertex => {
                    minX = Math.min(minX, vertex.x);
                    minY = Math.min(minY, vertex.y);
                    maxX = Math.max(maxX, vertex.x);
                    maxY = Math.max(maxY, vertex.y);
                });
                break;

            case "ARC":
                const arcMinX = item.center.x - item.radius;
                const arcMinY = item.center.y - item.radius;
                const arcMaxX = item.center.x + item.radius;
                const arcMaxY = item.center.y + item.radius;
                minX = Math.min(minX, arcMinX);
                minY = Math.min(minY, arcMinY);
                maxX = Math.max(maxX, arcMaxX);
                maxY = Math.max(maxY, arcMaxY);
                break;

            case "CIRCLE":
                const circleMinX = item.center.x - item.radius;
                const circleMinY = item.center.y - item.radius;
                const circleMaxX = item.center.x + item.radius;
                const circleMaxY = item.center.y + item.radius;
                minX = Math.min(minX, circleMinX);
                minY = Math.min(minY, circleMinY);
                maxX = Math.max(maxX, circleMaxX);
                maxY = Math.max(maxY, circleMaxY);
                break;

            default:
            //    console.warn(`Unknown type: ${item.type}`);
        }
    });

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}
export const moveDraw2 = (data, dx, dy) => {
  if (!Array.isArray(data)) return []; // Eğer data geçersizse boş dizi döndür

  return data.map((item) => {
    const updatedItem = { ...item };

    // `vertices` alanını taşı
    if (Array.isArray(updatedItem.vertices)) {
      updatedItem.vertices = updatedItem.vertices.map((vertex) => ({
        x: vertex.x + dx,
        y: vertex.y + dy,
        z: vertex.z || 0,
      }));
    }

    // `center` alanını taşı
    if (updatedItem.center) {
      updatedItem.center = {
        x: updatedItem.center.x + dx,
        y: updatedItem.center.y + dy,
        z: updatedItem.center.z || 0,
      };
    }

    // `controlPoints` alanını taşı
    if (Array.isArray(updatedItem.controlPoints)) {
      updatedItem.controlPoints = updatedItem.controlPoints.map((point) => ({
        x: point.x + dx,
        y: point.y + dy,
        z: point.z || 0,
      }));
    }

    // `majorAxisEndPoint` alanını taşı (ELLIPSE türü için)
    if (updatedItem.majorAxisEndPoint) {
      updatedItem.majorAxisEndPoint = {
        x: updatedItem.majorAxisEndPoint.x + dx,
        y: updatedItem.majorAxisEndPoint.y + dy,
        z: updatedItem.majorAxisEndPoint.z || 0,
      };
    }

    return updatedItem;
  });
};
export const moveDraw3 = (data, dx, dy) => {
  if (!Array.isArray(data)) return []; // Eğer data geçersizse boş dizi döndür

  return data.map((item) => {
    const updatedItem = { ...item };

    // `vertices` alanını taşı
    if (Array.isArray(updatedItem.vertices)) {
      updatedItem.vertices = updatedItem.vertices.map((vertex) => ({
        x: vertex.x + dx,
        y: vertex.y + dy,
        z: vertex.z || 0,
      }));
    }

    // `center` alanını taşı
    if (updatedItem.center) {
      updatedItem.center = {
        x: updatedItem.center.x + dx,
        y: updatedItem.center.y + dy,
        z: updatedItem.center.z || 0,
      };
    }

    // `controlPoints` alanını taşı
    if (Array.isArray(updatedItem.controlPoints)) {
      updatedItem.controlPoints = updatedItem.controlPoints.map((point) => ({
        x: point.x + dx,
        y: point.y + dy,
        z: point.z || 0,
      }));
    }

    // `majorAxisEndPoint` alanını taşı (ELLIPSE türü için)
    if (updatedItem.majorAxisEndPoint) {
      updatedItem.majorAxisEndPoint = {
        x: updatedItem.majorAxisEndPoint.x + dx,
        y: updatedItem.majorAxisEndPoint.y + dy,
        z: updatedItem.majorAxisEndPoint.z || 0,
      };
    }

    // `HATCH` türü için `boundaryPath.groups` alanını taşı
    if (updatedItem.type === "HATCH" && Array.isArray(updatedItem.boundaryPath)) {
      updatedItem.boundaryPath = updatedItem.boundaryPath.map((boundary) => {
        if (Array.isArray(boundary.groups)) {
          boundary.groups = boundary.groups.map((group) => {
            const updatedGroup = { ...group };

            // `Line` türü için koordinatları taşı
            if (group.edgeType === "Line") {
              updatedGroup.x1 += dx;
              updatedGroup.y1 += dy;
              updatedGroup.x2 += dx;
              updatedGroup.y2 += dy;
            }

            // `CircularArc` ve `EllipticArc` türleri için merkezi taşı
            if (group.edgeType === "CircularArc" || group.edgeType === "EllipticArc") {
              updatedGroup.x += dx;
              updatedGroup.y += dy;
              if (group.EndPointX !== undefined) {
                updatedGroup.EndPointX += dx;
                updatedGroup.EndPointY += dy;
              }
            }

            // `Spline` türü için `points` dizisini taşı
            if (group.edgeType === "Spline") {
              if (Array.isArray(group.points)) {
                updatedGroup.points = group.points.map((value, index) =>
                  index % 2 === 0 ? value + dx : value + dy // x ve y koordinatlarını sırayla taşı
                );
              }
            }

            // `Polyline` türü için `points` dizisini taşı
            if (group.edgeType === "Polyline") {
              if (Array.isArray(group.points)) {
                updatedGroup.points = group.points.map((value, index) =>
                  index % 2 === 0 ? value + dx : value + dy // x ve y koordinatlarını sırayla taşı
                );
              }
            }

            return updatedGroup;
          });
        }
        return boundary;
      });
    }

    return updatedItem;
  });
};
export const moveDraw = (data, dx, dy, scaleX = 1, scaleY = 1) => {
  if (!Array.isArray(data)) return []; // Eğer data geçersizse boş dizi döndür

  return data.map((item) => {
    const updatedItem = { ...item };

    // `vertices` alanını taşı ve ölçekle
    if (Array.isArray(updatedItem.vertices)) {
      updatedItem.vertices = updatedItem.vertices.map((vertex) => ({
        x: vertex.x * scaleX + dx,
        y: vertex.y * scaleY + dy,
        z: vertex.z || 0,
      }));
    }

    // `center` alanını taşı ve ölçekle
    if (updatedItem.center) {
      updatedItem.center = {
        x: updatedItem.center.x * scaleX + dx,
        y: updatedItem.center.y * scaleY + dy,
        z: updatedItem.center.z || 0,
      };
    }

    // `controlPoints` alanını taşı ve ölçekle
    if (Array.isArray(updatedItem.controlPoints)) {
      updatedItem.controlPoints = updatedItem.controlPoints.map((point) => ({
        x: point.x * scaleX + dx,
        y: point.y * scaleY + dy,
        z: point.z || 0,
      }));
    }

    // `majorAxisEndPoint` alanını taşı ve ölçekle (ELLIPSE türü için)
    if (updatedItem.majorAxisEndPoint) {
      updatedItem.majorAxisEndPoint = {
        x: updatedItem.majorAxisEndPoint.x * scaleX + dx,
        y: updatedItem.majorAxisEndPoint.y * scaleY + dy,
        z: updatedItem.majorAxisEndPoint.z || 0,
      };
    }

    // `HATCH` türü için `boundaryPath.groups` alanını taşı ve ölçekle
    if (updatedItem.type === "HATCH" && Array.isArray(updatedItem.boundaryPath)) {
      updatedItem.boundaryPath = updatedItem.boundaryPath.map((boundary) => {
        if (Array.isArray(boundary.groups)) {
          boundary.groups = boundary.groups.map((group) => {
            const updatedGroup = { ...group };

            // `Line` türü için koordinatları taşı ve ölçekle
            if (group.edgeType === "Line") {
              updatedGroup.x1 = group.x1 * scaleX + dx;
              updatedGroup.y1 = group.y1 * scaleY + dy;
              updatedGroup.x2 = group.x2 * scaleX + dx;
              updatedGroup.y2 = group.y2 * scaleY + dy;
            }

            // `CircularArc` ve `EllipticArc` türleri için merkezi taşı ve ölçekle
            if (group.edgeType === "CircularArc" || group.edgeType === "EllipticArc") {
              updatedGroup.x = group.x * scaleX + dx;
              updatedGroup.y = group.y * scaleY + dy;
              if (group.EndPointX !== undefined) {
                updatedGroup.EndPointX = group.EndPointX * scaleX + dx;
                updatedGroup.EndPointY = group.EndPointY * scaleY + dy;
              }
            }

            // `Spline` türü için `points` dizisini taşı ve ölçekle
            if (group.edgeType === "Spline") {
              if (Array.isArray(group.points)) {
                updatedGroup.points = group.points.map((value, index) =>
                  index % 2 === 0
                    ? value * scaleX + dx // x koordinatları
                    : value * scaleY + dy // y koordinatları
                );
              }
            }

            // `Polyline` türü için `points` dizisini taşı ve ölçekle
            if (group.edgeType === "Polyline") {
              if (Array.isArray(group.points)) {
                updatedGroup.points = group.points.map((value, index) =>
                  index % 2 === 0
                    ? value * scaleX + dx // x koordinatları
                    : value * scaleY + dy // y koordinatları
                );
              }
            }

            return updatedGroup;
          });
        }
        return boundary;
      });
    }

    return updatedItem;
  });
};
export const voltageDrop=(voltage=380,power,phase=3,length,crosSecArea,material="Cu")=>{

  let conductivity=56
if(material==="Al"){conductivity=35}
let coefficient =0  //Katsayı
let voltageDropPercent=0 // gerilim düşümü
if(phase===3){
  coefficient=((100)/(conductivity*voltage*voltage)).toFixed(7)
  voltageDropPercent=((length*power)/(crosSecArea)*coefficient).toFixed(3) // % gerilim düşümü
}else if(phase===1){
  coefficient=((200)/(conductivity*voltage*voltage)).toFixed(7)
  voltageDropPercent=((length*power)/(crosSecArea)*coefficient ).toFixed(3)// % gerilim düşümü

}
let diffirentVoltage=voltage*(100-voltageDropPercent)/100   //Gerilim düşümü farkı volt olarak
let dropedVoltage=voltage-diffirentVoltage    //yeni gerilim
return {
  voltageDropPercent:voltageDropPercent,
  diffirentVoltage:diffirentVoltage, 
  coefficient:coefficient,
  conductivity:conductivity,
  dropedVoltage:dropedVoltage
}
}
 

function generateStableId(element) {
  let faktor="0"
  if(element.handFak){faktor=element.handFak}
  return `text-${element.text}-${element.x}-${element.y}-${element.textHeight}-${element.faktor}`;
}



