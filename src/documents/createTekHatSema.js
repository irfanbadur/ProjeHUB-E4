 
import {Rectangle,PolyLine,Circle,Line,PolarLine,Arc,Text} from "./utils"
import {AnahtarliOtomatikSigorta,
        BulasikMak,
        CamasirMak,
        CihazBox,
        Firin,
        KacakAkim,
        Mak,
        PanoTali,
        Priz,
        Lamba,
        Anahtar,
        YuvarlakSolid} from "./symbols"
        
export const createTekHatSema = ( X,Y,W,H, branchies) => {
 // console.log("createTekHatSema: ",branchies)
  let result = []
console.log("TEK HAT ŞEMASI : ",branchies)
  const layers = {
    0: { name: '0', frozen: false, visible: true, colorIndex: 7, color: 16777215 },
    18: { name: '18', frozen: false, visible: true, colorIndex: 1, color: 16711680 },
    AKSYAZI: { name: 'AKSYAZI', frozen: false, visible: true, colorIndex: 9, color: 12632256 }
  };
  const layer= layers.AKSYAZI
  const layer2= layers[18]
   const options={color:layer.color,
    colorIndex:layer.colorIndex,   
    layer:layer.name,
   // lineType:layer.lineType,
    shape:true,
    hasContinuousLinetypePattern:false}
  const frameOptions={color:layer2.color,
    colorIndex:layer2.colorIndex,   
    layer:layer2.name,
    lineType:layer2.lineType,
    shape:true,
    hasContinuousLinetypePattern:false}

   
  const Scl=1
  const offsetOuts=20*Scl
  const countOfOut=branchies.length 
  const panoW=50*Scl
  const sorti_0_lenght=130*Scl 
  let panoH=20*Scl+countOfOut*20*Scl
  let boundingBox={
    startOffset:50*Scl,
    endOffset:50*Scl,
    bottomOffset:50*Scl,
    topOffset:50*Scl,
    width:600*Scl,
    height:panoH+sorti_0_lenght
  }
  let currentX=boundingBox.startOffset
   X=boundingBox.startOffset
  Y= panoH/2+sorti_0_lenght+boundingBox.bottomOffset

  result.push(PolarLine(X,Y ,0,200*Scl ,  options))
  currentX+=212*Scl
  result.push(...AnahtarliOtomatikSigorta(currentX, Y  , Scl,1, 0,options)) 
  currentX+=12*Scl
  result.push(PolarLine(currentX,Y ,0,61*Scl ,  options))
  currentX+=70*Scl
  result.push(...KacakAkim(currentX ,Y  , Scl,0, options)) 
  currentX+=9*Scl
  result.push(PolarLine(currentX,Y ,0,35*Scl ,  options))
  currentX+=60*Scl
  result.push(...PanoTali(currentX  ,Y   ,panoW,panoH,Scl,0, options)) 
  currentX+=panoW/2
  let currentX1 =currentX+42*Scl
  let currentY=Y+panoH/2-offsetOuts

  boundingBox.width=currentX+countOfOut*75*Scl+150*Scl 
  boundingBox.height=panoH+sorti_0_lenght
   
 
    const headerHeight=40*Scl 
const frameTop=boundingBox.height +boundingBox.bottomOffset+boundingBox.topOffset
const frameHeight=frameTop+headerHeight
const frameWidth=boundingBox.width +boundingBox.startOffset+boundingBox.endOffset

  result.push(Rectangle  (0,0,
    frameWidth,
   frameTop ,
    frameOptions)) 
  result.push(Rectangle  (0,frameTop  ,
    frameWidth,
   headerHeight ,
    frameOptions))    
    let text={text:"TEK HAT ŞEMASI".toString(),x:boundingBox.startOffset  ,y:frameTop+15*Scl,textHeight:15*Scl}  
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
 
    const textHeight=12*Scl
   branchies.forEach((branch,i) => {
    text={text:(i+1).toString(),x:currentX  ,y:currentY,textHeight:textHeight}  
    result.push(PolarLine(currentX,currentY ,0,30*Scl ,  options))    
    result.push(...AnahtarliOtomatikSigorta(currentX1, currentY  , Scl,1, 0,options)) 
    result.push(PolarLine(currentX1+12*Scl,currentY ,0,(countOfOut-i)*75*Scl+150*Scl ,  options))    
    let curX=currentX1+12*Scl+(countOfOut-i)*75*Scl+150*Scl
    result.push(PolarLine(curX,currentY ,-90, 50*Scl +(countOfOut-i)*20*Scl ,  options))    
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
 
      
const topY=currentY-(50*Scl +(countOfOut-i)*20*Scl)
   switch(branch.type){
    case"light":
    result.push(...Lamba(curX,topY-18*Scl, Scl,0,options))
    result.push(...Anahtar(curX,currentY, Scl,-40,options))
    result.push(...YuvarlakSolid(curX,currentY,2.5*Scl, Scl,options))
    text.text=branch.sorti+ " Ayd."
    text.handle=generateStableId(text)
    result.push(Text(curX, topY-40*Scl, text, 0, options)) 

    text.text=branch.totalPower+" W"
    text.handle=generateStableId(text)
    result.push(Text(curX/2,topY-18*Scl  , text, 0, options)) 

    text.text= "2x2.5 mm2 NYA"
    text.handle=generateStableId(text)
    result.push(Text(curX, text.y, text, 0, options)) 

    text.text= "2x1.5mm²" 
    text.handle=generateStableId(text)
    result.push(Text(curX-textHeight/2, topY+25*Scl , text, 90, options)) 

    text.text= "NYA" 
    text.handle=generateStableId(text)
    result.push(Text(curX+textHeight/2,topY+25*Scl , text, 90, options)) 
    break;
    case"socket":
    result.push(...Priz(curX,topY, Scl,0,options))
    text.text=branch.sorti+ "Priz"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text=branch.totalPower+" W"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text= "3x2.5 mm2 NYA"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    break;
    case"socketOven":
    result.push(...Firin(curX,topY-25*Scl, Scl,0,options))   
    text.text="Fırın"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text=branch.totalPower+" W"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text= "3x2.5 mm2 NYA"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    break;
    case"socketDish":
    result.push(...BulasikMak(curX,topY-25*Scl, Scl,0,options))    
    text.text="BulaşıkM."
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text=branch.totalPower+" W"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text= "3x2.5 mm2 NYA"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    break;
    case"socketWash":
    result.push(...CamasirMak(curX,topY-25*Scl, Scl,0,options))  
    text.text="ÇamaşırM."
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text=branch.totalPower+" W"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    text.text= "3x2.5 mm2 NYA"
    text.handle=generateStableId(text)
    result.push(Text(text.x, text.y, text, 0, options)) 
    break;
  } 

    currentY-=offsetOuts

  });
 
 


    return {result:result,width:frameWidth, height:frameHeight};
};
 
 

function generateStableId(element) {
  let faktor="0"
  if(element.handFak){faktor=element.handFak}
  return `text-${element.text}-${element.x}-${element.y}-${element.textHeight}-${ faktor}`;
}

  
 
  

  







