import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategorySection from '../components/CategorySection';
import PasswordDialog from '../components/PasswordDialog';
import IPCService from '../services/ipc';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemCheck, setSystemCheck] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTools();
    runSystemCheck();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const response = await IPCService.getTools();
      
      if (response.success) {
        setCategories(response.categories);
      } else {
        setError('Failed to load tools');
      }
    } catch (err) {
      console.error('Error loading tools:', err);
      setError('Failed to load tools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runSystemCheck = async () => {
    try {
      const response = await IPCService.systemCheck();
      if (response.success) {
        setSystemCheck(response);
      }
    } catch (err) {
      console.error('System check failed:', err);
    }
  };

  const handleToolToggle = (toolId) => {
    setSelectedTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  const handleSelectAll = () => {
    const allToolIds = categories.flatMap(cat => 
      cat.tools.filter(t => !t.installed).map(t => t.id)
    );
    setSelectedTools(allToolIds);
  };

  const handleClearAll = () => {
    setSelectedTools([]);
  };

  const handleInstall = () => {
    if (selectedTools.length === 0) {
      alert('Please select at least one tool to install');
      return;
    }

    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async (password) => {
    setShowPasswordDialog(false);

    // Verify password first
    try {
      const verifyResponse = await IPCService.verifySudo(password);
      
      if (!verifyResponse.success || !verifyResponse.valid) {
        alert('Invalid password. Please try again.');
        return;
      }

      // Navigate to installing page with state
      navigate('/installing', {
        state: {
          tools: selectedTools,
          password: password,
        },
      });
    } catch (err) {
      console.error('Password verification failed:', err);
      alert('Failed to verify password. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    if (selectedTools.length === 0) {
      alert('Please select tools before saving a profile');
      return;
    }

    const profileName = prompt('Enter profile name:');
    if (!profileName) return;

    try {
      const response = await IPCService.saveProfile({
        name: profileName,
        tools: selectedTools,
        description: `Profile with ${selectedTools.length} tools`,
      });

      if (response.success) {
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="spinner"></div>
        <p>Loading tools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadTools} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* System Check Warning */}
      {systemCheck && !systemCheck.allPassed && (
        <div className="system-warning">
          <h3>⚠️ System Check Warning</h3>
          <p>Some system requirements are not met:</p>
          <ul>
            {!systemCheck.checks.platform && <li>Not running on Linux</li>}
            {!systemCheck.checks.apt && <li>apt-get not available</li>}
            {!systemCheck.checks.internet && <li>No internet connection</li>}
            {!systemCheck.checks.diskSpace && <li>Insufficient disk space</li>}
            {!systemCheck.checks.sudo && <li>sudo not available</li>}
          </ul>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Select Tools to Install</h1>
          <p>Choose from {categories.reduce((sum, cat) => sum + cat.tools.length, 0)} available developer tools</p>
        </div>

        <div className="header-actions">
          <button onClick={handleSelectAll} className="btn-secondary">
            Select All
          </button>
          <button onClick={handleClearAll} className="btn-secondary">
            Clear All
          </button>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="categories-container">
        {categories.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
          />
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <div className="selection-summary">
          <strong>{selectedTools.length}</strong> tools selected
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleSaveProfile}
            className="btn-secondary"
            disabled={selectedTools.length === 0}
          >
            Save as Profile
          </button>
          
          <button 
            onClick={handleInstall}
            className="btn-primary"
            disabled={selectedTools.length === 0}
          >
            Install Selected Tools
          </button>
        </div>
      </div>

      {/* Password Dialog */}
      <PasswordDialog
        isOpen={showPasswordDialog}
        onSubmit={handlePasswordSubmit}
        onCancel={() => setShowPasswordDialog(false)}
      />
    </div>
  );
}

export default Dashboard;
