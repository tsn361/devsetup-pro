import React, { useState } from 'react';
import ModuleDialog from './ModuleDialog';
import ConfigDialog from './ConfigDialog';
import ServiceControl from './ServiceControl';
import '../styles/ToolCard.css';

function ToolCard({ tool, selected, onToggle, disabled, onUninstall }) {
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const handleClick = () => {
    if (!disabled && !tool.installed) {
      onToggle(tool.id);
    }
  };

  const handleUninstall = (e) => {
    e.stopPropagation();
    if (onUninstall) {
      onUninstall(tool.id);
    }
  };

  const handleManageModules = (e) => {
    e.stopPropagation();
    setShowModuleDialog(true);
  };

  const handleManageConfig = (e) => {
    e.stopPropagation();
    setShowConfigDialog(true);
  };

  return (
    <>
      <div 
        className={`tool-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${tool.installed ? 'installed' : ''}`}
        onClick={handleClick}
        title={!tool.installed ? "Click to select for installation" : "Already installed"}
      >
        <div className="tool-card-header">
          {!tool.installed ? (
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={selected}
                onChange={handleClick}
                disabled={disabled}
                className="tool-checkbox"
              />
            </div>
          ) : (
            <span className="installed-badge">✓ Installed</span>
          )}
          
          <h3 className="tool-name">{tool.name}</h3>
          
          {tool.installed && (
            <div className="header-buttons">
              {tool.configManagement && (
                <button
                  className="manage-btn"
                  onClick={handleManageConfig}
                  disabled={disabled}
                  title="Manage Configuration"
                >
                  🔧
                </button>
              )}
              {tool.extras && (
                <button
                  className="manage-btn"
                  onClick={handleManageModules}
                  disabled={disabled}
                  title="Manage Modules"
                >
                  ⚙️
                </button>
              )}
              <button
                className="uninstall-button"
                onClick={handleUninstall}
                disabled={disabled}
              >
                Uninstall
              </button>
            </div>
          )}
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

        {tool.details && tool.details.modules && tool.details.modules.length > 0 && (
          <div className="tool-modules">
            <small><strong>Installed Modules ({tool.details.modules.length}):</strong></small>
            <div className="modules-list" title={tool.details.modules.join(', ')}>
              <small>
                {tool.details.modules.slice(0, 8).join(', ')}
                {tool.details.modules.length > 8 && '...'}
              </small>
            </div>
          </div>
        )}

        {tool.installed && (tool.serviceName || (tool.configManagement && tool.configManagement.serviceName)) && (
          <ServiceControl serviceName={tool.serviceName || tool.configManagement.serviceName} />
        )}

        {tool.website && (
          <div className="tool-footer">
            <a 
              href={tool.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tool-website-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Docs ↗
            </a>
          </div>
        )}
      </div>

      {showModuleDialog && (
        <ModuleDialog
          tool={tool}
          onClose={() => setShowModuleDialog(false)}
          onApply={() => {
            window.location.reload();
          }}
        />
      )}

      {showConfigDialog && (
        <ConfigDialog
          tool={tool}
          onClose={() => setShowConfigDialog(false)}
        />
      )}
    </>
  );
}

export default ToolCard;
