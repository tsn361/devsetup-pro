import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategorySection from '../components/CategorySection';
import PasswordDialog from '../components/PasswordDialog';
import ProfileDialog from '../components/ProfileDialog';
import IPCService from '../services/ipc';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemCheck, setSystemCheck] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showUninstallDialog, setShowUninstallDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [toolToUninstall, setToolToUninstall] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSystemDetails, setShowSystemDetails] = useState(false);

  useEffect(() => {
    loadTools();
    runSystemCheck();
    
    // Check if profile was loaded
    if (location.state?.preselectedTools) {
      setSelectedTools(location.state.preselectedTools);
    }
    
    // Reload tools when returning from installation (force refresh)
    if (location.state?.refresh) {
      // Clear the refresh flag to prevent infinite loops
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.key]); // location triggers reload on navigation

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
        setError('Invalid sudo password. Please try again.');
        setTimeout(() => setError(null), 5000);
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
      setError('Failed to verify password. Please check your network connection.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSaveProfile = () => {
    if (selectedTools.length === 0) {
      setError('Please select tools before saving a profile');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setShowProfileDialog(true);
  };

  const handleProfileSubmit = async (profileData) => {
    setShowProfileDialog(false);

    try {
      const response = await IPCService.saveProfile({
        name: profileData.name,
        tools: selectedTools,
        description: profileData.description,
      });

      if (response.success) {
        setError(`✓ Profile "${profileData.name}" saved successfully!`);
        setTimeout(() => setError(null), 3000);
      } else {
        setError('Failed to save profile: ' + (response.error || 'Unknown error'));
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUninstall = (toolId) => {
    setToolToUninstall(toolId);
    setShowUninstallDialog(true);
  };

  const handleUninstallSubmit = async (password) => {
    setShowUninstallDialog(false);
setError('Invalid sudo password. Please try again.');
        setTimeout(() => setError(null), 5000);
        setToolToUninstall(null);
        return;
      }

      // Find the tool name for display
      const tool = categories
        .flatMap(cat => cat.tools)
        .find(t => t.id === toolToUninstall);

      // Navigate to installing page in uninstall mode
      navigate('/installing', {
        state: {
          tools: toolToUninstall,
          toolName: tool?.name || toolToUninstall,
          password: password,
          mode: 'uninstall',
        },
      });
    } catch (err) {
      console.error('Password verification failed:', err);
      setError('Failed to verify password. Please try again.');
      setTimeout(() => setError(null), 5000
          password: password,
          mode: 'uninstall',
        },
      });
    } catch (err) {
      console.error('Password verification failed:', err);
      alert('Failed to verify password. Please try again.');
      setToolToUninstall(null);
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
      {/* Error Banner */}
      {error && !loading && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {/* System Check Warning - Only show critical warnings */}
      {systemCheck && !systemCheck.allPassed && (
        <div className="system-warning">
          <div className="warning-header">
            <h3>⚠️ System Check Warning</h3>
            <button 
              onClick={() => setShowSystemDetails(!showSystemDetails)}
              className="details-toggle"
            >
              {showSystemDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          <p>Some system requirements are not met:</p>
          <ul>
            {!systemCheck.checks.apt && <li>apt-get not available (required for package installation)</li>}
            {!systemCheck.checks.internet && <li>No internet connection (required to download packages)</li>}
            {!systemCheck.checks.diskSpace && <li>Insufficient disk space</li>}
            {!systemCheck.checks.sudo && <li>sudo not available (required for installation)</li>}
          </ul>
          
          {showSystemDetails && (
            <div className="system-details">
              <h4>System Check Details:</h4>
              <div className="check-list">
                <div className={`check-item ${systemCheck.checks.platform ? 'pass' : 'fail'}`}>
                  {systemCheck.checks.platform ? '✅' : '❌'} Platform: {systemCheck.platform || 'Unknown'}
                </div>
                <div className={`check-item ${systemCheck.checks.apt ? 'pass' : 'fail'}`}>
                  {systemCheck.checks.apt ? '✅' : '❌'} apt-get available
                </div>
                <div className={`check-item ${systemCheck.checks.internet ? 'pass' : 'fail'}`}>
                  {systemCheck.checks.internet ? '✅' : '❌'} Internet connection
                </div>
                <div className={`check-item ${systemCheck.checks.diskSpace ? 'pass' : 'fail'}`}>
                  {systemCheck.checks.diskSpace ? '✅' : '❌'} Disk space: {systemCheck.diskSpace || 'N/A'}
                </div>
                <div className={`check-item ${systemCheck.checks.sudo ? 'pass' : 'fail'}`}>
                  {systemCheck.checks.sudo ? '✅' : '❌'} sudo available
                </div>
              </div>
              <p className="warning-note">
                💡 <strong>Running on Windows?</strong> This app works via WSL (Windows Subsystem for Linux).
                Make sure WSL is installed and configured with Ubuntu.
              </p>
            </div>
          )}
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

      {/* Search and Filter */}
      <div className="dashboard-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="clear-search"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="category-filter">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="categories-container">
        {categories
          .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
          .map(category => {
            // Filter tools based on search query
            const filteredTools = category.tools.filter(tool =>
              tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tool.package.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Skip category if no tools match the search
            if (filteredTools.length === 0 && searchQuery) {
              return null;
            }

            return (
              <CategorySection
                key={category.id}
                category={{ ...category, tools: filteredTools }}
                selectedTools={selectedTools}
                onToolToggle={handleToolToggle}
                onUninstall={handleUninstall}
              />
            );
          })
          .filter(Boolean)}
        
        {/* No results message */}
        {searchQuery && categories.every(cat => 
          cat.tools.filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.package.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0
        ) && (
          <div className="no-results">
            <h3>No tools found</h3>
            <p>Try a different search term or clear your filters</p>
          </div>
        )}
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

      {/* Uninstall Password Dialog */}
      <PasswordDialog
        isOpen={showUninstallDialog}
        onSubmit={handleUninstallSubmit}
        onCancel={() => {
          setShowUninstallDialog(false);
          setToolToUninstall(null);
        }}
        title="Uninstall Tool"
        message="Enter your password to uninstall this tool:"
      />

      {/* Profile Dialog */}
      {showProfileDialog && (
        <ProfileDialog
          onSubmit={handleProfileSubmit}
          onCancel={() => setShowProfileDialog(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
