import React, { useState } from 'react';
import '../styles/PasswordDialog.css';

function PasswordDialog({ isOpen, onSubmit, onCancel }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Password is required');
      return;
    }

    setError('');
    onSubmit(password);
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Enter Sudo Password</h2>
        <p className="dialog-description">
          DevSetup Pro needs administrator privileges to install packages.
          Your password will not be stored.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="password-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="password-input"
              autoFocus
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="dialog-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Continue
            </button>
          </div>
        </form>

        <div className="dialog-security-note">
          🔒 Your password is encrypted and only used for this session
        </div>
      </div>
    </div>
  );
}

export default PasswordDialog;
