const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;
let expressServer;

// Import the Express server
const { startServer, stopServer } = require('./server');

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false, // Don't show until ready
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App ready event
 */
app.whenReady().then(async () => {
  try {
    // Start Express server
    expressServer = await startServer(3001);
    console.log('Express server started on port 3001');

    // Create main window
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

/**
 * Handle activation (macOS)
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Handle all windows closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Handle app quit
 */
app.on('before-quit', async () => {
  if (expressServer) {
    await stopServer();
    console.log('Express server stopped');
  }
});

// ============================================================================
// IPC Event Handlers
// ============================================================================

/**
 * Install tools - triggered from renderer
 */
ipcMain.handle('install-tools', async (event, { tools, password }) => {
  try {
    // Forward to Express API
    const axios = require('axios');
    const response = await axios.post('http://localhost:3001/api/install', {
      tools,
      password,
    });

    return response.data;
  } catch (error) {
    console.error('Installation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Verify sudo password
 */
ipcMain.handle('verify-sudo', async (event, password) => {
  try {
    const axios = require('axios');
    const response = await axios.post('http://localhost:3001/api/verify-sudo', {
      password,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Get all tools
 */
ipcMain.handle('get-tools', async () => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3001/api/tools');
    return response.data;
  } catch (error) {
    console.error('Failed to get tools:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Get system info
 */
ipcMain.handle('get-system-info', async () => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3001/api/system/info');
    return response.data;
  } catch (error) {
    console.error('Failed to get system info:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Run system check
 */
ipcMain.handle('system-check', async () => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3001/api/system/check');
    return response.data;
  } catch (error) {
    console.error('System check failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Get saved profiles
 */
ipcMain.handle('get-profiles', async () => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3001/api/profiles');
    return response.data;
  } catch (error) {
    console.error('Failed to get profiles:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Save profile
 */
ipcMain.handle('save-profile', async (event, profile) => {
  try {
    const axios = require('axios');
    const response = await axios.post('http://localhost:3001/api/profiles', profile);
    return response.data;
  } catch (error) {
    console.error('Failed to save profile:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Delete profile
 */
ipcMain.handle('delete-profile', async (event, profileId) => {
  try {
    const axios = require('axios');
    const response = await axios.delete(`http://localhost:3001/api/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete profile:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Uninstall tool
 */
ipcMain.handle('uninstall-tool', async (event, { toolId, password }) => {
  try {
    // Send initial update
    sendInstallationUpdate({
      toolId: toolId,
      status: 'uninstalling',
      progress: 10,
      message: `Starting uninstallation...`,
    });

    const axios = require('axios');
    
    sendInstallationUpdate({
      toolId: toolId,
      status: 'uninstalling',
      progress: 30,
      message: `Running: apt-get remove -y (package)`,
    });

    const response = await axios.delete(`http://localhost:3001/api/tools/${toolId}`, {
      data: { password }
    });

    // Send completion update
    if (response.data.success) {
      sendInstallationUpdate({
        toolId: toolId,
        status: 'completed',
        progress: 100,
        message: `✓ Successfully uninstalled ${response.data.tool?.name || 'tool'}`,
      });
    } else {
      sendInstallationUpdate({
        toolId: toolId,
        status: 'failed',
        progress: 100,
        message: `✗ Failed to uninstall: ${response.data.error}`,
      });
    }

    return response.data;
  } catch (error) {
    console.error('Failed to uninstall tool:', error);
    
    sendInstallationUpdate({
      toolId: toolId,
      status: 'failed',
      progress: 100,
      message: `✗ Uninstall error: ${error.message}`,
    });

    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
});

/**
 * Send installation update to renderer
 */
function sendInstallationUpdate(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('installation-update', data);
  }
}

// Export for use by server
module.exports = {
  sendInstallationUpdate,
};
