import React, { useState ,useEffect} from "react";
import { useDispatch,useSelector   } from "react-redux";
import "./ToolDraw.css";
import { getIcon } from "../../../utils/icons";
import { setCommandType,resetOperation,setCommandMessage  } from "../../../redux/operationSlice"

 

const ToolDraw = () => {
  const [activeButton, setActiveButton] = useState(null);
  const buttonSize = 30;
  const dispatch = useDispatch();
  const commandType = useSelector((state) => state.operation.commandType);

  // Redux'tan gelen commandType'ı dinleyerek activeButton'ı otomatik ayarla
  useEffect(() => {
    if (commandType === "drawLine") {
      setActiveButton("line");
    } else if (commandType === "drawPolyline") {
      setActiveButton("polyline");
    } else if (commandType === "drawSpline") {
      setActiveButton("spline");
    } else if (commandType === "drawCircle") {
      setActiveButton("circle");
    } else if (commandType === "drawArc") {
      setActiveButton("arc");
    } else if (commandType === "drawEllipse") {
      setActiveButton("ellipse");
    } else if (commandType === "drawRect") {
      setActiveButton("rect");
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
      if (tool === "line") {
        dispatch(setCommandType("drawLine"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "polyline") {
        dispatch(setCommandType("drawPolyline"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "spline") {
        dispatch(setCommandType("drawSpline"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "circle") {
        dispatch(setCommandType("drawCircle"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "arc") {
        dispatch(setCommandType("drawArc"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "ellipse") {
        dispatch(setCommandType("drawEllipse"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      if (tool === "rect") {
        dispatch(setCommandType("drawRect"));
        dispatch(setCommandMessage("İlk noktayı seçin")); 
      }
      // Diğer tool'lar için eklemeler yapılabilir
    }
  };

  return (
    <div className="toolDraw">
      <div className="toolRow">
        <button
          className={`toolButton ${activeButton === "line" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("line")}
        >
          {getIcon("line", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "polyline" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("polyline")}
        >
          {getIcon("polyline", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "spline" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("spline")}
        >
          {getIcon("spline", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "circle" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("circle")}
        >
          {getIcon("circle", buttonSize)}
        </button>
        </div>
        <div className="toolRow">
        <button
          className={`toolButton ${activeButton === "arc" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("arc")}
        >
          {getIcon("arc", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "ellipse" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("ellipse")}
        >
          {getIcon("ellipse", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "rect" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("rect")}
        >
          {getIcon("rect", buttonSize)}
        </button>
      </div>
    </div>
  );
};

export default ToolDraw;
