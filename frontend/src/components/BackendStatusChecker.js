import React, { useState, useEffect } from 'react';
import { testBackendConnection } from '../config/api';

const BackendStatusChecker = ({ children }) => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showStatus, setShowStatus] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      const result = await testBackendConnection();
      setBackendStatus(result.success ? 'connected' : 'disconnected');
      
      // Hide status after 5 seconds if connected
      if (result.success) {
        setTimeout(() => setShowStatus(false), 5000);
      }
    };

    checkBackend();
  }, []);

  const retryConnection = async () => {
    setBackendStatus('checking');
    const result = await testBackendConnection();
    setBackendStatus(result.success ? 'connected' : 'disconnected');
    
    if (result.success) {
      setTimeout(() => setShowStatus(false), 3000);
    }
  };

  if (!showStatus && backendStatus === 'connected') {
    return children;
  }

  return (
    <>
      {showStatus && (
        <div className={`fixed top-16 left-0 right-0 z-40 px-4 py-2 text-center text-sm font-medium ${
          backendStatus === 'connected' 
            ? 'bg-green-500 text-white' 
            : backendStatus === 'checking'
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {backendStatus === 'checking' && (
            <span>🔄 Checking backend connection...</span>
          )}
          {backendStatus === 'connected' && (
            <span>✅ Backend connected successfully!</span>
          )}
          {backendStatus === 'disconnected' && (
            <span>
              ❌ Backend server is not running. Please start the server or 
              <button 
                onClick={retryConnection}
                className="ml-2 underline hover:no-underline"
              >
                retry connection
              </button>
            </span>
          )}
          {showStatus && backendStatus === 'connected' && (
            <button 
              onClick={() => setShowStatus(false)}
              className="ml-4 text-xs opacity-75 hover:opacity-100"
            >
              ✕ Hide
            </button>
          )}
        </div>
      )}
      <div className={showStatus ? 'pt-12' : ''}>
        {children}
      </div>
    </>
  );
};

export default BackendStatusChecker;