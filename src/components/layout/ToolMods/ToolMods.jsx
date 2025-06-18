import React, { useState, useEffect } from "react";
import "./ToolMods.css";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleSnapMode,
  toggleObjectSnap,
  toggleOrthoMode // <-- Ortho Mode'u ekledik
} from "../../../redux/modsSlice";

const ToolMods = () => {
  const [activeButton, setActiveButton] = useState(null);
  const buttonSize = 30;


  const snapMode = useSelector((state) => state.mods.snapMode);
  const objectSnap = useSelector((state) => state.mods.objectSnap);
  const orthoMode = useSelector((state) => state.mods.orthoMode); // <-- Ortho Mode state'i

  const dispatch = useDispatch();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F8') {
        dispatch(toggleOrthoMode());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return (
    <div className="toolMods">
      <div className="toolRow">
        <button
          onClick={() => dispatch(toggleOrthoMode())} // <-- Grid yerine Ortho
        >
          Ortho Mode: {orthoMode ? "ON" : "OFF"}
        </button>

        <button
          className={`toolButton ${snapMode ? "active" : ""}`}
          onClick={() => dispatch(toggleSnapMode())}
        >
          Snap Mode: {snapMode ? "ON" : "OFF"}
        </button>
      </div>

      <div className="modifyText">
        <span>Mods</span>
      </div>
    </div>
  );
};

export default ToolMods;
