const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');
const execAsync = promisify(exec);

class ServiceManager {
  static wrapCommand(command) {
    if (os.platform() === 'win32') {
      return `wsl bash -c "${command.replace(/"/g, '\\"')}"`;
    }
    return command;
  }

  static async executeSudoCommand(command, password) {
    try {
      const sudoCommand = `echo '${password}' | sudo -S ${command}`;
      const wrappedCommand = this.wrapCommand(sudoCommand);
      const { stdout, stderr } = await execAsync(wrappedCommand);
      return { stdout, stderr };
    } catch (error) {
      throw error;
    }
  }

  static async getServiceStatus(serviceName) {
    try {
      const command = this.wrapCommand(`systemctl is-active ${serviceName}`);
      const { stdout } = await execAsync(command);
      return stdout.trim(); // 'active', 'inactive', 'failed', etc.
    } catch (error) {
      // systemctl returns non-zero exit code if not active
      return 'inactive'; 
    }
  }

  static async startService(serviceName, password) {
    return this.executeSudoCommand(`systemctl start ${serviceName}`, password);
  }

  static async stopService(serviceName, password) {
    return this.executeSudoCommand(`systemctl stop ${serviceName}`, password);
  }

  static async restartService(serviceName, password) {
    return this.executeSudoCommand(`systemctl restart ${serviceName}`, password);
  }
}

module.exports = ServiceManager;
