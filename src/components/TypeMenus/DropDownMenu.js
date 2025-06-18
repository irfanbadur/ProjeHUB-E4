import React from 'react';

/**
 * Generic dropdown menu component.
 * @param {{
 *   x: number,
 *   y: number,
 *   options: string[],
 *   value: string,
 *   onChange: (newValue: string) => void,
 *   style?: React.CSSProperties,
 *   selectStyle?: React.CSSProperties,
 *   className?: string
 * }} props
 */
export default function DropdownMenu({
  x,
  y,
  options,
  value,
  onChange,
  style = {},
  selectStyle = {},
  className = ''
}) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        background: '#fefefe',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        fontFamily: 'Segoe UI, sans-serif',
        ...style
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: '#fff',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border 0.2s ease-in-out',
          ...selectStyle
        }}
        onMouseOver={(e) => (e.target.style.border = '1px solid #888')}
        onMouseOut={(e) => (e.target.style.border = '1px solid #ccc')}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Specialized menu for selecting socket types.
 */
export function SocketTypeMenu(props) {
  const socketOptions = ['normal', 'kapaklı', 'etanj'];
  return <DropdownMenu options={socketOptions} {...props} />;
}

/**
 * Specialized menu for selecting light switch types.
 */
export function LightSwitchTypeMenu(props) {
  const lightOptions = [
    'normal',
    'normal etanj',
    'Komütatör',
    'etanj Komütatör',
    'vaviyen'
  ];
  return <DropdownMenu options={lightOptions} {...props} />;
}
export function LightFixtureTypeMenu(props) {
  const lightOptions = [
    'normal',
    'etanj',
    'Kare Led Spot',
    'Asma Tavan Kare Floresans',
    'Yuvarlak Led Spot',
    'Yuvarlak Led Spot-Etanj',
    'tablo',
    'aplik'
  ];
  return <DropdownMenu options={lightOptions} {...props} />;
}
