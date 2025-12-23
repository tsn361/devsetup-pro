import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import LogViewer from '../components/LogViewer';
import IPCService from '../services/ipc';
import '../styles/Installing.css';

function Installing() {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparing...');
  const [currentTool, setCurrentTool] = useState('');
  const [logs, setLogs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);
  const hasStartedRef = React.useRef(false);

  const { tools, password, mode = 'install', toolName } = location.state || {};

  useEffect(() => {
    if (!tools && !toolName) {
      navigate('/');
      return;
    }
    if (!password) {
      navigate('/');
      return;
    }

    // Listen for installation updates
    IPCService.onInstallationUpdate((data) => {
      setProgress(data.progress || 0);
      setStatus(data.status || (mode === 'uninstall' ? 'Uninstalling...' : 'Installing...'));
      setCurrentTool(data.message || '');
      
      if (data.message) {
        setLogs(prev => [...prev, data.message]);
      }
    });

    // Start installation or uninstallation only once
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      if (mode === 'uninstall') {
        startUninstallation();
      } else {
        startInstallation();
      }
    }

    // Cleanup
    return () => {
      IPCService.removeInstallationUpdateListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools, password, mode, navigate]);

  const startInstallation = async () => {
    try {
      setLogs(prev => [...prev, `Starting installation of ${tools.length} tools...`]);
      setStatus('Installing...');

      const response = await IPCService.installTools(tools, password);

      if (response.success) {
        setStatus('Completed!');
        setProgress(100);
        setLogs(prev => [...prev, '✓ All tools installed successfully!']);
      } else {
        setStatus('Failed');
        setLogs(prev => [...prev, `❌ Installation failed: ${response.error}`]);
      }

      setResults(response);
      setIsComplete(true);
    } catch (err) {
      console.error('Installation error:', err);
      setStatus('Error');
      setLogs(prev => [...prev, `❌ Installation error: ${err.message}`]);
      setIsComplete(true);
      setResults({ success: false, error: err.message });
    }
  };

  const startUninstallation = async () => {
    try {
      setStatus('Uninstalling...');

      const response = await IPCService.uninstallTool(tools, password);

      if (response.success) {
        setStatus('Completed!');
        setProgress(100);
      } else {
        setStatus('Failed');
      }

      setResults(response);
      setIsComplete(true);
    } catch (err) {
      console.error('Uninstallation error:', err);
      setStatus('Error');
      setLogs(prev => [...prev, `❌ Uninstallation error: ${err.message}`]);
      setIsComplete(true);
      setResults({ success: false, error: err.message });
    }
  };

  const handleDone = () => {
    navigate('/', { state: { refresh: true } });
  };

  const handleViewLogs = () => {
    // Export logs to file
    const logText = logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `devsetup-${mode || 'install'}-logs-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="installing">
      <div className="installing-header">
        <h1>{mode === 'uninstall' ? 'Uninstalling Tool' : 'Installing Tools'}</h1>
        <p>
          {mode === 'uninstall' 
            ? 'Please wait while we uninstall the tool...' 
            : 'Please wait while we install the selected tools...'}
        </p>
      </div>

      <div className="installing-content">
        <ProgressBar
          progress={progress}
          status={status}
          currentTool={currentTool}
        />

        <LogViewer logs={logs} autoScroll={true} />

        {isComplete && results && (
          <div className="installation-results">
            <h2>{mode === 'uninstall' ? 'Uninstallation Summary' : 'Installation Summary'}</h2>
            
            {results.success ? (
              <div className="results-success">
                <div className="success-icon">✓</div>
                <h3>{mode === 'uninstall' ? 'Uninstallation Completed Successfully!' : 'Installation Completed Successfully!'}</h3>
                <p>
                  {mode === 'uninstall' 
                    ? `${toolName} has been removed from your system`
                    : `${results.installed || tools.length} of ${tools.length} tools installed`}
                </p>
              </div>
            ) : (
              <div className="results-error">
                <div className="error-icon">✗</div>
                <h3>{mode === 'uninstall' ? 'Uninstallation Failed' : 'Installation Failed'}</h3>
                <p>{results.error}</p>
                {results.results && (
                  <div className="failed-tools">
                    <h4>Failed Tools:</h4>
                    <ul>
                      {results.results
                        .filter(r => !r.success)
                        .map((r, i) => (
                          <li key={i}>{r.name}: {r.message}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="results-actions">
              <button onClick={handleViewLogs} className="btn-secondary">
                Export Logs
              </button>
              <button onClick={handleDone} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Installing;
