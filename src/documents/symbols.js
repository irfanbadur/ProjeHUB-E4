 
import {Rectangle,PolyLine,Circle,Line,PolarLine,Arc,Hatch,Text} from "./utils"; 

 
export function AnahtarliOtomatikSigorta(X,Y,Scl,PolarCount,rotation,options){
let result=[]
  result.push(Rectangle(X-Scl*12,Y-Scl*5,24*Scl,10*Scl,options))
  result.push(Circle(X ,Y ,5*Scl, options))

switch(PolarCount){
  case 1:
    result.push(Line(X-6*Scl ,Y-10*Scl,X+6*Scl,Y+10*Scl ,  options))
  break;
  case 2:
    result.push(Line(X-8*Scl ,Y-10*Scl,X+4*Scl,Y+10*Scl ,  options))
    result.push(Line(X-4*Scl ,Y-10*Scl,X+6*Scl,Y+10*Scl ,  options))
  break;
  case 3:
  result.push(Line(X-6*Scl ,Y-10*Scl,X+6*Scl,Y+10*Scl ,  options))
  result.push(Line(X-10*Scl ,Y-10*Scl,X+2*Scl,Y+10*Scl ,  options))
  result.push(Line(X-2*Scl ,Y-10*Scl,X+10*Scl,Y+10*Scl ,  options))
  break;
  case 4:
    result.push(Line(X-8*Scl ,Y-10*Scl,X+4*Scl,Y+10*Scl ,  options))
    result.push(Line(X-12*Scl ,Y-10*Scl,X ,Y+10*Scl ,  options))
    result.push(Line(X-4*Scl ,Y-10*Scl,X+6*Scl,Y+10*Scl ,  options))
    result.push(Line(X  ,Y-10*Scl,X+10*Scl,Y+10*Scl ,  options))
  break;
case 5:
  result.push(Line(X-6*Scl ,Y-10*Scl,X+6*Scl,Y+10*Scl ,  options))
  result.push(Line(X-10*Scl ,Y-10*Scl,X+2*Scl,Y+10*Scl ,  options))
  result.push(Line(X-14*Scl ,Y-10*Scl,X-2*Scl,Y+10*Scl ,  options))
  result.push(Line(X-2*Scl ,Y-10*Scl,X+10*Scl,Y+10*Scl ,  options))
  result.push(Line(X+2*Scl ,Y-10*Scl,X+14*Scl,Y+10*Scl ,  options))
  break;

}

return dondur(result,  rotation,X,Y);

}
export function PanoAnaTali(X,Y,width,height,Scl,rotation,options){
let result=[]
  result.push(Rectangle(X-width/2 ,Y-height/2 ,width,height,options))
 
  const path1=[
    {IsClosedFlag:1,
      edgeType:"Polyline",
      NumberOfPolylineVertices:3,
      points:[
        X,Y,
        X-width/2, Y-height/2,
        X-width/2, Y+height/2,      
      ]
    }
  ]
  const path2=[
    {IsClosedFlag:1,
      edgeType:"Polyline",
      NumberOfPolylineVertices:3,
      points:[
        X,Y,
        X+width/2, Y-height/2,
        X+width/2, Y+height/2,       
      ]
    }
  ]
  result.push(Hatch(X   ,Y  , path1,rotation,  options)) 
  result.push(Hatch(X   ,Y  , path2,rotation,  options)) 

  return dondur(result,  rotation,X,Y);


}
export function PanoTali(X,Y,width,height,Scl,rotation,options){
let result=[]
  result.push(Rectangle(X-width/2 ,Y-height/2 ,width,height,options))
 
  const path=[
    {IsClosedFlag:1,
      edgeType:"Polyline",
      NumberOfPolylineVertices:3,
      points:[
        X-width/2, Y-height/2,
        X-width/2, Y +height/2,
        X+width/2, Y-height/2
      ]
    }
  ]
  result.push(Hatch(X   ,Y  , path,rotation,  options)) 

  return dondur(result,  rotation,X,Y);


}
 
