const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * PackageManager - Handles apt package installation and management
 */
class PackageManager {
  /**
   * Check if a package is installed
   * @param {string} packageName - Name of the package (can include multiple packages separated by space)
   * @returns {Promise<boolean>} - True if installed, false otherwise
   */
  static async isInstalled(packageName) {
    try {
      // Handle multiple packages (e.g., "python3 python3-pip")
      const packages = packageName.split(' ').filter((p) => p.trim());

      for (const pkg of packages) {
        const { stdout } = await execAsync(`dpkg -l | grep -E "^ii\\s+${pkg}\\s"`);
        if (!stdout.trim()) {
          return false;
        }
      }

      return true;
    } catch (error) {
      // grep returns exit code 1 if no match found
      return false;
    }
  }

  /**
   * Install a package using apt-get
   * @param {string} packageName - Name of the package to install
   * @param {string} password - Sudo password
   * @returns {Promise<Object>} - Installation result with success status and message
   */
  static async install(packageName, password) {
    try {
      console.log(`Installing package: ${packageName}`);

      // Update package list first
      await this.updatePackageList(password);

      // Install the package
      const command = `DEBIAN_FRONTEND=noninteractive apt-get install -y ${packageName}`;
      const { stdout, stderr } = await this.executeSudoCommand(command, password);

      // Check if installation was successful
      const isNowInstalled = await this.isInstalled(packageName);

      if (isNowInstalled) {
        return {
          success: true,
          message: `Successfully installed ${packageName}`,
          output: stdout,
        };
      } else {
        return {
          success: false,
          message: `Failed to install ${packageName}`,
          error: stderr,
        };
      }
    } catch (error) {
      console.error(`Installation error for ${packageName}:`, error);
      return {
        success: false,
        message: `Error installing ${packageName}: ${error.message}`,
        error: error.stderr || error.message,
      };
    }
  }

  /**
   * Uninstall a package using apt-get
   * @param {string} packageName - Name of the package to uninstall
   * @param {string} password - Sudo password
   * @returns {Promise<Object>} - Uninstallation result
   */
  static async uninstall(packageName, password) {
    try {
      console.log(`Uninstalling package: ${packageName}`);

      const command = `DEBIAN_FRONTEND=noninteractive apt-get remove -y ${packageName}`;
      const { stdout, stderr } = await this.executeSudoCommand(command, password);

      const isStillInstalled = await this.isInstalled(packageName);

      if (!isStillInstalled) {
        return {
          success: true,
          message: `Successfully uninstalled ${packageName}`,
          output: stdout,
        };
      } else {
        return {
          success: false,
          message: `Failed to uninstall ${packageName}`,
          error: stderr,
        };
      }
    } catch (error) {
      console.error(`Uninstallation error for ${packageName}:`, error);
      return {
        success: false,
        message: `Error uninstalling ${packageName}: ${error.message}`,
        error: error.stderr || error.message,
      };
    }
  }

  /**
   * Update package list (apt-get update)
   * @param {string} password - Sudo password
   * @returns {Promise<Object>} - Update result
   */
  static async updatePackageList(password) {
    try {
      console.log('Updating package list...');
      const command = 'apt-get update';
      const { stdout, stderr } = await this.executeSudoCommand(command, password);

      return {
        success: true,
        message: 'Package list updated',
        output: stdout,
      };
    } catch (error) {
      console.error('Package list update error:', error);
      // Don't fail if update fails, continue with installation
      return {
        success: false,
        message: 'Failed to update package list',
        error: error.message,
      };
    }
  }

  /**
   * Get package information
   * @param {string} packageName - Name of the package
   * @returns {Promise<Object>} - Package information
   */
  static async getPackageInfo(packageName) {
    try {
      const { stdout } = await execAsync(`apt-cache show ${packageName}`);

      const info = {};
      const lines = stdout.split('\n');

      for (const line of lines) {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          info[key.trim()] = value;
        }
      }

      return {
        success: true,
        info,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check for package dependencies
   * @param {string} packageName - Name of the package
   * @returns {Promise<Array>} - List of dependencies
   */
  static async getDependencies(packageName) {
    try {
      const { stdout } = await execAsync(`apt-cache depends ${packageName}`);

      const dependencies = [];
      const lines = stdout.split('\n');

      for (const line of lines) {
        if (line.trim().startsWith('Depends:')) {
          const dep = line.replace('Depends:', '').trim();
          dependencies.push(dep);
        }
      }

      return dependencies;
    } catch (error) {
      console.error(`Error getting dependencies for ${packageName}:`, error);
      return [];
    }
  }

  /**
   * Execute a command with sudo privileges
   * @private
   * @param {string} command - Command to execute
   * @param {string} password - Sudo password
   * @returns {Promise<Object>} - Command output
   */
  static async executeSudoCommand(command, password) {
    try {
      // Use echo to pass password to sudo
      const sudoCommand = `echo '${password}' | sudo -S ${command}`;

      const { stdout, stderr } = await execAsync(sudoCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      });

      return { stdout, stderr };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean up unused packages
   * @param {string} password - Sudo password
   * @returns {Promise<Object>} - Cleanup result
   */
  static async autoremove(password) {
    try {
      console.log('Running autoremove...');
      const command = 'DEBIAN_FRONTEND=noninteractive apt-get autoremove -y';
      const { stdout } = await this.executeSudoCommand(command, password);

      return {
        success: true,
        message: 'Autoremove completed',
        output: stdout,
      };
    } catch (error) {
      console.error('Autoremove error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search for packages
   * @param {string} searchTerm - Term to search for
   * @returns {Promise<Array>} - List of matching packages
   */
  static async search(searchTerm) {
    try {
      const { stdout } = await execAsync(`apt-cache search ${searchTerm}`);

      const packages = stdout
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [name, ...descParts] = line.split(' - ');
          return {
            name: name.trim(),
            description: descParts.join(' - ').trim(),
          };
        });

      return packages;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
}

module.exports = PackageManager;
