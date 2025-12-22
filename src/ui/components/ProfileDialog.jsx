import React, { useState } from 'react';
import '../styles/ProfileDialog.css';

function ProfileDialog({ onSubmit, onCancel }) {
  const [profileName, setProfileName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (profileName.trim()) {
      onSubmit({
        name: profileName.trim(),
        description: description.trim() || `Profile with custom tools`,
      });
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content profile-dialog">
        <h2>Save Profile</h2>
        <p>Create a profile to save your tool selection</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name">Profile Name *</label>
            <input
              type="text"
              id="profile-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g., Full Stack Development"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-description">Description (optional)</label>
            <textarea
              id="profile-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this profile is for..."
              rows="3"
            />
          </div>

          <div className="dialog-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={!profileName.trim()}>
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileDialog;
