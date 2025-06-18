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

const handleMoveFromCode = () => {
/*   const offset = { x: 200, y: 100 };
const originalId = "obj_11_1744029469335"; // seçilen nesnenin id'si
modifyCopyByCode(scene, originalId, offset, refreshSnapPoints);
  */
 
 
/*   const id = 'obj_10_1744029469335'; // userData.id olarak atanmış değer
  const degree = 15; // derece cinsinden
const angle = (degree * Math.PI) / 180; 
  const center = { x: 100, y: 500 };
  modifyRotateByCode(scene, id, angle, center, refreshSnapPoints); */
/*   const targetId = "obj_10_1744029469335";
  const offset = { x: -100, y: 250 };
  modifyMoveByCode(scene, targetId, offset, refreshSnapPoints);
 */
/*   drawTextFromCode(scene, {
    text: "Merhaba lar lr",
    position: { x: 100, y: 100 },
    font: "Arial",
    fontSize: 14,
    alignment: "center",
    bold: true,
    italic: false,
    underline: true,
    color: "#00ff00"
  });
  drawMtextFromCode(scene, {
    text: "Çok\nSatırlı\nMetin",
    position: { x: -100, y: -100 },
    font: "Arial",
    fontSize: 12,
    alignment: "left",
    bold: false,
    italic: true,
    underline: false,
    color: "#ffffff"
  }); */
/*   const polygon = [
    { x: -100, y: -200 },      // Aşağı sol
    { x: 100, y: -200 },  // Üst orta
    { x: -100, y: 200 },    // Aşağı sağ
    { x: 100, y: 200 }, // Alt orta
  ];
  
  modifyHatchByCode(scene, polygon, 0xff5500); // kırmızı dolgu */
/*   const points = [
    { x: 0, y: 100 },   // Üst sol
    { x: 50, y: 0 },    // Orta nokta
    { x: 100, y: 100 }, // Üst sağ
    { x: 100, y: -100 },// Alt sağ
    { x: 50, y: 0 },    // Orta nokta tekrar
    { x: 0, y: -100 },  // Alt sol
  ];
  
  createSolidHatchFromPolyline(scene, points, 0xff0000); */
  
/*   const arc = drawArcFromCode(scene, {
    center: { x: -50, y: 0 },
    radius: 100,
    startAngle: 0,
    endAngle: Math.PI/2,
    segments: 32,
    color: 0xffffff,
  });

  // 2. POLYLINE ile kapatma çizgisi
  const line = drawPolylineFromCode(scene, {
    points: [
      { x: -50, y: 0 },
      { x: 50, y: 0 }
    ],
    color: 0xffffff,
  });

  // 3. HATCH (Solid dolgu)
  createSolidHatchFromBoundary(scene, [arc, line], 0xff0000); */

  createSolidHatchFromBoundary(scene, {
    segments: [
      { type: 'arc', center: { x: 0, y: 0 }, radius: 50, startAngle: 0, endAngle: Math.PI },
      { type: 'line', from: { x: 50, y: 0 }, to: { x: -50, y: 0 } },
    ],
    color: 0xff0000,
  });
  
};
  const handleDrawLine = () => {
     
    drawRectFromCode(scene, {
      start: { x: -50, y: -30 },
      end: { x: 50, y: 30 },
      color: 0xffa500,
    });
    drawRectFromCode(scene, {
      start: { x: -250, y: -30 },
      end: { x: 150, y: 130 },
      color: 0xffa500,
    });
    
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
          className={`toolButtonTest ${activeCommand === "showPolylines" ? "active" : ""}`}
          onClick={() => handleClick("showPolylines")}
        >
          Polylines
        </button>
        <button
          className={`toolButtonTest ${activeCommand === "showCircles" ? "active" : ""}`}
          onClick={() => handleClick("showCircles")}
        >
          Circles
        </button>
        <button
          className={`toolButtonTest ${activeCommand === "dxf" ? "active" : ""}`}
          onClick={() => console.log("ENTİTİES TEST : ",entities)}
        >
          DXF
        </button>
        <button className="toolButtonTest" onClick={handleMoveFromCode}>
    Move Koddan
  </button>
  <button className="toolButtonTest" onClick={handleDrawLine}>
          Çizgi Koddan
        </button>
      </div>
      <div className="modifyTextTest">
        <span>Scene TEST</span>
      </div>
    </div>
  );
};

export default ToolScene;
