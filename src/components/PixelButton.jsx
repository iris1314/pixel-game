import React from 'react';

const PixelButton = ({ children, onClick, color = 'var(--pixel-primary)', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: color,
        color: 'var(--pixel-text)',
        border: '4px solid #000',
        boxShadow: 'inset -4px -4px 0px 0px rgba(0,0,0,0.2), 4px 4px 0px 0px #000',
        padding: '12px 24px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 'inherit',
        margin: '10px',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 0.1s',
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'translate(2px, 2px)')}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = 'translate(0, 0)')}
    >
      {children}
    </button>
  );
};

export default PixelButton;
