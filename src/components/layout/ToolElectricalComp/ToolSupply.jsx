import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formIcons } from "../../../utils/sembolSvg";
import { setCommandType,resetOperation,setCommandMessage  } from "../../../redux/operationSlice"

import "./ToolElectricalComp.css";

const tableCellStyle1 = {
  border: '1px solid #444',
  padding: '4px',
  width: '50%',
  maxWidth: '50%',
  height: "15px",
  maxHeight: "50px",
  color: '#fff',
  fontSize: '0.75rem',
  textAlign: "center",
  verticalAlign: "middle",
  overflow: "hidden",
  display: "table-cell",
  backgroundColor: "#1f1f2e",
};
const tableCellStyle2 = {
  ...tableCellStyle1,
  height: "50px",
  maxHeight: "50px",
};

const ToolSupply = () => {
  const dispatch = useDispatch();
  const commandType = useSelector((s) => s.operation.commandType);

  const [formData, setFormData] = useState({
    form: "Şebeke",
    type: "Şebeke",
    power: 0,
    description1: "Şebeke",
    description2: "123",
    color: "#0000ff",
    textColor: "#0f0faa",
    Scl: 1,
    angle: 45,
    panelID: "",
    phaseCount: 3,
    phase: "RST",
    // ────────── new fields ──────────
    supplier: "Yedaş",
    customSupplier: "",
  });
    const handleSymbolClick = (data) => {
    console.log("Symbol clicked formData.form:", formData);
      dispatch(setCommandType("drawSupplyPoint"));
      dispatch(setCommandMessage("İlk noktayı seçin")); 
  };
  const handleSupplierChange = e => {
    const val = e.target.value;
    setFormData({
      ...formData,
      supplier: val,
      type:val,
      // clear custom when changing away from “other”
      customSupplier: val === "other" ? formData.customSupplier : "",
    });
  };

  return (
    <div>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr style={{ border: "1px solid #fff" }}>
            <td style={tableCellStyle1}>
              <select
                style={{ width: "100%",backgroundColor:  "#2f333b" }}
                value={formData.type}
                onChange={e =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Seçiniz</option>
                <option value="Box">Box</option>
                <option value="Direk">Direk</option>
              </select>
            </td>
            <td style={tableCellStyle2} rowSpan={4}
                          onClick={() => {
                handleSymbolClick(formData.form);
              }}
              >
              {formIcons[formData.form] ? (
                React.createElement(formIcons[formData.form], {
                  text1: formData.type || "Şebeke",
                  text2: `${formData.power || "300"} W`,
                  color: "#FFAA22",
                })
              ) : (
                <h1 variant="h6" color="white">
                  Bir form seçin
                </h1>
              )}
            </td>
          </tr>

          {/* ─── here’s the “supplier” select with a “Diğer…” option ─── */}
          <tr>
            <td style={tableCellStyle1}>
              <select
                style={{ width: "100%",backgroundColor:  "#2f333b"  }}
                value={formData.supplier}
                onChange={handleSupplierChange}
              >
                <option value="Yedaş">Yedaş</option>
                <option value="Şebeke">Şebeke</option>
                <option value="Kurum">Kurum</option>
                <option value="other">Diğer…</option>
              </select>

              {formData.supplier === "other" && (
                <input
                  type="text"
                  placeholder="El ile giriniz"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "2px",
                    fontSize: "0.75rem", backgroundColor:  "#2f333b" 
                  }}
                  value={formData.customSupplier}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      type:e.target.value,
                      customSupplier: e.target.value,
                    })
                  }
                />
              )}
            </td>
          </tr>

        
        </tbody>
      </table>
    </div>
  );
};

export default ToolSupply;