export function YuvarlakSolid(X, Y, r, Scl, options) {
  const segments = [
    {
      type: 'arc',
      center: { x: X, y: Y },
      radius: r * Scl,
      startAngle: 0,
      endAngle: Math.PI * 2,
      clockwise: false,
    }
  ];

  const entity = {
    type: 'solidhatch',
    segments: segments,
    ...options
  };

  return [entity];
}
export function Firin(X,Y, Scl,rotation,options){
let result=[]
result.push(Rectangle(X-25*Scl ,Y-25*Scl ,50*Scl,50*Scl,options)) 
result.push(PolarLine(X-25*Scl ,Y+12*Scl,0,50*Scl ,  options))
const path=[
  {IsClosedFlag:1,
    edgeType:"Line",
    NumberOfPolylineVertices:2,
    bulge:true,
    points:[
      X-5*Scl, Y,1,
      X+5*Scl, Y ,1
    ]
  }
]
     result.push(...YuvarlakSolid(X,Y,5*Scl, Scl,options))

  return dondur(result,  rotation,X,Y);
}
 
export function Mak(X,Y, string,Scl,rotation,options){
  let result=[]
  options.shape = true

  result.push(Rectangle(X-25*Scl ,Y-25*Scl ,50*Scl,50*Scl,options))
  result.push(Circle(X ,Y ,20*Scl, options))
  let text = { text: string, handle: generateTimestampedId(), textHeight: 20 * Scl }

  result.push(Text(X-10*Scl ,Y-text.textHeight/2 ,text,rotation,  options))
  
 
   
    return dondur(result,  rotation,X,Y);
  }
export function CihazBox(X,Y, text,Scl,rotation,options){
  let result=[]
  result.push(Rectangle(X-25*Scl ,Y-10*Scl ,50*Scl,20*Scl,options))
  result.push(Text(X-22*Scl ,Y-text.textHeight/2 ,text,25*Scl,0, options))
  
 
   
    return dondur(result,  rotation,X,Y);
  }
export function CamasirMak(X,Y, Scl,rotation,options){
let result=[]
result.push(Rectangle(X-25*Scl ,Y-25*Scl ,50*Scl,50*Scl,options))
result.push(Circle(X ,Y ,9*Scl, options))
result.push(Circle(X ,Y ,20*Scl, options))

//result.push(PolarLine(X ,Y,-90,21 ,  options))
 
  return dondur(result,  rotation,X,Y);
}
export function Sayac(X,Y, Scl,faz,  rotation,options){
  let result=[]
  result.push(Rectangle(X-20*Scl ,Y-20*Scl ,40*Scl,40*Scl,options))
  //result.push(Circle(X ,Y ,9*Scl, options))
  if(faz===3){
    result.push(PolarLine(X-20*Scl ,Y+10*Scl,0,40*Scl ,  options))
 
  }
  let  text={text:"Wh".toString(),handle:generateTimestampedId(),textHeight:15*Scl}  

  result.push(PolarLine(X-20*Scl ,Y+15*Scl,0,40*Scl ,  options))
  result.push(Text(X-15*Scl ,Y-10*Scl  ,text,  0,options))
  

  //result.push(PolarLine(X ,Y,-90,21 ,  options))
   
    return dondur(result,  rotation,X,Y);
  }
