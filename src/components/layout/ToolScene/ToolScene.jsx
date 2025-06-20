import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCommandType, resetOperation } from "../../../redux/operationSlice";
import { drawRectFromCode } from "../../../commands/drawRectFromCode";
import useSnapPoints from "../../../hooks/useSnapPoints"; // Sadece ToolScene gibi component içinde kullanılabilir
import { createSolidHatchFromBoundary } from '../../../commands/createSolidHatchFromBoundary';
const ToolScene = ({ scene }) => {
  const [activeCommand, setActiveCommand] = useState(null);
  const dispatch = useDispatch();
  const commandType = useSelector((state) => state.operation.commandType);
  const supply = useSelector((state) => state.supply);
  const { snapPoints, refreshSnapPoints } = useSnapPoints(scene);
     const entities = useSelector((state) => state. dxf );
 
  const handleClick = (command) => {
    if (command === activeCommand) {
      dispatch(resetOperation());
      setActiveCommand(null);
    } else {
      dispatch(setCommandType(command));
      setActiveCommand(command);
    }
  };

const handleNodes = () => {
      console.log("NODES : ", supply.nodes);
};
const handleCon = () => {
      console.log("CONNECTIONS : ", supply.connections);
     

};
  const handleSupply = () => {
     console.log("SUPPLY   : ", supply);
 
    
  };
  return (
    <div className="ToolSceneTest">
      <div className="toolRowTest">
        <button
          className={`toolButtonTest ${activeCommand === "showGizmos" ? "active" : ""}`}
          onClick={() => handleClick("showGizmos")}
        >
          Gizmo
        </button>
        <button
          className={`toolButtonTest ${activeCommand === "showSnaps" ? "active" : ""}`}
          onClick={() => handleClick("showSnaps")}
        >
          Snap
        </button>
        <button
          className={`toolButtonTest ${activeCommand === "showObject" ? "active" : ""}`}
          onClick={() => handleClick("showObject")}
        >
          Object
        </button>
        <button
          className={`toolButtonTest ${activeCommand === "showLines" ? "active" : ""}`}
          onClick={() => handleClick("showLines")}
        >
          Lines
        </button>
      </div>
      <div className="toolRowTest">
        <button
          className={`toolButtonTest ${activeCommand === "dxf" ? "active" : ""}`}
          onClick={() => console.log("ENTİTİES TEST : ",entities)}
        >
          DXF
        </button>
        <button
          className={`toolButtonTest ${activeCommand === "showPolylines" ? "active" : ""}`}
          onClick={() => handleSupply}
        >
          SUPPLY
        </button>
        <button className="toolButtonTest" onClick={handleNodes}> 
       
          nodes
        </button>
        <button className="toolButtonTest" onClick={handleCon}>
    CON
  </button>
  <button className="toolButtonTest" onClick={handleSupply}>
          SUPPLY
        </button>
      </div>
      <div className="modifyTextTest">
        <span>Scene TEST</span>
      </div>
    </div>
  );
};

export default ToolScene;
