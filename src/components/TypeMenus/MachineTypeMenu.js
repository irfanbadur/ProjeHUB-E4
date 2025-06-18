import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import './MachineTypeMenu.css';
import { createMachineSymbol } from '../../symbolDrawings/createMachines';

const machines = [
  { name: 'Çamaşır Makinası', power: [2500] },
  { name: 'Bulaşık Makinası', power: [2500] },
  { name: 'Fırın', power: [2000] },
  { name: 'Kombi', power: [300] },
  { name: 'Klima', power: [1500, 2000, 2500] },
  { name: 'Fan', power: [550, 750, 1100, 1500, 2200, 3000, 4000, 5500, 7500, 11000, 15000, 18500] },
  { name: 'Motor', power: [550, 750, 1100, 1500, 2200, 3000, 4000, 5500, 7500, 11000, 15000, 18500] },
  { name: 'Hidrofor', power: [550, 750, 1100, 1500, 2200, 3000, 4000, 5500] },
  { name: 'Yangın Pompası', power: [1100, 1500, 2200, 3000, 4000, 5500, 7500, 11000, 15000, 18500] }
];

export default function MachineTypeMenu({
  x,
  y,
  onClose,
  machineDetails,
  onDrag,
  scene,
}) {
  const [machine, setMachine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState({ name: 'Çamaşır Makinası', power: [2500] });
  const [power, setPower] = useState(2500);

  const menuRef = useRef(null);
  const dragData = useRef({ active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    // Seçilen machine’i sahneden bul
    scene.traverse(obj => {
      if (obj.userData.id === machineDetails.ID) {
        setMachine(obj);
        const { machineType, power } = obj.userData;
        const foundMachine = machines.find(m => m.name === machineType);
        if (foundMachine) {
          setSelectedMachine(foundMachine);
          setPower(power);
        }
      }
    });
  }, [machineDetails, scene]);

  const handleMachineSelect = (e) => {
    const machine = machines.find(m => m.name === e.target.value);
    if (machine) {
      setSelectedMachine(machine);
      setPower(machine.power[0]);
      updateMachineSymbol(machine.name, machine.power[0]);
    }
  };
  const updateMachineSymbol = (machineType, machinePower) => {
    if (!machine) return;
    const oldColor = getMachineColor(machine); // örnek fonksiyon
    const rotationZ = machine.rotation?.z ?? 0;

    const {
      id,
      basePoint,
      isPreview,
      isSelectable,
      type,
      rotate,
      angle,dir
    } = machine.userData;

    // Eskiyi temizle
    scene.remove(machine);
    machine.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  
    const newMachine = createMachineSymbol(
      scene,
      new THREE.Vector3(basePoint.x, basePoint.y, 0),
      dir,
      oldColor,
      isPreview ?? true,
      machineType,
      machinePower
    );
    newMachine.rotation.z = angle; 
    // Eğer createMachineSymbol sahneye eklemiyorsa, zorla ekle
    if (newMachine) {
      scene.add(newMachine);
      newMachine.userData = {
        id,
        basePoint,
        isPreview,
        isSelectable,
        type,
        rotate,
        machineType,
        power: machinePower,
        angle,
        dir

      };
      setMachine(newMachine);
    } else {
      console.warn("❌ createMachineSymbol hiçbir şey döndürmedi!");
    }
    
  
    setMachine(newMachine);
  };
   
  const handlePowerSelect = (e) => {
    const newPower = Number(e.target.value);
    setPower(newPower);
    updateMachineSymbol(selectedMachine.name, newPower);
  };
  function getMachineColor(obj) {
    let material = null;
  
    obj.traverse(child => {
      if (child.isMesh && child.material) {
        material = child.material;
      }
    });
  
    return material ? material.color.getHex() : 0x00ffff;
  }
  

  const handleMouseDown = (e) => {
    e.stopPropagation();
    dragData.current = {
      active: true,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragData.current.active) return;
    const dx = e.clientX - dragData.current.lastX;
    const dy = e.clientY - dragData.current.lastY;
    dragData.current.lastX = e.clientX;
    dragData.current.lastY = e.clientY;
    onDrag(dx, dy);
  };

  const handleMouseUp = () => {
    dragData.current.active = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="machine-type-menu"
      style={{ left: x, top: y }}
    >
      <div onMouseDown={handleMouseDown} className="machine-type-menu-header">
        {selectedMachine.name}/{power} W
        <button
          className="close-button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      </div>
      <div className="machine-type-options">
        <div className="machine-type-details-box">
          <table className="machine-type-details-table">
            <tbody>
              <tr>
                <td className="label-cell">Cihaz</td>
                <td>
                  <select
                    style={{ width: "100%", maxWidth: "160px" }}
                    value={selectedMachine.name}
                    onChange={(e) => {
                      const machine = machines.find(m => m.name === e.target.value);
                      if (machine) {
                        setSelectedMachine(machine);
                        setPower(machine.power[0]);
                        updateMachineSymbol(machine.name, machine.power[0]); // 🔥 ekledik
                      }
                    }}
                    
                  >
                    {machines.map((mach) => (
                      <option key={mach.name} value={mach.name}>{mach.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="label-cell">Güç</td>
                <td>
                  <select
                    style={{ width: "100%", maxWidth: "160px" }}
                    value={power}
                    onChange={(e) => {
                      const newPower = Number(e.target.value);
                      setPower(newPower);
                      updateMachineSymbol(selectedMachine.name, newPower); // 🔥 burası da önemli
                    }}
                  >
                    {selectedMachine.power.map((pwr) => (
                      <option key={pwr} value={pwr}>{pwr}W</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