export function Lamba(X,Y, Scl,rotation,options){
let result=[]
result.push(Circle(X ,Y ,18*Scl, options))

result.push(PolarLine(X-17.1585*Scl ,Y+5.4394*Scl,-18,36*Scl ,  options))
result.push(PolarLine(X-5.7394*Scl ,Y-17.1585*Scl,72,36*Scl ,  options))
 
  return dondur(result,  rotation,X,Y);
}
export function Anahtar(X,Y, Scl,rotation,options){
let result=[]
result.push(PolarLine(X,Y,-90,10*Scl ,  options))

result.push(Circle(X ,Y-15*Scl ,5*Scl, options))

result.push(PolarLine(X ,Y-20*Scl,-90,10*Scl ,  options))
result.push(PolarLine(X ,Y-30*Scl,0,5*Scl ,  options))
 
  return dondur(result,  rotation,X,Y);
}
export function BulasikMak(X,Y, Scl,rotation,options){
let result=[]
result.push(Rectangle(X-25*Scl ,Y-25*Scl ,50*Scl,50*Scl,options))
result.push(Circle(X ,Y ,9*Scl, options))
result.push(Circle(X ,Y ,20*Scl, options))

result.push(PolarLine(X+14.1421*Scl ,Y+14.1421*Scl,45,15.3553*Scl ,  options))
result.push(PolarLine(X-14.1421*Scl ,Y+14.1421*Scl,135,15.3553*Scl ,  options))
result.push(PolarLine(X-14.1421*Scl ,Y-14.1421*Scl,225,15.3553*Scl ,  options))
result.push(PolarLine(X+14.1421*Scl ,Y-14.1421*Scl,315,15.3553*Scl ,  options))
 
  return dondur(result,  rotation,X,Y);
}
export function InterkonButonGrup(X,Y, Scl,rotation,options){
let result=[]
options.shape=true
result.push(Rectangle(X-20*Scl ,Y-20*Scl ,40*Scl,40*Scl,options))
result.push(Rectangle(X-18*Scl ,Y+0*Scl ,36*Scl,18*Scl,options))
result.push(Circle(X-10*Scl ,Y+10*Scl ,4*Scl, options))
 
result.push(PolarLine(X-18*Scl ,Y-2*Scl,0,36*Scl ,  options))
result.push(PolarLine(X-18*Scl ,Y-6*Scl,0,36*Scl ,  options))
result.push(PolarLine(X-18*Scl ,Y-10*Scl,0,36*Scl ,  options))
result.push(PolarLine(X-18*Scl ,Y-14*Scl,0,36*Scl ,  options))
result.push(PolarLine(X-18*Scl ,Y-18*Scl,0,36*Scl ,  options))

result.push(PolarLine(X-18*Scl ,Y-2*Scl,270,16*Scl ,  options))
result.push(PolarLine(X-14*Scl ,Y-2*Scl,270,16*Scl ,  options))
result.push(PolarLine(X+0*Scl ,Y-2*Scl,270,16*Scl ,  options))  
result.push(PolarLine(X+4*Scl ,Y-2*Scl,270,16*Scl ,  options))
result.push(PolarLine(X+18*Scl ,Y-2*Scl,270,16*Scl ,  options))
 
  return dondur(result,  rotation,X,Y);
}
export function InterkonButonMonGroup(X,Y, Scl,rotation,options){
  let result=[]
  options.shape=true
  result.push(Rectangle(X-5*Scl ,Y-20*Scl ,10*Scl,10*Scl,options))
  result.push(Rectangle(X-5*Scl ,Y+10*Scl ,10*Scl,20*Scl,options))
  result=result.concat(hatchedCircle(X ,Y ,1.5*Scl,Scl, options))
  result.push(Circle(X-0*Scl ,Y+25*Scl ,3*Scl, options))
   
  result.push(PolarLine(X-4*Scl ,Y+12*Scl,0,8*Scl ,  options))
  result.push(PolarLine(X-4*Scl ,Y+15*Scl,0,8*Scl ,  options))
  result.push(PolarLine(X-4*Scl ,Y+18*Scl,0,8*Scl ,  options))
  result.push(Circle(X-0*Scl ,Y-15*Scl ,3*Scl, options))
  
  result.push(PolarLine(X-0*Scl ,Y-10*Scl,90,20*Scl ,  options))
   
    return dondur(result,  rotation,X,Y);
  }
export function Priz(X,Y, Scl,rotation,options){
let result=[]
result.push(PolarLine(X ,Y,-90,21 ,  options))
result.push(PolarLine(X-7*Scl ,Y-21*Scl,0,14 ,  options)) 
result.push(Arc(X   ,Y-28*Scl ,7 ,0,180,   options)) 

  return dondur(result,  rotation,X,Y);


}
export function Boru(X,Y, boy, Scl,rotation,options){
let result=[]
result.push(PolarLine(X ,Y+20*Scl,0,boy ,  options))
result.push(PolarLine(X ,Y-20*Scl,0,boy ,  options)) 
result.push(Arc(X +13.2664*Scl  ,Y  ,24*Scl ,124,236,   options)) 
result.push(Arc(X+ boy  +13.2664*Scl  ,Y  ,24*Scl ,124,236,   options)) 
result.push(Arc(X+ boy  -13.2664*Scl  ,Y  ,24*Scl ,56,-56,   options)) 

  return dondur(result,  rotation,X,Y);


}
 
