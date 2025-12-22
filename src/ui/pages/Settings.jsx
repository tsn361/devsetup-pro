import React, { useState, useEffect } from 'react';
import IPCService from '../services/ipc';
import '../styles/Settings.css';

const SETTINGS_KEY = 'devsetup_settings';

const defaultSettings = {
  showLogsRealtime: true,
  autoScrollLogs: true,
  checkUpdatesAuto: false,
  showSystemWarnings: true,
};

function Settings() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSystemInfo();
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus('Failed to save');
    }
  };

  const handleSettingChange = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

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
          <div className="section-header">
            <h2>Application Settings</h2>
            {saveStatus && <span className="save-status">{saveStatus}</span>}
          </div>
          
          <div className="settings-group">
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={settings.showLogsRealtime}
                  onChange={() => handleSettingChange('showLogsRealtime')}
                />
                Show installation logs in real-time
              </label>
              <p className="setting-description">Display command output as it happens during installation</p>
            </div>
            
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={settings.autoScrollLogs}
                  onChange={() => handleSettingChange('autoScrollLogs')}
                />
                Auto-scroll logs during installation
              </label>
              <p className="setting-description">Automatically scroll to latest log entries</p>
            </div>
            
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox"
                  checked={settings.checkUpdatesAuto}
                  onChange={() => handleSettingChange('checkUpdatesAuto')}
                />
                Check for updates automatically
              </label>
              <p className="setting-description">Check for new versions on startup</p>
            </div>Business Source License 1.1</p>
            
            <div className="about-links">
              <button className="btn-link" onClick={() => alert('Documentation: See README.md and docs/ folder in the project')}>
                View Documentation
              </button>
              <button className="btn-link" onClick={() => alert('To report an issue, please create a GitHub issue in your repository')}>
                Report an Issue
              </button>
              <button className="btn-link" onClick={() => alert('You are running version 0.1.0 (MVP)\n\nThis is a development build.')}>
                Check for Updates
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          
          <div className="danger-actions">
            <button 
              className="btn-danger"
              onClick={async () => {
                if (window.confirm('This will delete all saved profiles. Are you sure?')) {
                  // TODO: Implement clear profiles
                  alert('Clear profiles feature coming soon');
                }
              }}
            >
              Clear All Profiles
            </button>
            <button 
              className="btn-danger"
              onClick={() => {
                if (window.confirm('Reset all settings to defaults?')) {
                  saveSettings(defaultSettings);
                  alert('Settings reset to defaults');
                }
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
