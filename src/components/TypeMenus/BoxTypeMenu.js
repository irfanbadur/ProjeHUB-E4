import React, { useState, useRef, useEffect } from 'react';
import { usePanelModify } from '../../hooks/usePanelModify';
import { useDispatch } from 'react-redux';
import './PanelTypeMenus.css' 
import { setLastBasePoint } from '../../redux/utilsSlice';
export default function BoxTypeMenu({
  x,
  y,
  value,
  onClose,
  onAddPositionChange,
  onActionSelect,
  boxDetails,
  onDrag,
  scene,
}) {
  console.log("boxDetails : ",x,y,boxDetails)
  const basePoint= boxDetails.basePoint || { x: 0, y: 0, z: 0 };

  const dispatch = useDispatch();

  const [addPosition, setAddPosition] = useState('start');
  const [boxName,setBoxName]=useState("BOX")
  const [panel ,setPanel ]=useState(null)
  const [details,setDetails]=useState({
    kullanimAmac:"Box",
  }) 
  const menuRef = useRef(null);
  const dragData = useRef({ active: false, lastX: 0, lastY: 0 });   
  const panelId = boxDetails.id || boxDetails.ID;

 useEffect(() => {
  dispatch(setLastBasePoint(basePoint));
}, [dispatch, basePoint]);

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
        {boxName } /{details.kuruluGuc} W
        <button
          className="close-button"
          onClick={e => { e.stopPropagation(); onClose(); }}
        >
          ×
        </button>
      </div>

      <div  className="panel-type-options">
     

        <div  className="panel-type-buttons">
          <button onClick={handleAction('drawCabin')} className="my-button">Kofre Ekle</button>
          <button onClick={handleAction('drawMainPanel')} className="my-button">ADP Ekle</button>
         </div>

        
        <div>
           
 
        </div>
      </div>
    </div>
  );
}

 