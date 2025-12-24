import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IPCService from '../services/ipc';
import '../styles/Profiles.css';

function Profiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await IPCService.getProfiles();
      
      if (response.success) {
        setProfiles(response.profiles);
      } else {
        setError('Failed to load profiles');
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProfile = async (profile) => {
    // Navigate to dashboard with pre-selected tools
    navigate('/', {
      state: {
        preselectedTools: profile.tools,
      },
    });
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      const response = await IPCService.deleteProfile(profileId);
      
      if (response.success) {
        setProfiles(prev => prev.filter(p => p.id !== profileId));
      } else {
        alert('Failed to delete profile');
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert('Failed to delete profile');
    }
  };

  const handleExportProfile = (profile) => {
    try {
      // Create JSON blob
      const jsonString = JSON.stringify(profile, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.name.replace(/\s+/g, '_')}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting profile:', err);
      alert('Failed to export profile');
    }
  };

  const handleExportScript = async (profile) => {
    try {
      const response = await IPCService.exportProfile(profile.id);
      if (response.success) {
        alert('Script exported successfully!');
      } else if (!response.cancelled) {
        alert('Failed to export script: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error exporting script:', err);
      alert('Failed to export script');
    }
  };

  const handleImportProfile = () => {
    try {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          // Read file
          const text = await file.text();
          const profileData = JSON.parse(text);
          
          // Validate profile structure
          if (!profileData.name || !Array.isArray(profileData.tools)) {
            alert('Invalid profile file format');
            return;
          }
          
          // Save imported profile
          const response = await IPCService.saveProfile({
            name: `${profileData.name} (imported)`,
            tools: profileData.tools
          });
          
          if (response.success) {
            await loadProfiles();
            alert('Profile imported successfully!');
          } else {
            alert('Failed to import profile');
          }
        } catch (err) {
          console.error('Error reading file:', err);
          alert('Failed to read profile file. Make sure it\'s a valid JSON file.');
        }
      };
      
      input.click();
    } catch (err) {
      console.error('Error importing profile:', err);
      alert('Failed to import profile');
    }
  };

  if (loading) {
    return (
      <div className="profiles loading">
        <div className="spinner"></div>
        <p>Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profiles error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadProfiles} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="profiles">
      <div className="profiles-header">
        <div className="header-info">
          <h1>Saved Profiles</h1>
          <p>Manage your installation profiles</p>
        </div>

        <div className="header-actions">
          <button onClick={handleImportProfile} className="btn-secondary">
            Import Profile
          </button>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="profiles-empty">
          <div className="empty-icon">📦</div>
          <h2>No Profiles Yet</h2>
          <p>Create a profile by selecting tools and clicking "Save as Profile"</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="profiles-grid">
          {profiles.map(profile => (
            <div key={profile.id} className="profile-card">
              <div className="profile-header">
                <h3>{profile.name}</h3>
                <span className="profile-date">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>

              {profile.description && (
                <p className="profile-description">{profile.description}</p>
              )}

              <div className="profile-stats">
                <span className="tool-count">
                  {profile.tools.length} tools
                </span>
              </div>

              <div className="profile-tools-preview">
                {profile.tools.slice(0, 5).map((toolId, i) => (
                  <span key={i} className="tool-tag">{toolId}</span>
                ))}
                {profile.tools.length > 5 && (
                  <span className="tool-tag more">
                    +{profile.tools.length - 5} more
                  </span>
                )}
              </div>

              <div className="profile-actions">
                <button 
                  onClick={() => handleLoadProfile(profile)}
                  className="btn-primary btn-small"
                >
                  Load
                </button>
                <button 
                  onClick={() => handleExportProfile(profile)}
                  className="btn-secondary btn-small"
                  title="Export as JSON"
                >
                  JSON
                </button>
                <button 
                  onClick={() => handleExportScript(profile)}
                  className="btn-secondary btn-small"
                  title="Export as Shell Script"
                >
                  Script
                </button>
                <button 
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profiles;
