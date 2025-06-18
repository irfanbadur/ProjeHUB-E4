import * as THREE from 'three';
import { drawCircleFromCode } from '../commands/drawCircleFromCode';
import { useDispatch } from 'react-redux';
import { setCommandType, setOperationData, resetOperation } from '../redux/operationSlice';
import { generateUniqueId } from '../utils/generateUniqueId';
import { createTextSprite } from '../utils/createTextSprite'; // zaten sizde var
import { findAOSForCable, findCableByCurrent ,findKAKRByCurrent} from '../electrical/electricalFunctions';

export function usePanelModify(scene) {
    const dispatch = useDispatch();

    function findPanelById(panelId) {
        if (!scene) return null;
        return scene.children.find(obj => obj.userData?.id === panelId);
    }

    function updateGeometry (panel, outCount, width, symmetricalOffset     ) {
        const dir=panel.userData.dir
        const offsetGroup = panel.children.find(child => child.name === 'offsetGroup');
        const polyline = offsetGroup?.children.find(child => child.name === 'panel-outer');
        const hatch = offsetGroup?.children.find(child => child.name === 'panel-hatch');
        let height = (outCount * 5 + 10);
        const rezS=panel.userData.outSnaps.filter((obj)=>obj.userData.orderNo>0).length
        const rezE=panel.userData.outSnaps.filter((obj)=>obj.userData.orderNo<0).length
        const dif=rezS-rezE
        let startH=rezS*5
        let endH=rezE*5 

        if(panel.userData.endH>=endH){
            endH= panel.userData.endH
        }else{
            endH=rezE*5 
            offsetGroup.position.y -=  2.5;
            panel.userData.endH=endH
        }
        if(panel.userData.startH>=startH){
            startH= panel.userData.startH
        }else{
            startH=rezS*5
            panel.userData.startH=startH
            offsetGroup.position.y +=  2.5;
        }

 
        if(panel.userData.height>=startH+endH){
            height= panel.userData.height
        }else{
            height=startH+endH
        }




        if (polyline && polyline.geometry) {
            polyline.geometry.setFromPoints([
                new THREE.Vector3(-width / 2 + symmetricalOffset * dir, -height/2, 0),
                new THREE.Vector3(-width / 2 + symmetricalOffset * dir, height/2, 0),
                new THREE.Vector3(width / 2 + symmetricalOffset * dir, height/2, 0),
                new THREE.Vector3(width / 2 + symmetricalOffset * dir, -height/2, 0),
            ]);
            polyline.geometry.attributes.position.needsUpdate = true;
        }

        if (hatch && hatch.geometry) {
            const vertices = [
                new THREE.Vector3((-width / 2 + symmetricalOffset )* dir, height/2, 0),
                new THREE.Vector3((width / 2 + symmetricalOffset )* dir, -height/2, 0),
                new THREE.Vector3((-width / 2 + symmetricalOffset) * dir, -height/2, 0),
            ];
            hatch.geometry.setFromPoints(vertices);
            hatch.geometry.attributes.position.needsUpdate = true;
        }
    } 
      
    function updatePanel(panel){
        console.log("UPDATE Panel : ",panel)
        if(!panel)return
        const outs=panel.outs
        let kuruluGuc=0,talepGuc=0,akim=0,fazSayi=3,faz;

        if(panel.details.faz.toLowerCase()==="rst"){
            fazSayi=3
        }else{
            fazSayi=1
        }

        outs.forEach((out)=>{
            kuruluGuc+=out.power
        })            

        if(panel.details.kullanimAmac==="Mesken"){
            if(panel.details.talepFak==="60-40%"){
                if(kuruluGuc>8000){
                    talepGuc=4800+(kuruluGuc-8000)*0.4
                }else{
                    talepGuc=kuruluGuc*0.6
                }
            }else if(panel.details.talepFak==="100%"){
                talepGuc=kuruluGuc
            }
        }else if(panel.details.kullanimAmac==="GT"){
            if(panel.details.talepFak==="60-40%"){
                if(kuruluGuc>8000){
                    talepGuc=4800+(kuruluGuc-8000)*0.4
                }else{
                    talepGuc=kuruluGuc*0.6
                }
            }else if(panel.details.talepFak==="100%"){
                talepGuc=kuruluGuc
            }
        }else if(panel.details.kullanimAmac==="İşYeri"){
            if(panel.details.talepFak==="100-50%"){
                if(kuruluGuc>8000){
                    talepGuc=4800+(kuruluGuc-8000)*0.4
                }else{
                    talepGuc=kuruluGuc*0.6
                }
            }else if(panel.details.talepFak==="100%"){
                talepGuc=kuruluGuc
            }
        }else if(panel.details.kullanimAmac==="Asansör"){     
            if(panel.details.talepFak==="55%"){
                talepGuc=kuruluGuc*0.55
            }     
             
        }
        console.log("UPDATE Panel TALEP GÜÇ : ",talepGuc, )

        if(fazSayi===3){
            akim=talepGuc/526
        }else{
            akim=kuruluGuc/220
        }
        panel.details.kuruluGuc=kuruluGuc
        panel.details.talepGuc=talepGuc
        panel.details.akim=akim 
        //-------------------------
        const iletken=findCableByCurrent(akim,5,"hava",6,10)
        const kesici=findAOSForCable(iletken.HavaAK,akim,4,25,"B",10,0)//(current,I0,phaseCount,minI0,type,Ith,tolerans)
        const SayacKesici=findAOSForCable(iletken.HavaAK,akim,4,25,"C",10,0)//(current,I0,phaseCount,minI0,type,Ith,tolerans)
        const kAKR=findKAKRByCurrent(kesici.Akim,fazSayi+1,30,"A")
        panel.salt.kolon=iletken 
        panel.salt.kesici=kesici 
        panel.salt.SayacKesici=SayacKesici 
        panel.salt.kAKR=kAKR 

        console.log("ILETKEN  kesici: ",kesici)
        return panel

    }

    function setCount(panelId, newCount, options, autoStart = true) {
        const panel = findPanelById(panelId);
        if (!panel) return;
        const lastOutID = generateUniqueId("outSnap");
        const location = options.addPosition;
        const command = options.command;

        const dir=panel.userData.dir
        const symmetricalOffset = panel.userData.symmetricalOffset;
        const basePoint = panel.userData.basePoint;
        let titleNo=1
        let outSnapGroup = panel.children.find(child => child.name === 'outSnapGroup');

        if (!outSnapGroup) {
            outSnapGroup = new THREE.Group();
            outSnapGroup.name = 'outSnapGroup';
            outSnapGroup.userData.StartSnapsCount = 0;
            outSnapGroup.userData.EndSnapsCount = 0;
            panel.add(outSnapGroup);
        }

        let OutSnapGroupStartSnapsCount = outSnapGroup.userData.StartSnapsCount;
        let OutSnapGroupEndSnapsCount = outSnapGroup.userData.EndSnapsCount;

        const currentOuts = [...(panel.userData.outSnaps || [])];
        let lastOut = null;

        if (location === 'start') {
            outSnapGroup.children.forEach(snap => {
                snap.position.y += 5;
                snap.position.y *= dir;
            });

            const newOut = drawCircleFromCode(scene, {
                center: { x: 0, y: 0, z: 0 },
                radius: 2,
                color: 0xff0000,
            });
            newOut.userData = {
                type: 'panelCon_out',
                panelID: panelId,
                no: 1,
                outNo: 1,
                isSelectable: true,
                id: lastOutID,
                orderNo:OutSnapGroupStartSnapsCount + 1

            };
            newOut.visible = false;
            outSnapGroup.userData.StartSnapsCount = OutSnapGroupStartSnapsCount + 1;
            outSnapGroup.add(newOut);
            panel.userData.outSnaps = [newOut, ...currentOuts];
            lastOut = newOut;
        } else if (location === 'end') {
            titleNo=newCount
            const newOut = drawCircleFromCode(scene, {
                center: { x: 0, y: 5, z: 0 },
                radius: 2,
                color: 0xff0000,
            });
            newOut.userData = {
                type: 'panelCon_out',
                panelID: panelId,
                no: newCount,
                outNo: newCount,
                isSelectable: true,
                id: lastOutID,
                orderNo:-(OutSnapGroupEndSnapsCount + 1)
            };
            newOut.visible = false;
            outSnapGroup.userData.EndSnapsCount = OutSnapGroupEndSnapsCount + 1;
            outSnapGroup.add(newOut);
            panel.userData.outSnaps = [...currentOuts, newOut];
            lastOut = newOut;
        }

        const width = 15;
        const height = 25;
        updateGeometry(panel, newCount, width, symmetricalOffset, location);

        if (autoStart && lastOut) {
            const initialPoint = {
                x: basePoint.x + (symmetricalOffset * dir),
                y: basePoint.y + (location === 'start'
                    ? (outSnapGroup.userData.StartSnapsCount - 1) * 5
                    : -(outSnapGroup.userData.EndSnapsCount) * 5),
            };

            dispatch(resetOperation());
            dispatch(setCommandType(command));
            dispatch(setOperationData({
                initialPoint,
                source: {
                    type: 'panelConnection',
                    panelID: panelId,
                    no: titleNo,
                    outNo: titleNo,
                    UUID: lastOut.uuid,
                    OutID: lastOutID,
                },
            }));
        }
        if(location==="start")
        renumberOutSnaps(panel);
    }



    function renumberOutSnaps(panel) {
        const outSnapGroup = panel.children.find(child => child.name === 'outSnapGroup');
        if (!outSnapGroup) return;

        const sortedOuts =panel.userData.outSnaps// outSnapGroup.children.toSorted((a, b) => a.orderNo - b.orderNo);
        sortedOuts.forEach((snap, index) => {
            snap.userData.no = sortedOuts.length-index;
            snap.userData.outNo = index + 1;
            scene.traverse((label) => {
                if (label.name === "titleLabel" && label.userData.outSnapID === snap.userData.id) {
                    // Label’ın world pozisyonunu al
                     const localPos = label.position.clone(); // 🔁 Yerel pozisyon
                    // Yeni label oluştur
                    const newLabel = createTextSprite(`${snap.userData.outNo}`, {
                        fontSize: 120,
                        color: '#00ffff',
                        backgroundColor: 'transparent',
                        strokeColor: '#00ffff',
                        padding: 8,
                    });
                    newLabel.name = 'titleLabel';
                    newLabel.userData.outSnapID = snap.userData.id;
                    newLabel.position.copy(localPos); // 🔁 Yerel pozisyon olarak ata

                    // Eski label'ı sahneden kaldır (doğru parent’tan)
                    const parent = label.parent;
                    // ⛔ Parent'tan eski label'ı çıkar
                    if (parent) {
                        parent.remove(label);
                        // 🎯 Yeni label'ı aynı gruba (parent) ekle
                        parent.add(newLabel);
                    }

                    // ♻️ Kaynakları temizle
                    label.material?.map?.dispose?.();
                    label.material?.dispose?.();
                    label.geometry?.dispose?.();

                }
            });


        });
        panel.userData.outSnaps = sortedOuts;
    }
    

    return { setCount,updatePanel };
}