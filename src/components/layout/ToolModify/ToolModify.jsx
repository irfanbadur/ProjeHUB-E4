import React, { useState } from "react";
import "./ToolModify.css";
import { getIcon } from "../../../utils/icons";
import { useDispatch, useSelector } from 'react-redux';
import { setCommandType } from "../../../redux/operationSlice";
// Örnek ikonları temsil etmek için SVG kullanacağız

const ToolModify = () => {
  const [activeButton, setActiveButton] = useState(null);
  const buttonSize = 30;  // Button boyutu (width, height)
  // SVG çizim alanı boyutu
  const dispatch = useDispatch();

  const handleClick = (tool) => {
    setActiveButton(tool === activeButton ? null : tool);
  };

  return (
    <div className="toolModify">
      <div className="toolRow">
        <button
          className={`toolButton ${activeButton === "move" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => {
            handleClick("move");
            dispatch(setCommandType("move"));
          }}
        >
          {getIcon("move", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "erase" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => {
            handleClick("erase");
            dispatch(setCommandType("erase"));
          }}
        >
          {getIcon("erase", buttonSize)}
        </button>

        <button
          className={`toolButton ${activeButton === "copy" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => {
            handleClick("copy");
            dispatch(setCommandType("copy"));
          }}
        >
          {getIcon("copy", buttonSize)}
        </button>
        <button
          className={`toolButton ${activeButton === "rotate" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => {
            handleClick("rotate");
            dispatch(setCommandType("rotate"));
          }}
        >
          {getIcon("rotate", buttonSize)}
        </button>

      </div>
      <div className="modifyText">
        <span>Düzenleme</span>
      </div>
    </div>
  );
};

export default ToolModify;
