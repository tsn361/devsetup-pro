const { contextBridge, ipcRenderer } = require('electron');

const allowedInvoke = [
  'install-tools',
  'verify-sudo',
  'get-tools',
  'get-system-info',
  'system-check',
  'get-profiles',
  'save-profile',
  'delete-profile',
  'uninstall-tool',
  'get-tool-extras',
  'manage-tool-extras',
  'get-configs',
  'get-config-content',
  'save-config',
  'toggle-config',
  'delete-config',
  'get-service-status',
  'start-service',
  'stop-service',
  'restart-service',
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, payload) => {
    if (!allowedInvoke.includes(channel)) return Promise.reject(new Error('Channel not allowed'));
    return ipcRenderer.invoke(channel, payload);
  },
  onInstallationUpdate: (callback) => {
    ipcRenderer.on('installation-update', (_event, data) => callback(data));
  },
  removeInstallationUpdateListener: () => {
    ipcRenderer.removeAllListeners('installation-update');
  },
});
