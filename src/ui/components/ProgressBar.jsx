import React from 'react';
import '../styles/ProgressBar.css';

function ProgressBar({ progress, status, currentTool }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-info">
        <span className="progress-percentage">{Math.round(progress)}%</span>
        <span className="progress-status">{status}</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {currentTool && (
        <div className="current-tool">
          Installing: <strong>{currentTool}</strong>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
