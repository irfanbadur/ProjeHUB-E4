import * as THREE from 'three';

 
export function checkIntersection(start1, end1, start2, end2) {
    // Kullanıcının çizgisi: (x1, y1) -> (x2, y2)
 
     
    const x1 = start1.x, y1 = start1.y;
    const x2 = end1.x, y2 = end1.y; 
  //  console.log(" POİNTS 1: ",x1.toFixed(2)," | ",y1.toFixed(2)," | ",x2.toFixed(2)," | ",y2.toFixed(2))
  
    // Sahnedeki çizgi: (x3, y3) -> (x4, y4)
    const x3 = start2.x, y3 = start2.y;
    const x4 = end2.x, y4 = end2.y;
   // console.log(" POİNTS 2: ",x3 ," | ",y3 ," | ",x4 ," | ",y4 )
    
    // İki doğrunun kesişim formüllerinde ortak kullanılan payda (denom)
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    // Eğer payda sıfırsa, çizgiler paralel veya çakışık demektir, kesişim yoktur.
    if (denom === 0) {
      return null;
    }
    
    // Parametrik denklemdeki t ve u değerlerini hesaplıyoruz
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;
  //  console.log("DENOM:",denom.toFixed(2), " T:",t.toFixed(2) ,"   U:",u.toFixed(2))
    
    // 1. Adım: Kullanıcının çizgisi segment olarak kesişiyorsa (t ve u [0,1] aralığında olsun)
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    // 2. Adım: Kullanıcının çizgisi segment halinde kesişmiyorsa, ışın (ray) şeklinde düşünüyoruz:
    // Kullanıcının çizgisi başlangıç noktasından başlayıp sonsuza kadar giden bir ışın olarak ele alınır,
    // bu durumda t parametresi [0, ∞) aralığında olabilir. Ancak, sahnedeki çizgi (u) segment olarak kalır.
  /*   if (t >= 0 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
     */
    // Hiçbir durumda kesişim yoksa null döndür
    return null;
  }
  export function checkIntersection2(start1, end1, start2, end2) {
    // Eğer kullanıcı çizgisinin başlangıç noktası ile sahnedeki çizginin başlangıç noktası aynıysa, hesaplama yapma
    if (start1 === start2) return null;
  
    // Kullanıcının çizgisi: (x1, y1) -> (x2, y2)
    const x1 = start1.x, y1 = start1.y;
    const x2 = end1.x, y2 = end1.y;
    
    // Sahnedeki çizgi: (x3, y3) -> (x4, y4)
    const x3 = start2.x, y3 = start2.y;
    const x4 = end2.x, y4 = end2.y;
    
    // İki doğrunun kesişim formüllerinde ortak kullanılan payda (denom)
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    // Eğer payda sıfırsa, çizgiler paralel veya çakışık demektir, kesişim yoktur.
    if (denom === 0) {
      return null;
    }
    
    // Parametrik denkleme göre t ve u değerlerini hesaplıyoruz.
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;
    
    // Her iki parametre de [0, 1] aralığındaysa, segmentlerin kesişimi vardır.
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    
    // Segmentlerin kesişimi yoksa, null döndür.
    return null;
  }
  