import React, { useState,useEffect} from "react";
import "./TopBar.css";
import ToolDraw from "../ToolDraw/ToolDraw";
import ToolModify from "../ToolModify/ToolModify";
import ToolMods from "../ToolMods/ToolMods"
import ToolScene from "../ToolScene/ToolScene";
import ToolText from "../ToolText/ToolText";
import ToolInstallation from "../ToolInstallation/ToolInstallation";
import ToolElectricalComp from "../ToolElectricalComp/ToolElectricalComp";
import { useDxfLoader } from "../../../hooks/useDxfLoader";

const TopBar = ({ projectName = "İrfan BADUR", setProjectName, onFileSelect, scene 
  ,defaultDxfFile // bu defaultDxfFile  parametresi dosyanın otomatik açılması için daha sonra kaldırılacak.
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { loadDxfFile } = useDxfLoader();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleDxfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectName(file.name);
      loadDxfFile(file);
    }
  };

  useEffect(() => { // bu useEffect   dosyanın otomatik açılması için daha sonra kaldırılacak.
    if (defaultDxfFile) {
      fetch(defaultDxfFile)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "default.dxf", { type: "application/dxf" });
          setProjectName(file.name);
          loadDxfFile(file);
        })
        .catch(err => console.error("Default DXF yüklenemedi:", err));
    }
  }, [defaultDxfFile]);

  return (
    <div className="topBar">
      {/* First row with menu and project details */}
      <div className="topBarContent">
        <div className="menuItems">
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Insert</a></li>
            <li><a href="#">Annotate</a></li>
            <li><a href="#">Parametric</a></li>
            <li><a href="#">View</a></li>
            <li><a href="#">Manage</a></li>
            <li><a href="#">Output</a></li>
            <li><a href="#">Add-ins</a></li>
            <li><a href="#">Collaborate</a></li>
            
          {/*  DXF YÜKLEME BUTON */}
          <li>
            <label htmlFor="dxf-upload" style={{ cursor: "pointer" }}>
              📂 Open DXF
            </label>
            <input
              type="file"
              id="dxf-upload"
              accept=".dxf"
              style={{ display: "none" }}
              onChange={handleDxfChange}
            />
          </li>
            {/* DXF BUTON  */}




          </ul>
          <div className="logo">
            <span>ProjeHUB</span> <span className="projectName">{projectName}</span>
          </div>
        </div>
        <div className="rightSide">
          <div className="fullscreenIcon">
            <span>🔲</span> {/* Fullscreen icon */}
          </div>
        </div>
      </div>
      {/* Second row with toolbar */}
      <div className="tools">
        <ul>
          <li>< ToolDraw/></li>
          <li>< ToolInstallation/></li>
          <li>< ToolElectricalComp/></li>
          <li>< ToolModify/></li>
          <li>< ToolText/></li>
          <li>< ToolMods/></li>
          <li>< ToolScene  scene={scene}/></li>

       
          <li><a href="#">Tool 4</a></li>
        </ul>
      </div>
    </div>
  );
};

export default TopBar;
