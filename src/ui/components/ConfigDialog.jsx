import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import IPCService from '../services/ipc';
import PasswordDialog from './PasswordDialog';
import '../styles/ConfigDialog.css';

function ConfigDialog({ tool, onClose }) {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Password Dialog State
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await IPCService.getConfigs(tool.id);
      if (response.success) {
        setConfigs(response.configs);
      } else {
        setError('Failed to load configs');
      }
    } catch (err) {
      setError('Error loading configs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (config) => {
    try {
      setProcessing(true);
      const response = await IPCService.getConfigContent(tool.id, config.name);
      if (response.success) {
        setSelectedConfig(config);
        setEditorContent(response.content);
        setIsEditing(true);
        setIsNew(false);
      } else {
        setError('Failed to load config content');
      }
    } catch (err) {
      setError('Error loading config content');
    } finally {
      setProcessing(false);
    }
  };

  const handleNew = () => {
    setSelectedConfig(null);
    setEditorContent('');
    setNewConfigName('');
    setIsEditing(true);
    setIsNew(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!password) return;

    const name = isNew ? newConfigName : selectedConfig.name;
    if (!name) return;

    try {
      setProcessing(true);
      const response = await IPCService.saveConfig(tool.id, name, editorContent, password);
      if (response.success) {
        setIsEditing(false);
        setPassword('');
        loadConfigs();
      } else {
        setError(response.error || 'Failed to save config');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const initiateToggle = (config, enable) => {
    setPendingAction({ type: 'toggle', config, enable });
    setShowPasswordDialog(true);
  };

  const initiateDelete = (config) => {
    if (!window.confirm(`Are you sure you want to delete ${config.name}?`)) return;
    setPendingAction({ type: 'delete', config });
    // Small delay to ensure window.confirm releases focus
    setTimeout(() => {
      setShowPasswordDialog(true);
    }, 50);
  };

  const handlePasswordSubmit = async (pwd) => {
    setShowPasswordDialog(false);
    if (!pendingAction) return;

    setProcessing(true);
    try {
      let response;
      if (pendingAction.type === 'toggle') {
        response = await IPCService.toggleConfig(tool.id, pendingAction.config.name, pendingAction.enable, pwd);
      } else if (pendingAction.type === 'delete') {
        response = await IPCService.deleteConfig(tool.id, pendingAction.config.name, pwd);
      }

      if (response && response.success) {
        loadConfigs();
      } else {
        setError(response?.error || 'Operation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
      setPendingAction(null);
    }
  };

  if (loading) {
    return createPortal(
      <div className="dialog-overlay">
        <div className="dialog-content loading">
          <div className="spinner"></div>
          <p>Loading configurations...</p>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="dialog-overlay">
      <div className="dialog-content config-dialog">
        <div className="dialog-header">
          <h2>Manage {tool.name} Configurations</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!isEditing ? (
          <div className="config-list-view">
            <div className="list-header">
              <h3>Available Sites</h3>
              <button className="btn-primary btn-sm" onClick={handleNew}>+ New Site</button>
            </div>
            <div className="config-list">
              {configs.length === 0 ? (
                <p className="no-data">No configurations found.</p>
              ) : (
                configs.map(config => (
                  <div key={config.name} className="config-item">
                    <div className="config-info">
                      <span className="config-name">{config.name}</span>
                      <span className={`status-badge ${config.enabled ? 'enabled' : 'disabled'}`}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="config-actions">
                      <button 
                        className={`btn-toggle ${config.enabled ? 'on' : 'off'}`}
                        onClick={() => initiateToggle(config, !config.enabled)}
                        disabled={processing}
                      >
                        {config.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(config)} disabled={processing}>✏️</button>
                      <button className="btn-icon btn-danger" onClick={() => initiateDelete(config)} disabled={processing}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="config-editor">
            <div className="editor-header">
              {isNew ? (
                <input
                  type="text"
                  placeholder="Config Name (e.g. my-site.conf)"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  required
                  className="config-name-input"
                />
              ) : (
                <h3>Editing: {selectedConfig.name}</h3>
              )}
            </div>
            
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="code-editor"
              spellCheck="false"
            />

            <div className="editor-footer">
              <input
                type="password"
                placeholder="Enter sudo password to save"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="password-input"
              />
              <div className="editor-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Config'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <PasswordDialog 
        isOpen={showPasswordDialog}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setShowPasswordDialog(false);
          setPendingAction(null);
        }}
      />
    </div>,
    document.body
  );
}

export default ConfigDialog;