export function KacakAkim(X,Y,Scl,rotation,options){
let result=[]
  result.push(Circle(X-Scl*8 ,Y ,2*Scl, options))
  result.push(Circle(X+Scl*8 ,Y ,2*Scl, options))
  result.push(PolarLine(X+8*Scl ,Y,150,18*Scl ,  options))
  result.push(PolarLine(X+0.2331*Scl ,Y+4.4842*Scl,60,5.0181*Scl,  options))
  const vertices=[
    { x:X+4.4784*Scl ,y:Y+7.8301*Scl,z:0 },
    { x:X+3.7464*Scl ,y:Y+10.5622*Scl,z:0 },
    { x:X+1.0143*Scl ,y:Y+9.8301*Scl,z:0 },
    
  ]
  options.shape=true
  result.push(PolyLine(X+4.4784*Scl,Y+7.8301*Scl,vertices,options))
  result.push(PolarLine(X+5.9784*Scl ,Y+10.4282*Scl,150,4*Scl,  options))
  result.push(PolarLine(X+4.2464*Scl ,Y+11.4282*Scl,60,2*Scl,  options))


  return dondur(result,  rotation,X,Y);
  //return result

}
export function KacakAkimTMS2(X,Y,Scl,rotation,options){
  let result=[]
    result.push(Circle(X-Scl*15 ,Y ,2*Scl, options))
    result.push(Circle(X+Scl*15 ,Y ,2*Scl, options))
    result.push(PolarLine(X-15*Scl ,Y,30,34.641*Scl ,  options))
    const vertices=[
      { x:X-4.3301*Scl ,y:Y+6.1603*Scl,z:0 },
      { x:X-6.4405*Scl ,y:Y+9.8156*Scl,z:0 },
      { x:X-9.7228*Scl ,y:Y+7.926*Scl,z:0 },
      { x:X-12.4844*Scl ,y:Y+12.7231*Scl,z:0 },
      { x:X-9.2082*Scl ,y:Y+14.6093*Scl,z:0 },  
      { x:X-11.8301*Scl ,y:Y+19.0866*Scl,z:0 },
      
    ]
    options.shape=false
    result.push(PolyLine(X+4.4784*Scl,Y+7.8301*Scl,vertices,options))
    const vertices2=[
      { x:X+4.3301*Scl ,y:Y+11.1603*Scl,z:0 },
      { x:X-0.6042*Scl ,y:Y+19.5648*Scl,z:0 },
      { x:X-2.5974*Scl ,y:Y+18.5014*Scl,z:0 },
      { x:X-2.9082*Scl ,y:Y+23.7010*Scl,z:0 },
      { x:X+1.3889*Scl ,y:Y+20.6282*Scl,z:0 },
      { x:X-0.6042*Scl ,y:Y+19.5648*Scl,z:0 },
      
    ]
    options.shape=false
    result.push(PolyLine(X+4.4784*Scl,Y+7.8301*Scl,vertices2,options))
  
  
    return dondur(result,  rotation,X,Y);
    //return result
  
  }      
export function KacakAkimTMS(X,Y,Scl,rotation,options){
  let result=[]
    result.push(Circle(X-Scl*8 ,Y ,2*Scl, options))
    result.push(Circle(X+Scl*8 ,Y ,2*Scl, options))
    result.push(PolarLine(X+8*Scl ,Y,150,18*Scl ,  options))
    result.push(PolarLine(X+0.2331*Scl ,Y+4.4842*Scl,60,5.0181*Scl,  options))
    const vertices=[
      { x:X+4.4784*Scl ,y:Y+7.8301*Scl,z:0 },
      { x:X+3.7464*Scl ,y:Y+10.5622*Scl,z:0 },
      { x:X+1.0143*Scl ,y:Y+9.8301*Scl,z:0 },
      
    ]
    options.shape=true
    result.push(PolyLine(X+4.4784*Scl,Y+7.8301*Scl,vertices,options))
    const vertices2=[
      { x:X+4.8699*Scl ,y:Y+1.75*Scl,z:0 },
      { x:X+7.4823*Scl ,y:Y+6.1033*Scl,z:0 },
      { x:X+5.7502*Scl ,y:Y+7.1033*Scl,z:0 },
      { x:X+7.0069*Scl ,y:Y+9.3655*Scl,z:0 },
      { x:X+8.739*Scl ,y:Y+8.2799*Scl,z:0 },
      { x:X+9.5768*Scl ,y:Y+9.731*Scl,z:0 },
      
    ]
    options.shape=false
    result.push(PolyLine(X+4.4784*Scl,Y+7.8301*Scl,vertices2,options))
    result.push(PolarLine(X+5.9784*Scl ,Y+10.4282*Scl,150,4*Scl,  options))
    result.push(PolarLine(X+4.2464*Scl ,Y+11.4282*Scl,60,2*Scl,  options))
  
  
    return dondur(result,  rotation,X,Y);
    //return result
  
  }      

