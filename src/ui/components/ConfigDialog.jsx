import React, { useState, useEffect } from 'react';
import IPCService from '../services/ipc';
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

  const handleToggle = async (config, enable) => {
    // Prompt for password if not already entered (simple prompt for now)
    // In a real app, we'd use a proper dialog flow, but let's reuse the password field if visible or prompt
    let pwd = password;
    if (!pwd) {
      // This is a bit hacky, ideally we'd have a global password context or modal
      // For now, let's just show an input if not editing
      if (!isEditing) {
        // Show password prompt
        const p = window.prompt("Enter sudo password to change config status:");
        if (!p) return;
        pwd = p;
      }
    }

    try {
      setProcessing(true);
      const response = await IPCService.toggleConfig(tool.id, config.name, enable, pwd);
      if (response.success) {
        loadConfigs();
      } else {
        window.alert('Failed to toggle config: ' + response.error);
      }
    } catch (err) {
      window.alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (config) => {
    if (!window.confirm(`Are you sure you want to delete ${config.name}?`)) return;
    
    const p = window.prompt("Enter sudo password to delete config:");
    if (!p) return;

    try {
      setProcessing(true);
      const response = await IPCService.deleteConfig(tool.id, config.name, p);
      if (response.success) {
        loadConfigs();
      } else {
        window.alert('Failed to delete: ' + response.error);
      }
    } catch (err) {
      window.alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="dialog-overlay">
        <div className="dialog-content loading">
          <div className="spinner"></div>
          <p>Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
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
                        onClick={() => handleToggle(config, !config.enabled)}
                        disabled={processing}
                      >
                        {config.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(config)} disabled={processing}>✏️</button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(config)} disabled={processing}>🗑️</button>
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
    </div>
  );
}

export default ConfigDialog;
