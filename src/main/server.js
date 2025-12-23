const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const PackageManager = require('./lib/package-manager');
const PrivilegeManager = require('./lib/privilege-manager');
const DependencyResolver = require('./lib/dependency-resolver');
const ProfileManager = require('./lib/profile-manager');
const ConfigManager = require('./lib/config-manager');

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

    // Get distro info
    const distro = await PackageManager.getDistroInfo();

    // Check which tools are already installed
    const allTools = toolsConfig.categories.flatMap((cat) => cat.tools);
    const toolsWithStatus = await Promise.all(
      allTools.map(async (tool) => {
        let packageName = tool.package;
        if (tool.package_overrides && tool.package_overrides[distro.version]) {
          packageName = tool.package_overrides[distro.version];
        }
        const isInstalled = await PackageManager.isInstalled(packageName);
        
        let details = null;
        if (isInstalled) {
          details = await PackageManager.getToolDetails(tool.id);
        }

        return {
          ...tool,
          installed: isInstalled,
          details,
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

    // Get distro info
    const distro = await PackageManager.getDistroInfo();
    
    let packageName = tool.package;
    if (tool.package_overrides && tool.package_overrides[distro.version]) {
      packageName = tool.package_overrides[distro.version];
    }

    const isInstalled = await PackageManager.isInstalled(packageName);

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

    // Helper to wrap commands with WSL on Windows
    const wrapCommand = (cmd) => {
      if (os.platform() === 'win32') {
        return `wsl bash -c "${cmd.replace(/"/g, '\\"')}"`;
      }
      return cmd;
    };

    let osVersion = 'Unknown';
    try {
      const { stdout } = await execAsync(wrapCommand('lsb_release -d'));
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

    // Helper to wrap commands with WSL on Windows
    const wrapCommand = (cmd) => {
      if (os.platform() === 'win32') {
        return `wsl bash -c "${cmd.replace(/"/g, '\\"')}"`;
      }
      return cmd;
    };

    const checks = {
      platform: os.platform() === 'linux' || os.platform() === 'win32', // Accept Windows with WSL
      apt: false,
      internet: false,
      diskSpace: false,
      sudo: false,
    };

    // Check apt availability
    try {
      await execAsync(wrapCommand('which apt-get'));
      checks.apt = true;
    } catch (e) {
      checks.apt = false;
    }

    // Check internet connectivity
    try {
      await execAsync(wrapCommand('ping -c 1 8.8.8.8'));
      checks.internet = true;
    } catch (e) {
      checks.internet = false;
    }

    // Check disk space (require at least 1GB free)
    try {
      // Use -P to prevent line wrapping, ensuring awk gets the right column
      const { stdout } = await execAsync(wrapCommand("df -P / | tail -1 | awk '{print $4}'"));
      const freeSpaceKB = parseInt(stdout.trim());
      checks.diskSpace = freeSpaceKB > 1048576; // 1GB in KB
      checks.freeSpaceGB = (freeSpaceKB / 1048576).toFixed(2);
    } catch (e) {
      checks.diskSpace = false;
    }

    // Check sudo availability
    try {
      await execAsync(wrapCommand('which sudo'));
      checks.sudo = true;
    } catch (e) {
      checks.sudo = false;
    }

    // Get distro info
    const distro = await PackageManager.getDistroInfo();

    const allPassed = Object.values(checks).every((check) => check === true || typeof check === 'string' || typeof check === 'number');

    res.json({
      success: true,
      allPassed,
      checks,
      platform: os.platform(),
      distro: distro.name,
      distroVersion: distro.version,
      diskSpace: checks.freeSpaceGB ? `${checks.freeSpaceGB} GB free` : null,
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

    // Get distro info for package resolution
    const distro = await PackageManager.getDistroInfo();

    for (const tool of installOrder) {
      try {
        console.log(`Installing ${tool.name}...`);

        // Resolve package name based on distro version
        let packageName = tool.package;
        if (tool.package_overrides && tool.package_overrides[distro.version]) {
          packageName = tool.package_overrides[distro.version];
          console.log(`Using override package for ${distro.version}: ${packageName}`);
        }

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

        const result = await PackageManager.install(packageName, password);

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
 * DELETE /api/tools/:id - Uninstall a tool
 */
app.delete('/api/tools/:id', async (req, res) => {
  try {
    const { password } = req.body;

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

    // Find the tool
    const allTools = toolsConfig.categories.flatMap((cat) => cat.tools);
    const tool = allTools.find((t) => t.id === req.params.id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
    }

    // Get distro info
    const distro = await PackageManager.getDistroInfo();
    
    // Resolve package name
    let packageName = tool.package;
    if (tool.package_overrides && tool.package_overrides[distro.version]) {
      packageName = tool.package_overrides[distro.version];
    }

    // Check if tool is installed
    const isInstalled = await PackageManager.isInstalled(packageName);
    if (!isInstalled) {
      console.log(`Tool ${tool.name} (${packageName}) is not installed`);
      return res.status(400).json({
        success: false,
        error: 'Tool is not installed',
      });
    }

    console.log(`Starting uninstall of ${tool.name} (${packageName})...`);
    console.log(`Command: apt-get remove -y ${packageName}`);

    // Uninstall the package
    const result = await PackageManager.uninstall(packageName, password);

    if (result.success) {
      console.log(`✓ Successfully uninstalled ${tool.name}`);
      console.log(`Output: ${result.output}`);
    } else {
      console.error(`✗ Failed to uninstall ${tool.name}`);
      console.error(`Error: ${result.error}`);
    }

    res.json({
      success: result.success,
      message: result.message,
      error: result.error,
      output: result.output,
      tool: {
        id: tool.id,
        name: tool.name,
      },
    });
  } catch (error) {
    console.error('Error uninstalling tool:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tools/:id/extras - Get tool extras with status
 */
app.get('/api/tools/:id/extras', async (req, res) => {
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

    if (!tool.extras) {
      return res.json({
        success: true,
        extras: [],
      });
    }

    // Get distro info for overrides
    const distro = await PackageManager.getDistroInfo();

    const extrasWithStatus = await Promise.all(
      tool.extras.map(async (extra) => {
        // Handle package overrides for extras if needed (though usually they follow the main package versioning)
        // For PHP, it's tricky because php-xml might need to be php8.1-xml
        // We can try to infer it from the main package override or just check generic
        
        let packageName = extra.package;
        
        // Simple heuristic: if the main tool has an override like "php8.1", 
        // try to adapt the extra package "php-xml" -> "php8.1-xml"
        if (tool.package_overrides && tool.package_overrides[distro.version]) {
          const mainPackage = tool.package_overrides[distro.version];
          // If main package is like "php8.1", and extra is "php-xml"
          if (mainPackage.match(/^php\d+\.\d+$/) && extra.package.startsWith('php-')) {
            packageName = extra.package.replace('php-', `${mainPackage}-`);
          }
        }

        const isInstalled = await PackageManager.isInstalled(packageName);
        return {
          ...extra,
          resolvedPackage: packageName,
          installed: isInstalled,
        };
      })
    );

    res.json({
      success: true,
      extras: extrasWithStatus,
    });
  } catch (error) {
    console.error('Error getting tool extras:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tools/:id/manage-extras - Install/Uninstall extras
 */
app.post('/api/tools/:id/manage-extras', async (req, res) => {
  try {
    const { password, install = [], remove = [] } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    // Verify password
    const isValidPassword = await PrivilegeManager.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    const results = [];

    // Handle removals
    for (const pkg of remove) {
      try {
        const result = await PackageManager.uninstall(pkg, password);
        results.push({ package: pkg, action: 'remove', success: result.success, message: result.message });
      } catch (e) {
        results.push({ package: pkg, action: 'remove', success: false, message: e.message });
      }
    }

    // Handle installations
    for (const pkg of install) {
      try {
        const result = await PackageManager.install(pkg, password);
        results.push({ package: pkg, action: 'install', success: result.success, message: result.message });
      } catch (e) {
        results.push({ package: pkg, action: 'install', success: false, message: e.message });
      }
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error managing extras:', error);
    res.status(500).json({ success: false, error: error.message });
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
 * GET /api/tools/:id/configs - List configs
 */
app.get('/api/tools/:id/configs', async (req, res) => {
  try {
    if (!toolsConfig) await loadToolsConfig();
    
    const tool = toolsConfig.categories
      .flatMap(cat => cat.tools)
      .find(t => t.id === req.params.id);

    if (!tool || !tool.configManagement) {
      return res.status(404).json({ success: false, error: 'Config management not supported' });
    }

    const configs = await ConfigManager.listConfigs(tool.configManagement);
    res.json({ success: true, configs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/tools/:id/configs/:name - Get config content
 */
app.get('/api/tools/:id/configs/:name', async (req, res) => {
  try {
    if (!toolsConfig) await loadToolsConfig();
    
    const tool = toolsConfig.categories
      .flatMap(cat => cat.tools)
      .find(t => t.id === req.params.id);

    if (!tool || !tool.configManagement) {
      return res.status(404).json({ success: false, error: 'Config management not supported' });
    }

    const content = await ConfigManager.getConfigContent(tool.configManagement, req.params.name);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tools/:id/configs - Save/Create config
 */
app.post('/api/tools/:id/configs', async (req, res) => {
  try {
    const { name, content, password } = req.body;
    if (!toolsConfig) await loadToolsConfig();
    
    const tool = toolsConfig.categories
      .flatMap(cat => cat.tools)
      .find(t => t.id === req.params.id);

    if (!tool || !tool.configManagement) {
      return res.status(404).json({ success: false, error: 'Config management not supported' });
    }

    await ConfigManager.saveConfig(tool.configManagement, name, content, password);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tools/:id/configs/:name/toggle - Enable/Disable config
 */
app.post('/api/tools/:id/configs/:name/toggle', async (req, res) => {
  try {
    const { enable, password } = req.body;
    if (!toolsConfig) await loadToolsConfig();
    
    const tool = toolsConfig.categories
      .flatMap(cat => cat.tools)
      .find(t => t.id === req.params.id);

    if (!tool || !tool.configManagement) {
      return res.status(404).json({ success: false, error: 'Config management not supported' });
    }

    await ConfigManager.toggleConfig(tool.configManagement, req.params.name, enable, password);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/tools/:id/configs/:name - Delete config
 */
app.delete('/api/tools/:id/configs/:name', async (req, res) => {
  try {
    const { password } = req.body;
    if (!toolsConfig) await loadToolsConfig();
    
    const tool = toolsConfig.categories
      .flatMap(cat => cat.tools)
      .find(t => t.id === req.params.id);

    if (!tool || !tool.configManagement) {
      return res.status(404).json({ success: false, error: 'Config management not supported' });
    }

    await ConfigManager.deleteConfig(tool.configManagement, req.params.name, password);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
