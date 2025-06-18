import React, { useState } from "react";
import "./ToolDraw.css";
import { getIcon } from "../../../utils/icons";
// Örnek ikonları temsil etmek için SVG kullanacağız
 
const ToolDraw = () => {
  const [activeButton, setActiveButton] = useState(null);
  const buttonSize = 30;  // Button boyutu (width, height)
     // SVG çizim alanı boyutu
  
  const handleClick = (tool) => {
    setActiveButton(tool === activeButton ? null : tool);
  };

  return (
    <div className="toolDraw">
      <div className="toolRow">
        <button
          className={`toolButton ${activeButton === "move" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut

          onClick={() => handleClick("move")}
        >
           {getIcon("move", buttonSize)} {/* Boyutu 50x50 olacak */}
        </button>
        <button
          className={`toolButton ${activeButton === "rotate" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("rotate")}
        >
          {getIcon("rotate", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "trim" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("trim")}
        >
          {getIcon("trim", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "mirror" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("mirror")}
        >
          {getIcon("mirror", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "delete" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("delete")}
        >
          {getIcon("delete", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
      </div>
      <div className="toolRow">
      <button
          className={`toolButton ${activeButton === "delete" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("delete")}
        >
          {getIcon("delete", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "copy" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("copy")}
        >
          {getIcon("copy", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "fillet" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("fillet")}
        >
          {getIcon("fillet", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "ofset" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("ofset")}
        >
          {getIcon("ofset", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
        <button
          className={`toolButton ${activeButton === "scale" ? "active" : ""}`}
          style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }}  // Dinamik boyut
          onClick={() => handleClick("scale")}
        >
          {getIcon("scale", buttonSize)} {/* SVG boyutu dinamik olarak veriliyor */}
        </button>
      </div>
      <div className="drawText">
        <span>Draw</span>
      </div>
    </div>
  );
};

export default ToolDraw;
