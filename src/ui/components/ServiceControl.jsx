import React, { useState, useEffect } from 'react';
import IPCService from '../services/ipc';
import PasswordDialog from './PasswordDialog';
import '../styles/ServiceControl.css';

function ServiceControl({ serviceName }) {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Password Dialog State
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName]);

  const checkStatus = async () => {
    try {
      const response = await IPCService.getServiceStatus(serviceName);
      if (response.success) {
        setStatus(response.status);
      }
    } catch (err) {
      console.error('Error checking service status:', err);
    }
  };

  const initiateAction = (action) => {
    setPendingAction(action);
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async (password) => {
    setShowPasswordDialog(false);
    if (!pendingAction) return;

    const action = pendingAction;
    setLoading(true);
    setError(null);

    try {
      let response;
      if (action === 'start') {
        response = await IPCService.startService(serviceName, password);
      } else if (action === 'stop') {
        response = await IPCService.stopService(serviceName, password);
      } else if (action === 'restart') {
        response = await IPCService.restartService(serviceName, password);
      }

      if (response.success) {
        await checkStatus();
      } else {
        setError(response.error || `Failed to ${action} service`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const isActive = status === 'active';

  return (
    <>
      <div className="service-control" onClick={(e) => e.stopPropagation()}>
        <div className="service-status-row">
          <span className="service-label">Service:</span>
          <span className={`service-status ${status}`}>
            {status}
          </span>
          {loading && <span className="service-loading">...</span>}
        </div>
        
        <div className="service-actions">
          {!isActive && (
            <button 
              className="service-btn start" 
              onClick={() => initiateAction('start')}
              disabled={loading}
            >
              Start
            </button>
          )}
          {isActive && (
            <button 
              className="service-btn stop" 
              onClick={() => initiateAction('stop')}
              disabled={loading}
            >
              Stop
            </button>
          )}
          <button 
            className="service-btn restart" 
            onClick={() => initiateAction('restart')}
            disabled={loading}
          >
            Restart
          </button>
        </div>
        {error && <div className="service-error">{error}</div>}
      </div>

      <PasswordDialog 
        isOpen={showPasswordDialog}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setShowPasswordDialog(false);
          setPendingAction(null);
        }}
      />
    </>
  );
}

export default ServiceControl;
