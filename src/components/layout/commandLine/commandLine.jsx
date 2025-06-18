import React, { useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { setCommandType } from '../../../redux/operationSlice';
import './commandLine.css';

const CommandLine = () => {
  const [command, setCommand] = useState('');
  const commandMessage = useSelector((state) => state.operation.message); // 👈 Redux'tan al

  const dispatch = useDispatch();

  const handleCommand = (cmd) => {
    const command = cmd.toLowerCase();
  
    switch (command) {
      case 'line':
        dispatch(setCommandType("drawLine"));
        break;
      case 'polyline':
        dispatch(setCommandType("drawPolyline"));
        break;
      case 'circle':
        dispatch(setCommandType("drawCircle"));
        break;
      case 'arc':
        dispatch(setCommandType("drawArc"));
        break;
      case 'rect':
        dispatch(setCommandType("drawRect"));
        break;
      case 'spline':
        dispatch(setCommandType("drawSpline"));
        break;
      case 'ellipse':
        dispatch(setCommandType("drawEllipse"));
        break;
      case 'text':
        dispatch(setCommandType("drawText"));
        break;
      case 'mtext':
        dispatch(setCommandType("drawMText"));
        break;
  
      // 🔧 MODIFY KOMUTLARI
      case 'erase':
        dispatch(setCommandType("erase"));
        break;
      case 'move':
        dispatch(setCommandType("move"));
        break;
      case 'copy':
        dispatch(setCommandType("copy")); // Hook sonra yazılacak
        break;
      case 'rotate':
        dispatch(setCommandType("rotate")); // Hook sonra yazılacak
        break;
  
      default:
        console.log("⛔ Bilinmeyen komut:", command);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(command);
      setCommand('');
    }
  };

  return (
    <div className="command-line">
      <span className="prompt">Command:</span>
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        className="command-input"
        placeholder="Enter command"
      />
        <div className="command-message">{commandMessage}</div> {/* 👈 Mesaj gösterilir */}
    </div>
  );
};

export default CommandLine;
