const isElectron = () => typeof window !== 'undefined' && !!window.electronAPI;

const ipcRenderer = isElectron()
  ? {
      invoke: (channel, payload) => window.electronAPI.invoke(channel, payload),
      on: (channel, cb) => {
        if (channel === 'installation-update') {
          window.electronAPI.onInstallationUpdate(cb);
        }
      },
      removeAllListeners: (channel) => {
        if (!channel || channel === 'installation-update') {
          window.electronAPI.removeInstallationUpdateListener();
        }
      },
    }
  : null;

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
   * Export a profile as shell script
   */
  static async exportProfile(profileId) {
    try {
      if (!ipcRenderer) return { success: false };
      return await ipcRenderer.invoke('export-profile', profileId);
    } catch (error) {
      console.error('Error exporting profile:', error);
      throw error;
    }
  }

  /**
   * Uninstall a tool
   */
  static async uninstallTool(toolId, password) {
    try {
      if (!ipcRenderer) return { success: false };
      return await ipcRenderer.invoke('uninstall-tool', { toolId, password });
    } catch (error) {
      console.error('Error uninstalling tool:', error);
      throw error;
    }
  }

  /**
   * Get tool extras
   */
  static async getToolExtras(toolId) {
    try {
      if (!ipcRenderer) return { success: false, extras: [] };
      return await ipcRenderer.invoke('get-tool-extras', toolId);
    } catch (error) {
      console.error('Error getting tool extras:', error);
      throw error;
    }
  }

  /**
   * Manage tool extras
   */
  static async manageToolExtras(toolId, data) {
    try {
      if (!ipcRenderer) return { success: false };
      return await ipcRenderer.invoke('manage-tool-extras', { toolId, ...data });
    } catch (error) {
      console.error('Error managing tool extras:', error);
      throw error;
    }
  }

  // Config Management
  static async getConfigs(toolId) {
    if (!ipcRenderer) return { success: false, configs: [] };
    return await ipcRenderer.invoke('get-configs', toolId);
  }

  static async getConfigContent(toolId, name) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('get-config-content', { toolId, name });
  }

  static async saveConfig(toolId, name, content, password) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('save-config', { toolId, name, content, password });
  }

  static async toggleConfig(toolId, name, enable, password) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('toggle-config', { toolId, name, enable, password });
  }

  static async deleteConfig(toolId, name, password) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('delete-config', { toolId, name, password });
  }

  // Service Management
  static async getServiceStatus(serviceName) {
    if (!ipcRenderer) return { success: false, status: 'unknown' };
    return await ipcRenderer.invoke('get-service-status', serviceName);
  }

  static async startService(serviceName, password) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('start-service', { serviceName, password });
  }

  static async stopService(serviceName, password) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('stop-service', { serviceName, password });
  }

  static async restartService(serviceName, password) {
    if (!ipcRenderer) return { success: false };
    return await ipcRenderer.invoke('restart-service', { serviceName, password });
  }

  /**
   * Listen for installation updates
   */
  static onInstallationUpdate(callback) {
    if (ipcRenderer) {
      ipcRenderer.on('installation-update', callback);
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
