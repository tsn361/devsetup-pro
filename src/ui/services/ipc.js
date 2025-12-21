// Check if running in Electron
const isElectron = () => {
  return window && window.process && window.process.type;
};

let ipcRenderer = null;
if (isElectron()) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}

/**
 * IPC Service - Handles communication between React frontend and Electron backend
 */
class IPCService {
  /**
   * Get all available tools
   */
  static async getTools() {
    try {
      if (!ipcRenderer) {
        // Mock data for browser testing
        return {
          success: true,
          categories: [],
        };
      }
      return await ipcRenderer.invoke('get-tools');
    } catch (error) {
      console.error('Error getting tools:', error);
      throw error;
    }
  }

  /**
   * Get system information
   */
  static async getSystemInfo() {
    if (!this.isElectron()) {
      return {
        platform: 'browser',
        arch: 'unknown',
        nodeVersion: 'N/A',
        electronVersion: 'N/A',
        appVersion: '0.1.0',
        totalMemory: 0,
        freeMemory: 0,
        cpus: 0,
        hostname: 'browser',
      };
    }
    
    try {
      return await ipcRenderer.invoke('get-system-info');
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  }

  /**
   * Run system check
   */
  static async systemCheck() {
    if (!this.isElectron()) {
      return {
        platform: false,
        apt: false,
        internet: false,
        diskSpace: false,
        sudo: false,
      };
    }
    try {
      return await ipcRenderer.invoke('system-check');
    } catch (error) {
      console.error('Error running system check:', error);
      throw error;
    }
  }

  /**
   * Verify sudo password
   */
  static async verifySudo(password) {
    try {
      return await ipcRenderer.invoke('verify-sudo', password);
    } catch (error) {
      console.error('Error verifying sudo:', error);
      throw error;
    }
  }

  /**
   * Install tools
   */
  static async installTools(tools, password) {
    try {
      return await ipcRenderer.invoke('install-tools', { tools, password });
    } catch (error) {
      console.error('Error installing tools:', error);
      throw error;
    }
  }

  /**
   * Get saved profiles
   */
  static async getProfiles() {
    try {
      return await ipcRenderer.invoke('get-profiles');
    } catch (error) {
      console.error('Error getting profiles:', error);
      throw error;
    }
  }

  /**
   * Save a profile
   */
  static async saveProfile(profile) {
    try {
      return await ipcRenderer.invoke('save-profile', profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Delete a profile
   */
  static async deleteProfile(profileId) {
    try {
      if (!ipcRenderer) return { success: false };
      return await ipcRenderer.invoke('delete-profile', profileId);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Listen for installation updates
   */
  static onInstallationUpdate(callback) {
    if (ipcRenderer) {
      ipcRenderer.on('installation-update', (event, data) => {
        callback(data);
      });
    }
  }

  /**
   * Remove installation update listener
   */
  static removeInstallationUpdateListener() {
    if (ipcRenderer) {
      ipcRenderer.removeAllListeners('installation-update');
    }
  }
}

export default IPCService;
