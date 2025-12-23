import React, { useState, useEffect } from 'react';
import IPCService from '../services/ipc';
import '../styles/ModuleDialog.css';

function ModuleDialog({ tool, onClose, onApply }) {
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState(new Set());
  const [initialExtras, setInitialExtras] = useState(new Set());
  const [password, setPassword] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  const loadExtras = async () => {
    try {
      setLoading(true);
      const response = await IPCService.getToolExtras(tool.id);
      if (response.success) {
        setExtras(response.extras);
        const installed = new Set(
          response.extras.filter(e => e.installed).map(e => e.id)
        );
        setInitialExtras(installed);
        setSelectedExtras(installed);
      } else {
        setError('Failed to load modules');
      }
    } catch (err) {
      setError('Error loading modules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    const newSelected = new Set(selectedExtras);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExtras(newSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setApplying(true);
    setError(null);

    const toInstall = extras
      .filter(e => selectedExtras.has(e.id) && !initialExtras.has(e.id))
      .map(e => e.resolvedPackage || e.package);

    const toRemove = extras
      .filter(e => !selectedExtras.has(e.id) && initialExtras.has(e.id))
      .map(e => e.resolvedPackage || e.package);

    if (toInstall.length === 0 && toRemove.length === 0) {
      onClose();
      return;
    }

    try {
      const response = await IPCService.manageToolExtras(tool.id, {
        password,
        install: toInstall,
        remove: toRemove
      });

      if (response.success) {
        onApply(response);
        onClose();
      } else {
        setError(response.error || 'Failed to apply changes');
      }
    } catch (err) {
      setError(err.message || 'Error applying changes');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="dialog-overlay">
        <div className="dialog-content loading">
          <div className="spinner"></div>
          <p>Loading modules...</p>
        </div>
      </div>
    );
  }

  const hasChanges = 
    [...selectedExtras].some(id => !initialExtras.has(id)) ||
    [...initialExtras].some(id => !selectedExtras.has(id));

  return (
    <div className="dialog-overlay">
      <div className="dialog-content module-dialog">
        <div className="dialog-header">
          <h2>Manage {tool.name} Modules</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modules-list-container">
          {extras.length === 0 ? (
            <p className="no-modules">No manageable modules found for this tool.</p>
          ) : (
            extras.map(extra => (
              <div key={extra.id} className="module-item">
                <label className="module-label">
                  <input
                    type="checkbox"
                    checked={selectedExtras.has(extra.id)}
                    onChange={() => handleToggle(extra.id)}
                    disabled={applying}
                  />
                  <div className="module-info">
                    <span className="module-name">{extra.name}</span>
                    <span className="module-desc">{extra.description}</span>
                  </div>
                </label>
                <span className="module-package">{extra.resolvedPackage || extra.package}</span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="dialog-footer">
          {hasChanges && (
            <div className="password-input-group">
              <input
                type="password"
                placeholder="Enter sudo password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={applying}
                required
              />
            </div>
          )}
          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={applying}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!hasChanges || !password || applying}
            >
              {applying ? 'Applying...' : 'Apply Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModuleDialog;
