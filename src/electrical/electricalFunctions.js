import { Iletken,MCB,RCD } from "./Malzeme";
  
export function findCableByCurrent(current,phaseCount,kapType,minKesit,tolerans){

const toleransedCurrent=current*tolerans/100+current

const iletken =Iletken.find((obj)=>obj.HavaAK>=toleransedCurrent&&obj.Kesit>=minKesit&&obj.KesitSayi===phaseCount)
return iletken
}
export function findAOSForCable(currentCable,I0,phaseCount,minI0,type,Ith,tolerans){
const toleransedCurrent=currentCable*tolerans/100+currentCable

const kesici=MCB.find((obj)=>
    obj.Akim<=toleransedCurrent && 
    obj.Akim>=I0 && 
    obj.Akim>=minI0 && 
    obj.KisaDevreAkim===Ith&& 
    obj.Polar===phaseCount&& 
    obj.Tip===type

)
    return kesici
}
export function findKAKRByCurrent(current,phaseCount,Duyarlilik,type){
 
const kesici=RCD.find((obj)=>obj.Akim===current && obj.Polar===phaseCount && obj.Duyarlilik===Duyarlilik)
    return kesici
}