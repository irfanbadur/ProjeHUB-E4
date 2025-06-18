import React, { useState ,useEffect} from "react";
import { useDispatch,useSelector   } from "react-redux";
import "./ToolInstallation.css";
import { getIcon } from "../../../utils/icons";
import { setCommandType,resetOperation,setCommandMessage  } from "../../../redux/operationSlice"

 

const ToolInstallation = () => {
  const [activeButton, setActiveButton] = useState(null);
  const buttonSize = 30;
  const dispatch = useDispatch();
  const commandType = useSelector((state) => state.operation.commandType);

  // Redux'tan gelen commandType'ı dinleyerek activeButton'ı otomatik ayarla
  useEffect(() => {
    if (commandType === "drawLine") {
      setActiveButton("line");
    } else if (commandType === "drawElectricalWire") {
      setActiveButton("polyline");
    } else if (commandType === "drawSpline") {
      setActiveButton("spline");
    } else if (commandType === "drawCircle") {
      setActiveButton("circle");
    } else if (commandType === "drawLight") {
      setActiveButton("Light");
    } else if (commandType === "drawFixture") {
      setActiveButton("LightFixture");
    } else if (commandType === "drawRect") {
      setActiveButton("rect");
    } else if (commandType === "drawWire") {
      setActiveButton("wire");  
    } else if (commandType === "findwire") {
      setActiveButton("wire");
    } else if (commandType === "createNewBranch") {
      setActiveButton("branch");
    } else {
      setActiveButton(null);
    }
  }, [commandType]);

  const handleClick = (tool) => {
    const alreadyActive = tool === activeButton;
   
    if (alreadyActive) {
      dispatch(resetOperation());
      setActiveButton(null);
    } else {
      setActiveButton(tool);
      if (tool === "pano") {
        dispatch(setCommandType("drawPanel"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "polyline") {
        dispatch(setCommandType("drawElectricalWire"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "washingMach") {
        dispatch(setCommandType("drawWashingMach"));
        dispatch(setCommandMessage("Çamaşır makinası konumunu seçin")); 
      }
      if (tool === "Socket") {
        dispatch(setCommandType("drawSocket"));
        dispatch(setCommandMessage("priz için İlk noktayı seçin")); 
      }
      if (tool === "Light") {
        dispatch(setCommandType("drawLight"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "LightFixture") {
        dispatch(setCommandType("drawFixture"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "rect") {
        dispatch(setCommandType("drawRect"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "wire") {
        dispatch(setCommandType("drawWire"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "wiring") {
        dispatch(setCommandType("createWire"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "branch") {
        dispatch(setCommandType("createNewBranch"));
        dispatch(setCommandMessage("Yeni linye oluşturuluyor")); 
      }
      // Diğer tool'lar için eklemeler yapılabilir
    }
  };

  return (
    <div className="toolDraw">
      <div className="toolRow">
   
        <button
          className={`toolButton ${activeButton === "pano" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("pano")}
        >
        Pano
        </button>
        <button
          className={`toolButton ${activeButton === "washingMach" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("washingMach")}
        >
        ÇM
        </button>
        <button
          className={`toolButton ${activeButton === "Socket" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("Socket")}
        >
        Priz
        </button>
        <button
          className={`toolButton ${activeButton === "Light" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("Light")}
        >
        Ayd.
        </button>
        <button
          className={`toolButton ${activeButton === "LightFixture" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("LightFixture")}
        >
        Arm.
        </button>
        <button
          className={`toolButton ${activeButton === "wire" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("wire")}
        >
        WIRE
        </button>
        <button
          className={`toolButton ${activeButton === "wiring" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px`,color:"#ffffff" }}
          onClick={() => handleClick("wiring")}
        >
        F.wire
        </button>
        <button
          className={`toolButton ${activeButton === "branch" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` ,color:"#ffffff"}}
          onClick={() => handleClick("branch")}
        >
        Branch
        </button>
 
  
      </div>
      <div className="modifyText">
        <span>Electrical</span>
      </div>
    </div>
  );
};

export default ToolInstallation;
