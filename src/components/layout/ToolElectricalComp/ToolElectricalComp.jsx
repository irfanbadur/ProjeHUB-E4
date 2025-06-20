import React, { useState ,useEffect} from "react";
import { useDispatch,useSelector   } from "react-redux";
import "./ToolElectricalComp.css";

import ToolSecondaryPanel from "./ToolSecondaryPanel";



import ToolMainPanel from "./ToolMainPanel";
import ToolSupply from "./ToolSupply";
import ToolSocket from "./ToolSocket";
import ToolLighting from "./ToolLighting";
import ToolLowCurrent from "./ToolLowCurrent";
import ToolEquipment from "./ToolEquipment";

 

const ToolElectricalComp  = () => {
  const [selection, setSelection] = useState("box");
  const buttonSize = 30;
  const dispatch = useDispatch();
  const commandType = useSelector((state) => state.operation.commandType);

 

  const handleClick = ( val) => {
    console.log("val  :",val.target.value)
    setSelection(val.target.value)
  };

  return (
    <div className="toolElectricalCompDraw">
      <div className="toolElectricalCompRow">
        <table>
          <tbody> 
            <tr>
              <td>
                <select style={{width:"240px"}} onChange={handleClick}>
                  <option value={"box"}>ŞEBEKE</option>
                  <option value={"ADP"}>ADP</option>
                  <option value={"TaliPano"}>Tali Pano</option>
                  <option value={"socket"}>Priz</option>
                  <option value={"cihaz"}>Cihaz</option>
                  <option value={"lighting"}>Aydınlatma</option>
                  <option value={"lowCurrent"}>Zayıf Akım</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>
                 {selection == "box" ? <ToolSupply  /> : null}
                 {selection == "TaliPano" ? <ToolSecondaryPanel  /> : null}
                 {selection == "ADP" ? <ToolMainPanel  /> : null}
                 {selection == "socket" ? <ToolSocket  /> : null}
                 {selection == "cihaz" ? <ToolEquipment  /> : null}
                 {selection == "lighting" ? <ToolLighting  /> : null}
                 {selection == "lowCurrent" ? <ToolLowCurrent  /> : null}

              </td>
            </tr>
          </tbody>
        </table>

  
 
 

 
  
      </div>
      <div className="modifyText">
        <span>Electrical Components</span>
      </div>
    </div>
  );
};

export default ToolElectricalComp;
