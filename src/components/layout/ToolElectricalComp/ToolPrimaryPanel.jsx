import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formIcons } from "../../../utils/sembolSvg";

import "./ToolElectricalComp.css";
import { getIcon } from "../../../utils/icons";

import { setCommandType, resetOperation, setCommandMessage } from "../../../redux/operationSlice"
const tableCellStyle1 = {
  border: '1px solid #444',
  padding: '4px', // Kenar boşluklarını belirle
  width: '50%', // Hücre genişliği sabit
  maxWidth: '50%', // Maksimum genişliği belirleyerek taşmasını engelle
  height: "15px", // Yüksekliği sabitle
  maxHeight: "50px", // Maksimum yükseklik belirle
  color: '#fff',
  fontSize: '0.75rem',
  textAlign: "center", // İçeriği ortalar
  verticalAlign: "middle", // İçeriği dikeyde ortalar (rowSpan ile çalışır)
  overflow: "hidden", // İçeriğin taşmasını engelle
  display: "table-cell", // **rowSpan'ın çalışmasını sağlar**
  backgroundColor: "#000",
};
const tableCellStyle2 = {
  border: '1px solid #444',
  padding: '4px', // Kenar boşluklarını belirle
  width: '50%', // Hücre genişliği sabit
  maxWidth: '50%', // Maksimum genişliği belirleyerek taşmasını engelle
  height: "50px", // Yüksekliği sabitle
  maxHeight: "50px", // Maksimum yükseklik belirle
  color: '#fff',
  fontSize: '0.75rem',
  textAlign: "center", // İçeriği ortalar
  verticalAlign: "middle", // İçeriği dikeyde ortalar (rowSpan ile çalışır)
  overflow: "hidden", // İçeriğin taşmasını engelle
  display: "table-cell", // **rowSpan'ın çalışmasını sağlar**
  backgroundColor: "#000",
};



const ToolPrimaryPanel = () => {
  const [selection, setSelection] = useState(null);
  const buttonSize = 30;
  const dispatch = useDispatch();
  const commandType = useSelector((state) => state.operation.commandType);

  const [formData, setFormData] = useState({
    form: "AnaDağıtımPanosu",
    type: "",
    power: 0,
    description1: "AnaDağıtımPanosu",
    description2: "123",
    color: "#0000ff",
    textColor: "#0f0faa",
    Scl: 1,
    angle: 45,
    panelID: "",
    phaseCount: 3,
    phase: "RST",
  });


  const handleClick = (val) => {
    console.log("val  :", val.target.value)
    setSelection(val.target.value)
  };

  return (
    <div  >
      <table  style={{width:"100%" }}>
        <tbody>
          <tr  style={{  border:"1px solid #fff"}}>
            <td  style={tableCellStyle1}>
              <select  style={{width:"100%" }}>
                <option>Mesken</option>
                <option>İşyeri</option>
                <option>Müşterek</option>
                <option>Asansör</option>
              </select>

            </td>
            <td  style={tableCellStyle2}rowSpan={4}>
              {formIcons[formData.form] ? (
                React.createElement(formIcons[formData.form], {
                  text1: formData.type || "Tip-A1",
                  text2: `${formData.power || "300"} W`,
                  color: "#FFAA22",// "#2222FF",

                })
              ) : (
                <h1 variant="h6" color="white">
                  Bir form seçin
                </h1>
              )}
            </td>
          </tr>
          <tr><td>
          <input
                type="text"
                style={{ width: "100%", padding: "2px", fontSize: "0.75rem" }}
                value={formData.description1}
                onChange={e =>
                  setFormData({ ...formData, description1: e.target.value })
                }
              />

            </td></tr>


        </tbody>
      </table>

    </div>
  );
};

export default ToolPrimaryPanel;
