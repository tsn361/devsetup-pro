const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const execAsync = promisify(exec);

class ConfigManager {
  static wrapCommand(command) {
    if (os.platform() === 'win32') {
      return `wsl bash -c "${command.replace(/"/g, '\\"')}"`;
    }
    return command;
  }

  static async executeSudoCommand(command, password) {
    try {
      const escapedPassword = password.replace(/'/g, "'\\''");
      const sudoCommand = `echo '${escapedPassword}' | sudo -S ${command}`;
      const wrappedCommand = this.wrapCommand(sudoCommand);
      const { stdout, stderr } = await execAsync(wrappedCommand);
      return { stdout, stderr };
    } catch (error) {
      throw error;
    }
  }

  static async listConfigs(configInfo) {
    try {
      const command = this.wrapCommand(`ls -1 ${configInfo.availablePath}`);
      const { stdout } = await execAsync(command);
      const files = stdout.split('\n').filter(f => f.trim());

      const configs = await Promise.all(files.map(async (file) => {
        // Check if enabled (symlink exists)
        const enabledPath = path.join(configInfo.enabledPath, file).replace(/\\/g, '/');
        const checkCmd = this.wrapCommand(`test -L ${enabledPath} && echo "yes" || echo "no"`);
        const { stdout: enabledOut } = await execAsync(checkCmd);
        
        return {
          name: file,
          enabled: enabledOut.trim() === 'yes'
        };
      }));

      return configs;
    } catch (error) {
      console.error('Error listing configs:', error);
      return [];
    }
  }

  static async getConfigContent(configInfo, name) {
    try {
      const filePath = path.join(configInfo.availablePath, name).replace(/\\/g, '/');
      const command = this.wrapCommand(`cat ${filePath}`);
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to read config: ${error.message}`);
    }
  }

  static async saveConfig(configInfo, name, content, password) {
    try {
      // Write to a temp file first then move with sudo
      const tempFile = `/tmp/${name}_${Date.now()}`;
      const filePath = path.join(configInfo.availablePath, name).replace(/\\/g, '/');
      
      // Escape content for echo, this is tricky. Better to write to local temp file then copy to WSL
      // But since we are in node, we can't easily write to WSL filesystem directly if not in WSL.
      // Assuming we are running on Windows host interacting with WSL via exec.
      
      // Strategy: Write to a local temp file in Windows, then copy to WSL /tmp, then move to destination
      // Or use base64 to transfer content
      const base64Content = Buffer.from(content).toString('base64');
      // Wrap in bash -c to ensure the whole pipeline runs under sudo
      const command = `bash -c 'echo "${base64Content}" | base64 -d > ${tempFile} && mv ${tempFile} ${filePath}'`;
      
      await this.executeSudoCommand(command, password);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  }

  static async toggleConfig(configInfo, name, enable, password) {
    try {
      const availablePath = path.join(configInfo.availablePath, name).replace(/\\/g, '/');
      const enabledPath = path.join(configInfo.enabledPath, name).replace(/\\/g, '/');

      let command;
      if (configInfo.type === 'apache') {
        const action = enable ? 'a2ensite' : 'a2dissite';
        command = `${action} "${name}"`;
      } else {
        // Nginx or generic
        if (enable) {
          command = `ln -sf "${availablePath}" "${enabledPath}"`;
        } else {
          command = `rm -f "${enabledPath}"`;
        }
      }

      await this.executeSudoCommand(command, password);
      
      // Reload service
      await this.executeSudoCommand(`systemctl reload ${configInfo.serviceName}`, password);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to toggle config: ${error.message}`);
    }
  }
  
  static async deleteConfig(configInfo, name, password) {
    try {
      // Disable first
      await this.toggleConfig(configInfo, name, false, password);
      
      const filePath = path.join(configInfo.availablePath, name).replace(/\\/g, '/');
      const command = `rm -f "${filePath}"`;
      await this.executeSudoCommand(command, password);
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete config: ${error.message}`);
    }
  }
}

module.exports = ConfigManager;
