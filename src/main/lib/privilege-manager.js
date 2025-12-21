const { exec } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const execAsync = promisify(exec);

/**
 * PrivilegeManager - Handles sudo password verification and privileged command execution
 */
class PrivilegeManager {
  /**
   * Verify sudo password
   * @param {string} password - Password to verify
   * @returns {Promise<boolean>} - True if password is valid, false otherwise
   */
  static async verifyPassword(password) {
    try {
      if (!password) {
        return false;
      }

      // Try to run a simple command with sudo to verify password
      const testCommand = `echo '${password}' | sudo -S echo "test" 2>&1`;

      const { stdout, stderr } = await execAsync(testCommand, {
        timeout: 5000, // 5 second timeout
      });

      // Check for success
      const output = stdout + stderr;

      // If password is wrong, sudo will output "Sorry, try again"
      if (output.includes('Sorry, try again') || output.includes('incorrect password')) {
        return false;
      }

      // If successful, should see "test" in output
      if (output.includes('test')) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Execute a command with sudo privileges
   * @param {string} command - Command to execute
   * @param {string} password - Sudo password
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Command result with stdout, stderr, and success status
   */
  static async executeCommand(command, password, options = {}) {
    try {
      if (!password) {
        throw new Error('Password is required for privileged operations');
      }

      // Verify password first
      const isValid = await this.verifyPassword(password);
      if (!isValid) {
        throw new Error('Invalid sudo password');
      }

      // Execute the command with sudo
      const sudoCommand = `echo '${password}' | sudo -S ${command}`;

      const execOptions = {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: options.timeout || 300000, // 5 minute default timeout
        ...options,
      };

      const { stdout, stderr } = await execAsync(sudoCommand, execOptions);

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } catch (error) {
      console.error('Command execution error:', error);
      return {
        success: false,
        error: error.message,
        stderr: error.stderr || '',
        stdout: error.stdout || '',
      };
    }
  }

  /**
   * Execute a command and stream output in real-time
   * @param {string} command - Command to execute
   * @param {string} password - Sudo password
   * @param {Function} onData - Callback for data chunks
   * @returns {Promise<Object>} - Command result
   */
  static async executeCommandStreaming(command, password, onData) {
    return new Promise((resolve, reject) => {
      if (!password) {
        return reject(new Error('Password is required'));
      }

      const { spawn } = require('child_process');

      // Use sudo -S to read password from stdin
      const sudoProcess = spawn('sudo', ['-S', 'sh', '-c', command], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Send password to sudo
      sudoProcess.stdin.write(`${password}\n`);
      sudoProcess.stdin.end();

      let stdout = '';
      let stderr = '';

      // Capture stdout
      sudoProcess.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (onData) {
          onData({ type: 'stdout', data: text });
        }
      });

      // Capture stderr
      sudoProcess.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (onData) {
          onData({ type: 'stderr', data: text });
        }
      });

      // Handle process completion
      sudoProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code,
          });
        } else {
          reject({
            success: false,
            error: `Command exited with code ${code}`,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code,
          });
        }
      });

      // Handle errors
      sudoProcess.on('error', (error) => {
        reject({
          success: false,
          error: error.message,
        });
      });
    });
  }

  /**
   * Check if user has sudo privileges
   * @returns {Promise<boolean>} - True if user has sudo access
   */
  static async hasSudoAccess() {
    try {
      const { stdout } = await execAsync('sudo -n true 2>&1');
      return true;
    } catch (error) {
      // Check if error is because password is required (which means user has sudo)
      // vs user doesn't have sudo at all
      const errorMsg = error.message || error.stderr || '';

      if (errorMsg.includes('password is required')) {
        return true; // User has sudo, just needs password
      }

      return false; // User doesn't have sudo access
    }
  }

  /**
   * Hash password for secure storage (optional, for caching)
   * NOTE: This is for temporary caching only, never store passwords permanently
   * @param {string} password - Password to hash
   * @returns {string} - Hashed password
   */
  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Validate password strength (basic validation)
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with strength and warnings
   */
  static validatePasswordStrength(password) {
    const result = {
      valid: true,
      strength: 'weak',
      warnings: [],
    };

    if (!password || password.length === 0) {
      result.valid = false;
      result.warnings.push('Password cannot be empty');
      return result;
    }

    if (password.length < 8) {
      result.warnings.push('Password is shorter than 8 characters');
    } else if (password.length >= 12) {
      result.strength = 'strong';
    } else {
      result.strength = 'medium';
    }

    // Check for common patterns
    if (/^[0-9]+$/.test(password)) {
      result.warnings.push('Password contains only numbers');
      result.strength = 'weak';
    }

    if (/^[a-z]+$/.test(password)) {
      result.warnings.push('Password contains only lowercase letters');
      result.strength = 'weak';
    }

    return result;
  }

  /**
   * Execute multiple commands in sequence with same password
   * @param {Array<string>} commands - Array of commands to execute
   * @param {string} password - Sudo password
   * @returns {Promise<Array>} - Array of results for each command
   */
  static async executeMultiple(commands, password) {
    const results = [];

    for (const command of commands) {
      try {
        const result = await this.executeCommand(command, password);
        results.push({
          command,
          ...result,
        });

        // Stop if a command fails
        if (!result.success) {
          break;
        }
      } catch (error) {
        results.push({
          command,
          success: false,
          error: error.message,
        });
        break;
      }
    }

    return results;
  }

  /**
   * Check if a specific command requires sudo
   * @param {string} command - Command to check
   * @returns {boolean} - True if command typically requires sudo
   */
  static requiresSudo(command) {
    const sudoCommands = [
      'apt-get',
      'apt',
      'dpkg',
      'systemctl',
      'service',
      'mount',
      'umount',
      'reboot',
      'shutdown',
      'adduser',
      'deluser',
      'usermod',
      'groupadd',
      'groupdel',
    ];

    const commandName = command.trim().split(' ')[0];
    return sudoCommands.includes(commandName);
  }
}

module.exports = PrivilegeManager;
