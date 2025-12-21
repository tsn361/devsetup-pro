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

  const { tools, password } = location.state || {};

  useEffect(() => {
    if (!tools || !password) {
      navigate('/');
      return;
    }

    // Listen for installation updates
    IPCService.onInstallationUpdate((data) => {
      setProgress(data.progress || 0);
      setStatus(data.status || 'Installing...');
      setCurrentTool(data.message || '');
      
      if (data.message) {
        setLogs(prev => [...prev, data.message]);
      }
    });

    // Start installation
    startInstallation();

    // Cleanup
    return () => {
      IPCService.removeInstallationUpdateListener();
    };
  }, [tools, password, navigate]);

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

  const handleDone = () => {
    navigate('/');
  };

  const handleViewLogs = () => {
    // TODO: Export logs to file
    alert('Log export feature coming soon!');
  };

  return (
    <div className="installing">
      <div className="installing-header">
        <h1>Installing Tools</h1>
        <p>Please wait while we install the selected tools...</p>
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
            <h2>Installation Summary</h2>
            
            {results.success ? (
              <div className="results-success">
                <div className="success-icon">✓</div>
                <h3>Installation Completed Successfully!</h3>
                <p>
                  {results.installed || tools.length} of {tools.length} tools installed
                </p>
              </div>
            ) : (
              <div className="results-error">
                <div className="error-icon">✗</div>
                <h3>Installation Failed</h3>
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
