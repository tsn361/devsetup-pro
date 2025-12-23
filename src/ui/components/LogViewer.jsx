import React, { useEffect, useRef } from 'react';
import '../styles/LogViewer.css';

function LogViewer({ logs, autoScroll = true }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLogClass = (log) => {
    if (log.includes('ERROR') || log.includes('Failed')) {
      return 'log-error';
    }
    if (log.includes('WARNING') || log.includes('⚠️')) {
      return 'log-warning';
    }
    if (log.includes('SUCCESS') || log.includes('✓')) {
      return 'log-success';
    }
    return 'log-info';
  };

  const handleCopyLogs = () => {
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      alert('Logs copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy logs:', err);
    });
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h3>Installation Logs</h3>
        <div className="log-actions">
          <span className="log-count">{logs.length} entries</span>
          <button onClick={handleCopyLogs} className="btn-small" disabled={logs.length === 0}>
            Copy Logs
          </button>
        </div>
      </div>
      
      <div className="log-content">
        {logs.length === 0 ? (
          <div className="log-empty">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`log-entry ${getLogClass(log)}`}>
              <span className="log-time">{new Date().toLocaleTimeString()}</span>
              <span className="log-message">{log}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

export default LogViewer;
