// src/App.jsx
import React , { useEffect, useRef, useState } from "react";
import Topbar from "./components/layout/TopBar/TopBar";
import PropertiesPanel from "./components/layout/propertiesPanel/PropertiesPanel";
import TestPanel from "./components/layout/TestPanel/TestPanel";
import DrawingCanvas from "./components/DrawingCanvas/DrawingCanvas"
import CommandLine from "./components/layout/commandLine/commandLine";
import { PanelsProvider } from "./context/PanelsContext";

const App = () => {
  const [scene, setScene] = useState(null); // ✅ sahne state'i test amaçlı toolScene e sahneyi prop olarak göndermek için daha sonra slilinecek
  const [projectName, setProjectName] = useState("İrfan BADUR");

  const handleFileSelect = (file) => {
    console.log("Seçilen dosya:", file);
    // → DXF işleme kodları burada olacak
  };

  return (
    <PanelsProvider>
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Topbar  scene={scene}  projectName={projectName}
  setProjectName={setProjectName}
  onFileSelect={handleFileSelect}
 defaultDxfFile="/samples/BosKat1.dxf" // forInstallationPOLYLINE1.dxf  forInstallationPOLYLINE1 dosyayı otomatik açma prop u 
   />{/* scene={scene} kısmı test amaçlı toolScene e sahneyi prop olarak göndermek için daha sonra slilinecek */}
       
 
      <div className="flex flex-1">
        <PropertiesPanel   initialPosition={{ top: 85, left: 1 }}/>
        <TestPanel   initialPosition={{ top: 285, left: 1 }}/>
        <DrawingCanvas  onSceneReady={setScene} /> {/* onSceneReady={setScene} kısmı test amaçlı toolScene e sahneyi prop olarak göndermek için daha sonra slilinecek */}
        <CommandLine />
      </div>  
    </div>
    </PanelsProvider>
  );
};

export default App;