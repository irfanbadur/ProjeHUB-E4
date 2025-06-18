import React, { useState ,useEffect} from "react";
import { useDispatch,useSelector   } from "react-redux";
import "./ToolElectricalComp.css";
import { getIcon } from "../../../utils/icons";

import { setCommandType,resetOperation,setCommandMessage  } from "../../../redux/operationSlice"

 

const ToolEquipment  = () => {
  const [selection, setSelection] = useState(null);
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
      CİHAZ
   
      </div>
    </div>
  );
};

export default ToolEquipment;
