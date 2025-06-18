import React from 'react';

export default function SocketTypeMenu({ x, y, value, onChange }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        background: '#fefefe',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '1px 2px',
          border: '1px solid #fcc',
          borderRadius: '10px',
          fontSize: '14px',
          backgroundColor: '#fff',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border 0.2s ease-in-out',
        }}
        onMouseOver={(e) => {
          e.target.style.border = '1px solid #888';
        }}
        onMouseOut={(e) => {
          e.target.style.border = '1px solid #ccc';
        }}
      >
        <option value="normal">Normal</option>
        <option value="kapaklı">Kapaklı</option>
        <option value="etanj">Etanj</option>
      </select>
    </div>
  );
}
