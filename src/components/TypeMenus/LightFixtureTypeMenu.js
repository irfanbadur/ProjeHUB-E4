import React, { useState, useRef, useEffect } from 'react'; 
import { useDispatch } from 'react-redux';
import { updateTextMesh } from '../../utils/updateTextMesh';
import * as THREE from 'three';
import { createLightFixture } from '../../symbolDrawings/createLightFixtureSymbols';

import './FixtureTypeMenus.css'
export default function FixtureTypeMenu({
  x,
  y,
  value,
  onClose,
  onAddPositionChange,
  onActionSelect,
  fixtureDetails,
  onDrag,
  scene,
}) {
 



console.log("fixtureDetails  : ",fixtureDetails)
let fixture
let symbol
let textGroup
let textType
let textPower
let textDesc
let fixtureUserData
scene.traverse(obj => {
  if (obj.userData.id === fixtureDetails.ID) {
    fixture = obj;
    fixtureUserData=obj.userData
    // textGroup’u name ile bulalım
    textGroup = fixture.getObjectByName('textGroup');

    if (textGroup) {
      // sprite’ları da name’leri üzerinden yakalayalım
      textType   = textGroup.getObjectByName('textType');
      textPower  = textGroup.getObjectByName('textPower');
      textDesc   = textGroup.getObjectByName('textDesc');
    }
  }
}); 
console.log("fixtureUserData  : ",fixture)

const [details, setDetails] = useState({
  fixtureType:fixtureUserData? fixtureUserData.fixtureType:"N",
  lampCount: fixtureUserData?fixtureUserData.lampCount:1,
  lampPower:fixtureUserData? fixtureUserData.lampPower:0,
  power:fixtureUserData? fixtureUserData.power:0, 
  symbol:fixtureUserData? fixtureUserData.symbol:"normal", 
})
const menuRef = useRef(null);
const dragData = useRef({ active: false, lastX: 0, lastY: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    dragData.current = {
      active: true,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragData.current.active) return;
    const dx = e.clientX - dragData.current.lastX;
    const dy = e.clientY - dragData.current.lastY;
    dragData.current.lastX = e.clientX;
    dragData.current.lastY = e.clientY;
    onDrag(dx, dy);
  };

  const handleMouseUp = () => {
    dragData.current.active = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
 
  const handleSelectSymbol = (e) => {
    const newSymbolType = e.target.value;
  
    // 1) Mevcut fixture objesini bulun
    if (!fixture) return;
    const oldFixture = fixture;
  
    // 2) Eski userData'yı kaydedin
    const {
      id,
      basePoint,
      tempLineUUID,
      power,
      // ...ihtiyacınız olan diğer userData alanları
    } = oldFixture.userData;
  
    // 3) Sahneden kaldır ve bellekten temizle
    scene.remove(oldFixture);
    oldFixture.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material)  child.material.dispose();
    });
  
    // 4) Yeni bir LightFixture oluştur
    //    rotateValue olarak eski rotate değerini, type olarak yeni sembol tipini veriyoruz.
    const newFixture = createLightFixture(
      scene,
      new THREE.Vector3(basePoint.x, basePoint.y, 0),
      null,               // dir, eğer kullandığınız yerde gerekliyse hesaplayın
      0x00ffff,           // renk
      false,              // isPreview
      newSymbolType,      // işte burada yeni tip
      tempLineUUID,
      oldFixture.userData.rotate,  // eski rotasyonu tekrar uygulayın
      id
    );
  
    // 5) ID'yi ve diğer metadata'yı geri atayın
    newFixture.userData.id          = id;
    newFixture.userData.basePoint   = basePoint;
    newFixture.userData.tempLineUUID= tempLineUUID;
    newFixture.userData.power       = power;
    newFixture.userData.symbol      = newSymbolType 

    fixture.userData.symbol= newSymbolType 

    // … diğer gerekli alanlar …
    setDetails(prev =>
      ({
        ...prev,      
        symbol:newSymbolType
      })
      ) 
    // 6) Sahneye zaten ekliyoruz, gerekirse textGroup referanslarınızı da yenileyin
    fixture = newFixture;
  };
  
  const handleSelectCount = (val) => {
    const lampCount=val.target.value
    const power=lampCount===1?power:lampCount*details.lampPower

    setDetails(prev =>
    ({
      ...prev,
      lampCount: lampCount,
      power:power
    })
    )
    fixture.userData.lampCount= lampCount     
    updateTextMesh(textGroup, 'textPower',lampCount>1?lampCount+"x"+ details.lampPower+"W":power+"W" );

  };
  const handleSelectLampPower = (val) => {
    const lampPower=val.target.value
    console.log("Seçilen lamp Power :", lampPower)
    const power=lampPower*details.lampCount
    setDetails(prev =>
    ({
      ...prev,
      lampPower: lampPower,
      power:power
    })
    )    
    const powerText=details.lampCount===1?power+"W":details.lampCount+"x"+lampPower+"W"
    fixture.userData.lampPower= lampPower     
    fixture.userData.power= power     
    updateTextMesh(textGroup, 'textPower', powerText);

  };
  const handleSelectType = (e) => {
    const newType = e.target.value;
    setDetails(prev => ({ ...prev, fixtureType: newType })); 
    fixture.userData.fixtureType= newType 
    updateTextMesh(textGroup, 'textType', newType);
  };
  

  useEffect(() => {

    console.log("Seçilen detaylar ", details)

  }, [details]);
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={menuRef} className="fixture-type-menu" style={{ left: x, top: y }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="fixture-type-menu-header"
      >
        Armatür Detay
        <button
          className="close-button"
          onClick={e => { e.stopPropagation(); onClose(); }}
        >
          ×
        </button>
      </div>
      <div className="fixture-type-options">
        <div className="fixture-type-options">
          <div className="fixture-type-details-box">
            <table className="fixture-type-details-table">
              <tbody>
                <tr  >
                  <td className="td"> Tip </td>
                  <td>
                    <select style={{ width: "100%", maxWidth: "160px" }}
                      onChange={e => handleSelectType(e)}
                      value={details.fixtureType}
                    >
                      <option value="A">A  </option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C">C  </option>
                      <option value="E">E  </option>
                      <option value="G">G  </option>
                      <option value="H">H  </option>
                      <option value="L">L  </option>
                      <option value="N">N  </option>
                      <option value="O">O  </option>

                    </select>
                  </td>
                </tr>
                {details.fixtureType==="N"?    
                <tr  className="label-cell">
                  <td className="label-cell"> Lamba Sayısı </td>
                  <td className="label-cell">
                    <select style={{ width: "100%", maxWidth: "160px" }}
                      onChange={e => handleSelectCount(e)}
                      value={details.lampCount}

                    >

                      {Array.from({ length: 30 }, (_, i) => {
                        const val = i + 1;
                        return (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}

                    </select>
                  </td>
                </tr>
:null }
                <tr className="label-cell">
                  <td className="label-cell"> Güç </td>
                  <td className="label-cell">
                    <select style={{ width: "100%", maxWidth: "160px" }}
                      onChange={e => handleSelectLampPower(e)}
                      value={details.power}
                    >
                      <option value={10}>10W  </option>
                      <option value={15}>15W  </option>
                      <option value={18}>18W  </option>
                      <option value={20}>20W  </option>
                      <option value={30}>30W  </option>
                      <option value={40}>40W  </option>
                      <option value={50}>50W  </option>
                      <option value={60}>60W  </option>
                      <option value={80}>80W  </option>
                      <option value={100}>100W  </option>
                      <option value={150}>150W  </option>
                      <option value={200}>200W  </option>
                      <option value={250}>250W  </option>
                    </select>
                  </td>
                </tr>

                <tr  className="label-cell">
                  <td className="label-cell">Armatür Türü</td>
                  <td>
                 
                    <select style={{ width: "100%", maxWidth: "160px" }}
                      onChange={e => handleSelectSymbol(e)}
                      value={details.symbol}
                    >
                      <option value="normal">Normal  </option> 
                      <option value="etanj">Etanj  </option> 
                      <option value="Kare Led Spot">Kare Led Spot  </option> 
                      <option value="Asma Tavan Kare Floresans">Asma Tavan Kare Floresans  </option> 
                      <option value="Yuvarlak Led Spot">Yuvarlak Led Spot  </option> 
                      <option value="tablo">Tablo  </option> 
                      <option value="aplik">Aplik  </option> 
                    </select>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
        <div>
          <label className='labelTextFixture'>Tip : {details.fixtureType} </label>
          <label className='labelTextFixture'>Güç :{details.lampCount>1?
            details.lampCount+"x" +details.lampPower+"="+details.power+"W"
            :details.power+"W"}
            </label>
          <label className='labelTextFixture'></label>
          <label className='labelTextFixture'></label>


        </div>
      </div>
    </div>
  );
}