export function dondur(objects, aci, centerX, centerY) {
  // Dereceyi radyana çevir
  const angleRad = (Math.PI / 180) * aci;

  return objects.map((nesne) => {
    switch (nesne.type) {
      case 'LINE': {
        // LINE nesnesinin 2 noktalı (veya birden fazla noktalı) 'vertices' array'ini döndürüyoruz
        const newVertices = nesne.vertices.map((v) =>
          rotatePoint(centerX, centerY, v.x, v.y, angleRad)
        );
        return {
          ...nesne,
          vertices: newVertices
        };
      }

      case 'LWPOLYLINE': {
        // LWPOLYLINE de benzer şekilde çoklu vertices içerir
        const newVertices = nesne.vertices.map((v) =>
          rotatePoint(centerX, centerY, v.x, v.y, angleRad)
        );
        return {
          ...nesne,
          vertices: newVertices
        };
      }

      case 'CIRCLE': {
        // CIRCLE sadece center etrafında döner
        const newCenter = rotatePoint(centerX, centerY, nesne.center.x, nesne.center.y, angleRad);
        return {
          ...nesne,
          center: {
            ...nesne.center,
            x: newCenter.x,
            y: newCenter.y
          }
        };
      }
  

      case 'ARC': {
        // ARC için hem center döndürülür hem de açıları güncelleriz (startAngle ve endAngle)
        const newCenter = rotatePoint(centerX, centerY, nesne.center.x, nesne.center.y, angleRad);

        // Eğer açılar global referansa göre tutuluyorsa, açılardan da aci'yi çıkarabilir (veya ekleyebilirsiniz).
        // Burada eski örneğe paralel olarak -aci yapıldı.
        const newStartAngle = (nesne.startAngle + angleRad) % 360;
        const newEndAngle = (nesne.endAngle + angleRad) % 360;

        return {
          ...nesne,
          center: {
            ...nesne.center,
            x: newCenter.x,
            y: newCenter.y
          },
          startAngle: newStartAngle,
          endAngle: newEndAngle
        };
      }
 
      case 'TEXT':
        const newTextXY = rotatePoint(centerX, centerY, nesne.x, nesne.y, angleRad);
        return { ...nesne, x: newTextXY.x, y: newTextXY.y };

      // Eğer TEXT veya başka tipler varsa benzer şekilde ekleyebilirsiniz.
      // case 'TEXT': ...
      //   break;

      default:
        // Tanımlı olmayan type'larda dönüşüm yapılmaz, aynen döndür.
        return nesne;
    }
  });
}
export function rotatePoint(cx, cy, px, py, angleRad) {
  // Merkezden noktaya göre vektör
  const dx = px - cx;
  const dy = py - cy;

  // Döndürme matrisi uygulama
  const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
  const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

  // Tekrar merkez koordinatlarına ekle
  return {
    x: cx + rotatedX,
    y: cy + rotatedY
  };
}
let counter = 0;
function generateTimestampedId() {
  counter++;
  const timestamp = Date.now(); // Milisaniye cinsinden zaman
  return `id-${timestamp}-${counter}`;
}
export function hatchedCircle(X,Y,R,Scl,options){
      return YuvarlakSolid(X,Y,R*Scl, Scl,options) 
}