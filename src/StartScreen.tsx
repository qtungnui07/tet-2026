import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div 
      onClick={onStart}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle, #4a0e0e 0%, #1a0202 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        zIndex: 10000, cursor: 'pointer', userSelect: 'none'
      }}
    >
      <div style={{
        color: '#f2c641', textAlign: 'center',
        animation: 'pulse 1.5s infinite ease-in-out'
      }}>
        <p style={{ fontSize: '3rem', opacity: 1, fontFamily: 'y2026' }}>
          ENTER
        </p>
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default StartScreen;