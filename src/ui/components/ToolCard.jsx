import React from 'react';
import '../styles/ToolCard.css';

function ToolCard({ tool, selected, onToggle, disabled }) {
  const handleClick = () => {
    if (!disabled) {
      onToggle(tool.id);
    }
  };

  return (
    <div 
      className={`tool-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${tool.installed ? 'installed' : ''}`}
      onClick={handleClick}
    >
      <div className="tool-card-header">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleClick}
          disabled={disabled}
          className="tool-checkbox"
        />
        <h3 className="tool-name">{tool.name}</h3>
        {tool.installed && <span className="installed-badge">✓ Installed</span>}
      </div>
      
      <p className="tool-description">{tool.description}</p>
      
      <div className="tool-meta">
        <span className="tool-package">{tool.package}</span>
        {tool.size && <span className="tool-size">{tool.size}</span>}
      </div>

      {tool.dependencies && tool.dependencies.length > 0 && (
        <div className="tool-dependencies">
          <small>Dependencies: {tool.dependencies.join(', ')}</small>
        </div>
      )}

      {tool.conflicts && tool.conflicts.length > 0 && (
        <div className="tool-conflicts">
          <small>⚠️ Conflicts with: {tool.conflicts.join(', ')}</small>
        </div>
      )}

      {tool.website && (
        <a 
          href={tool.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="tool-website"
          onClick={(e) => e.stopPropagation()}
        >
          Learn more →
        </a>
      )}
    </div>
  );
}

export default ToolCard;
