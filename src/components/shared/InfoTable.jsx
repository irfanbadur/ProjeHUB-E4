// src/components/shared/InfoTable.jsx
import React, { useEffect, useRef } from 'react';
import './InfoTable.css';

const InfoTable = ({ data, onHeightChange }) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current && typeof onHeightChange === 'function') {
      const height = divRef.current.clientHeight;
      onHeightChange(height);
    }
  }, [data, onHeightChange]);

  return (
    <div className="info-table" ref={divRef}>
      <table className="info-table-grid">
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="info-label">{row.label}</td>
              <td className="info-value">
                {(row.type === 'text' || row.type === 'number') && (
                  <span>
                    {row.type === 'number'
                      ? Number(row.value).toFixed(2)
                      : row.value}
                  </span>
                )}

                {row.type === 'input' && (
                  <input
                    type="text"
                    value={row.value}
                    onChange={row.onChange}
                  />
                )}

                {row.type === 'select' && (
                  <select defaultValue={row.value} onChange={row.onChange}>
                    {row.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {row.type === 'button' && (
                  <button onClick={row.onClick}>{row.value}</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InfoTable;
