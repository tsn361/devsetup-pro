import React, { useState, useEffect } from 'react';
import IPCService from '../services/ipc';
import '../styles/Settings.css';

function Settings() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await IPCService.getSystemInfo();
      
      if (response.success) {
        setSystemInfo(response.info);
      }
    } catch (err) {
      console.error('Error loading system info:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    const gb = (bytes / (1024 ** 3)).toFixed(2);
    return `${gb} GB`;
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Application settings and system information</p>
      </div>

      <div className="settings-content">
        {/* System Information */}
        <section className="settings-section">
          <h2>System Information</h2>
          
          {loading ? (
            <p>Loading system information...</p>
          ) : systemInfo ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Operating System:</label>
                <span>{systemInfo.osVersion}</span>
              </div>
              <div className="info-item">
                <label>Platform:</label>
                <span>{systemInfo.platform}</span>
              </div>
              <div className="info-item">
                <label>Architecture:</label>
                <span>{systemInfo.arch}</span>
              </div>
              <div className="info-item">
                <label>CPUs:</label>
                <span>{systemInfo.cpus} cores</span>
              </div>
              <div className="info-item">
                <label>Total Memory:</label>
                <span>{formatBytes(systemInfo.totalMemory)}</span>
              </div>
              <div className="info-item">
                <label>Free Memory:</label>
                <span>{formatBytes(systemInfo.freeMemory)}</span>
              </div>
              <div className="info-item">
                <label>Hostname:</label>
                <span>{systemInfo.hostname}</span>
              </div>
            </div>
          ) : (
            <p>Failed to load system information</p>
          )}
        </section>

        {/* Application Settings */}
        <section className="settings-section">
          <h2>Application Settings</h2>
          
          <div className="settings-group">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Show installation logs in real-time
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-scroll logs during installation
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                Check for updates automatically
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Show system warnings
              </label>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="settings-section">
          <h2>About DevSetup Pro</h2>
          
          <div className="about-info">
            <p><strong>Version:</strong> 0.1.0 (MVP)</p>
            <p><strong>Description:</strong> Ubuntu Developer Tool Installer</p>
            <p><strong>License:</strong> MIT</p>
            
            <div className="about-links">
              <button className="btn-link">View Documentation</button>
              <button className="btn-link">Report an Issue</button>
              <button className="btn-link">Check for Updates</button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          
          <div className="danger-actions">
            <button className="btn-danger">Clear All Profiles</button>
            <button className="btn-danger">Reset to Defaults</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
