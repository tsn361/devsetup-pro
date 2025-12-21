const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const PackageManager = require('./lib/package-manager');
const PrivilegeManager = require('./lib/privilege-manager');
const DependencyResolver = require('./lib/dependency-resolver');
const ProfileManager = require('./lib/profile-manager');

const app = express();
let server;

// Middleware
app.use(cors());
app.use(express.json());

// Load tools configuration
let toolsConfig;
const loadToolsConfig = async () => {
  try {
    const configPath = path.join(__dirname, '../config/tools.json');
    const data = await fs.readFile(configPath, 'utf8');
    toolsConfig = JSON.parse(data);
    console.log('Tools configuration loaded successfully');
  } catch (error) {
    console.error('Failed to load tools.json:', error);
    throw error;
  }
};

// ============================================================================
// API Routes
// ============================================================================

/**
 * GET /api/tools - Get all available tools
 */
app.get('/api/tools', async (req, res) => {
  try {
    if (!toolsConfig) {
      await loadToolsConfig();
    }

    // Check which tools are already installed
    const allTools = toolsConfig.categories.flatMap((cat) => cat.tools);
    const toolsWithStatus = await Promise.all(
      allTools.map(async (tool) => {
        const isInstalled = await PackageManager.isInstalled(tool.package);
        return {
          ...tool,
          installed: isInstalled,
        };
      })
    );

    // Rebuild categories with status
    const categoriesWithStatus = toolsConfig.categories.map((cat) => ({
      ...cat,
      tools: toolsWithStatus.filter((t) =>
        cat.tools.find((ct) => ct.id === t.id)
      ),
    }));

    res.json({
      success: true,
      version: toolsConfig.version,
      categories: categoriesWithStatus,
    });
  } catch (error) {
    console.error('Error getting tools:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tools/:id - Get specific tool details
 */
app.get('/api/tools/:id', async (req, res) => {
  try {
    if (!toolsConfig) {
      await loadToolsConfig();
    }

    const tool = toolsConfig.categories
      .flatMap((cat) => cat.tools)
      .find((t) => t.id === req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
    }

    const isInstalled = await PackageManager.isInstalled(tool.package);

    res.json({
      success: true,
      tool: {
        ...tool,
        installed: isInstalled,
      },
    });
  } catch (error) {
    console.error('Error getting tool:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/system/info - Get system information
 */
app.get('/api/system/info', async (req, res) => {
  try {
    const os = require('os');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    let osVersion = 'Unknown';
    try {
      const { stdout } = await execAsync('lsb_release -d');
      osVersion = stdout.replace('Description:', '').trim();
    } catch (e) {
      osVersion = `${os.type()} ${os.release()}`;
    }

    const info = {
      platform: os.platform(),
      arch: os.arch(),
      osVersion,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      hostname: os.hostname(),
    };

    res.json({
      success: true,
      info,
    });
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/system/check - Pre-installation system check
 */
app.get('/api/system/check', async (req, res) => {
  try {
    const os = require('os');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const checks = {
      platform: os.platform() === 'linux',
      apt: false,
      internet: false,
      diskSpace: false,
      sudo: false,
    };

    // Check apt availability
    try {
      await execAsync('which apt-get');
      checks.apt = true;
    } catch (e) {
      checks.apt = false;
    }

    // Check internet connectivity
    try {
      await execAsync('ping -c 1 8.8.8.8');
      checks.internet = true;
    } catch (e) {
      checks.internet = false;
    }

    // Check disk space (require at least 1GB free)
    try {
      const { stdout } = await execAsync("df / | tail -1 | awk '{print $4}'");
      const freeSpaceKB = parseInt(stdout.trim());
      checks.diskSpace = freeSpaceKB > 1048576; // 1GB in KB
      checks.freeSpaceGB = (freeSpaceKB / 1048576).toFixed(2);
    } catch (e) {
      checks.diskSpace = false;
    }

    // Check sudo availability
    try {
      await execAsync('which sudo');
      checks.sudo = true;
    } catch (e) {
      checks.sudo = false;
    }

    const allPassed = Object.values(checks).every((check) => check === true);

    res.json({
      success: true,
      allPassed,
      checks,
    });
  } catch (error) {
    console.error('Error running system check:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verify-sudo - Verify sudo password
 */
app.post('/api/verify-sudo', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    const isValid = await PrivilegeManager.verifyPassword(password);

    res.json({
      success: true,
      valid: isValid,
    });
  } catch (error) {
    console.error('Error verifying sudo password:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/install - Install selected tools
 */
app.post('/api/install', async (req, res) => {
  try {
    const { tools, password } = req.body;

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tools array is required',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    // Verify password first
    const isValidPassword = await PrivilegeManager.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid sudo password',
      });
    }

    // Load tools config
    if (!toolsConfig) {
      await loadToolsConfig();
    }

    // Get tool definitions
    const allTools = toolsConfig.categories.flatMap((cat) => cat.tools);
    const selectedTools = tools.map((toolId) =>
      allTools.find((t) => t.id === toolId)
    );

    // Check for missing tools
    const missingTools = selectedTools.filter((t) => !t);
    if (missingTools.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Some tools not found in configuration',
      });
    }

    // Resolve dependencies
    const { installOrder, conflicts } = DependencyResolver.resolve(
      selectedTools,
      allTools
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Tool conflicts detected',
        conflicts,
      });
    }

    // Start installation process (async, send updates via websocket/events)
    // For now, we'll do it synchronously and return result
    const results = [];

    for (const tool of installOrder) {
      try {
        console.log(`Installing ${tool.name}...`);

        // Send update to renderer (via main process)
        const mainProcess = require('./main');
        if (mainProcess && mainProcess.sendInstallationUpdate) {
          mainProcess.sendInstallationUpdate({
            toolId: tool.id,
            status: 'installing',
            progress: (results.length / installOrder.length) * 100,
            message: `Installing ${tool.name}...`,
          });
        }

        const result = await PackageManager.install(tool.package, password);

        // Run post-install command if exists
        if (result.success && tool.postInstall) {
          await PrivilegeManager.executeCommand(tool.postInstall, password);
        }

        results.push({
          toolId: tool.id,
          name: tool.name,
          success: result.success,
          message: result.message || 'Installed successfully',
        });

        // Send completion update
        if (mainProcess && mainProcess.sendInstallationUpdate) {
          mainProcess.sendInstallationUpdate({
            toolId: tool.id,
            status: result.success ? 'completed' : 'failed',
            progress: ((results.length + 1) / installOrder.length) * 100,
            message: result.success
              ? `${tool.name} installed successfully`
              : `Failed to install ${tool.name}`,
          });
        }
      } catch (error) {
        console.error(`Failed to install ${tool.name}:`, error);
        results.push({
          toolId: tool.id,
          name: tool.name,
          success: false,
          message: error.message,
        });
      }
    }

    const allSuccessful = results.every((r) => r.success);

    res.json({
      success: allSuccessful,
      results,
      installed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error('Error during installation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/profiles - Get all saved profiles
 */
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await ProfileManager.getAll();

    res.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/profiles - Save a new profile
 */
app.post('/api/profiles', async (req, res) => {
  try {
    const profile = req.body;

    if (!profile.name || !profile.tools) {
      return res.status(400).json({
        success: false,
        error: 'Profile name and tools are required',
      });
    }

    const savedProfile = await ProfileManager.save(profile);

    res.json({
      success: true,
      profile: savedProfile,
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/profiles/:id - Delete a profile
 */
app.delete('/api/profiles/:id', async (req, res) => {
  try {
    await ProfileManager.delete(req.params.id);

    res.json({
      success: true,
      message: 'Profile deleted',
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Server Management
// ============================================================================

/**
 * Start the Express server
 */
async function startServer(port = 3001) {
  try {
    await loadToolsConfig();

    return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`DevSetup Pro server running on port ${port}`);
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

/**
 * Stop the Express server
 */
async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Server stopped');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  startServer,
  stopServer,
  app,
};
