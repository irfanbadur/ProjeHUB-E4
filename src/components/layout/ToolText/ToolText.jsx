// src/components/ToolText.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./ToolText.css";
import { getIcon } from "../../../utils/icons";
import {
  setCommandType,
  resetOperation,
  setCommandMessage,
  setTextOptions,
} from "../../../redux/operationSlice";

const ToolText = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState("12");
  const [alignment, setAlignment] = useState("left");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [color, setColor] = useState("#ffffff");

  const buttonSize = 30;
  const dispatch = useDispatch();
  const commandType = useSelector((state) => state.operation.commandType);

  useEffect(() => {
    if (commandType === "drawSingleLineText") {
      setActiveButton("singleLine");
    } else if (commandType === "drawMtext") {
      setActiveButton("mtext");
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
      if (tool === "singleLine") {
        dispatch(setCommandType("drawSingleLineText"));
        dispatch(setCommandMessage("Metni girin"));
      }
      if (tool === "mtext") {
        dispatch(setCommandType("drawMtext"));
        dispatch(setCommandMessage("Metni girin"));
      }
    }
  };

  const updateTextOptions = () => {
    dispatch(setTextOptions({ font, fontSize, alignment, bold, italic, underline, color }));
  };

  useEffect(() => {
    updateTextOptions();
  }, [font, fontSize, alignment, bold, italic, underline, color]);

  return (
    <div className="toolDrawText">
      <div className="toolRow">
        <button
          className={`toolButton ${activeButton === "singleLine" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("singleLine")}
        >
          {getIcon("text", buttonSize)}
          <span className="toolLabel">Single Line</span>
        </button>
        <button
          className={`toolButton ${activeButton === "mtext" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}
          onClick={() => handleClick("mtext")}
        >
          {getIcon("mtext", buttonSize)}
          <span className="toolLabel">Mtext</span>
        </button>

        <button className={`styleToggle ${bold ? 'active' : ''}`} onClick={() => setBold(!bold)}>B</button>
        <button className={`styleToggle ${italic ? 'active' : ''}`} onClick={() => setItalic(!italic)}>I</button>
        <button className={`styleToggle ${underline ? 'active' : ''}`} onClick={() => setUnderline(!underline)}>U</button>
        <div className="toolButton">
          <label className="toolLabel">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '100%', height: '30px', padding: 0, border: 'none' }}
          />
        </div>
      </div>

      <div className="toolRow">
        <div className="toolButtonFontType">
          <label className="toolLabel">Font</label>
          <select value={font} onChange={(e) => setFont(e.target.value)} className="toolSelect">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        <div className="toolButton">
          <label className="toolLabel">Font Size</label>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="toolSelect">
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
          </select>
        </div>

        <div className="toolButton">
          <label className="toolLabel">Alignment</label>
          <select value={alignment} onChange={(e) => setAlignment(e.target.value)} className="toolSelect">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>


      </div>
    </div>
  );
};

export default ToolText;
