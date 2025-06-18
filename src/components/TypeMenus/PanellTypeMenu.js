import React, { useState, useRef, useEffect } from 'react';
import { usePanelModify } from '../../hooks/usePanelModify';
import { useDispatch } from 'react-redux';
import './PanelTypeMenus.css' 
export default function PanelTypeMenu({
  x,
  y,
  value,
  onClose,
  onAddPositionChange,
  onActionSelect,
  panelDetails,
  onDrag,
  scene,
}) {
  const [addPosition, setAddPosition] = useState('start');
  const [showDetails, setShowDetails] = useState(false);
  const [kullanimAmac, setKullanimAmac] = useState("Mesken");
  const [panelName,setPanelName]=useState("Panel")
  const [panel ,setPanel ]=useState(null)
  const [details,setDetails]=useState({
    kullanimAmac:"Mesken",
    aboneTipi:"Mesken",
    kuruluGuc:0,
    talepFak:"60-40%",
    talepGuc:0,
    faz:"rst",
    akim:0,
  })
  const [salt,setSalt]=useState()
  const [showSalt,setShowSalt]=useState(false)
  const menuRef = useRef(null);
  const dragData = useRef({ active: false, lastX: 0, lastY: 0 });   
  const panelId = panelDetails.id || panelDetails.ID;

  useEffect(() => {
    if (!scene || !panelId) return;
  
    let foundPanel = null;
    scene.traverse(obj => {
      if (obj.userData.id === panelId) {
        foundPanel = obj.userData;
      }
    });
    if (!foundPanel) return;

    if (foundPanel && foundPanel.name) {
      setPanelName(foundPanel.name);
      setPanel(foundPanel)
    }
   const updatedPanel= updatePanel(foundPanel)
   setDetails(updatedPanel.details)
   setSalt(updatedPanel.salt)

  }, [scene, panelId]);

  useEffect(()=>{
    if(!panel)return
  
    const updatedPanel= updatePanel(panel)
    setDetails(updatedPanel.details)
  },[panel]) 

  const { setCount ,updatePanel} = usePanelModify(scene);

  const handlePositionChange = (e) => {
    const val = e.target.value;
    setAddPosition(val);
    onAddPositionChange(val);
  };

  const handleAction = (actionType) => () => {
    const panel = scene.children.find(obj => obj.userData?.id === panelId);
    if (!panel) return;

    const currentOutCount = panel.userData.outs?.length || 0;
    const newCount = currentOutCount + 1;
 
    setCount(panelId, newCount,{addPosition:addPosition,command:actionType});
    
    setTimeout(() => {
      const updatedPanel = scene.children.find(obj => obj.userData?.id === panelId);
      const latestOut = updatedPanel?.userData.outs?.at(-1);
  
    }, 50);
   
    onClose();
  };

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
  const handleKullanimAmac = (val) => {
    console.log("KULLANIM AMAC",val.target.value)
    const kullanimAmac=val.target.value
    let talepFak="100%"
switch(kullanimAmac){
    case "Mesken"   :  talepFak="60-40%";   break  ;
    case "İşYeri"   :  talepFak="100-50%";   break  ;
    case "GT"       :  talepFak="100%";   break ;
    case "Asansör"  :  talepFak="55%";   break ;        
}
 //    setKullanimAmac(val)
    
      setPanel(prev => ({
        ...prev,
        details: {
          ...prev.details,
          kullanimAmac:kullanimAmac,
          talepFak: talepFak
        },
      }))
    console.log("KULLANIM AMAC setPanel",panel)

  };
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={menuRef} className="panel-type-menu" style={{ left: x, top: y }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="panel-type-menu-header"
      > 
        {panelName }/{details.kullanimAmac}/{details.kuruluGuc} W
        <button
          className="close-button"
          onClick={e => { e.stopPropagation(); onClose(); }}
        >
          ×
        </button>
      </div>

      <div  className="panel-type-options">
        <div className="panel-type-radio-group">
          <label style={{ fontSize: '14px' }}>
            <input
              type="radio"
              name="addPosition"
              value="start"
              checked={addPosition === 'start'}
              onChange={handlePositionChange}
              style={{ marginRight: '4px' }}
            />
            Başa Ekle
          </label>
          <label style={{ fontSize: '14px' }}>
            <input
              type="radio"
              name="addPosition"
              value="end"
              checked={addPosition === 'end'}
              onChange={handlePositionChange}
              style={{ marginRight: '4px' }}
            />
            Sona Ekle
          </label>
        </div>

        <div  className="panel-type-buttons">
          <button onClick={handleAction('drawSocket')} className="my-button">Priz Ekle</button>
          <button onClick={handleAction('drawLight')} className="my-button">Aydınlatma Ekle</button>
          <button onClick={handleAction('drawWashingMach')} className="my-button">Makina Ekle</button>
          <button onClick={handleAction('zayıfAkım')} className="my-button">Zayıf Akım Ekle</button>
        </div>

        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="my-button"
            style={{              
              width: '100%',
              textAlign: 'left',
            }}
          >
            Detay {showDetails ? '▴' : '▾'}
          </button>
          
          {showDetails && (
            <div  className="panel-type-details-box">
              <table className="panel-type-details-table">
                <tbody> 
        <tr  >
          <td className="label-cell">Pano Adı</td>
          <td>
          <input
      type="text"
      value={panelName}
      onChange={(e) => setPanelName(e.target.value)}
      style={{ width: "100%" }}
      className='textArea'
    />

          </td>
        </tr>
  
        <tr  >
          <td className="label-cell"> Kullanım Amacı   </td>
          <td>
            <select style={{ width: "100%", maxWidth: "160px" }} 
            onChange={e=>handleKullanimAmac(e)}
            >
                <option value="Mesken">Mesken  </option>
                <option value="İşYeri">İş Yeri  </option>
                <option value="GT">GT  </option>
                <option value="Asansör">Asansör  </option>
            </select>
          </td>
        </tr>
  
        <tr  >
          <td className="label-cell">Abone Türü</td>
          <td>            
            <select style={{ width: "100%", maxWidth: "160px" }}>
                <option>Mesken  </option>
                <option>Ticari  </option> 
            </select>
            </td>
        </tr>
  
        <tr  >
          <td className="label-cell">Kurulu G.</td>
          <td>{details.kuruluGuc}W</td>
        </tr>
  
        <tr  >
          <td className="label-cell">Talep Faktör</td>
          <td>{details.talepFak}</td>
        </tr>
  
        <tr  >
          <td className="label-cell">Talep Güç</td>
          <td>{details.talepGuc}W</td>
        </tr>
  
        <tr  >
          <td className="label-cell">Faz</td>
          <td>
          <select style={{ width: "100%", maxWidth: "160px" }}
          defaultChecked={details.faz}
          >
                <option value="RST"> RST  </option>
                <option value="R" >R</option> 
                <option value="S" >S</option> 
                <option value="T" >T</option> 
            </select> 
            </td>
        </tr>
  
        <tr  >
          <td className="label-cell">Akım</td>
          <td>{details.akim.toFixed(2)}A</td>
        </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => setShowSalt(!showSalt)}
            className="my-button"
            style={{
              
              width: '100%',
              textAlign: 'left',
            }}
          >
            Şalt {showSalt ? '▴' : '▾'}
          </button>
          
          {showSalt && (
            <div  className="panel-type-details-box">
              <table className="panel-type-details-table">
                <tbody>
                 
                
        <tr  >
          <td className="label-cell">Kolon</td>
          <td>{salt.kolon.Etiket}</td>
        </tr>
        <tr  >
          <td className="label-cell" colSpan={2}>Kolon Hava AK:{salt.kolon.HavaAK}A Toprak AK:{salt.kolon.ToprakAK}A</td> 
          <td className="label-cell"> </td> 
        </tr>
  
        <tr  >
          <td className="label-cell"> Kesici </td>
          <td>{salt.kesici.Etiket}</td>
        </tr>
  
        <tr  >
          <td className="label-cell">Kaçak Akım K.</td>
          <td>{salt.kAKR.Etiket}</td>
        </tr>
  
        <tr  >
          <td className="label-cell">Sayaç Kesici</td>
          <td>{salt.SayacKesici.Etiket}</td>
        </tr> 
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

 