const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

/**
 * ProfileManager - Handles saving, loading, and managing installation profiles
 */
class ProfileManager {
  /**
   * Get the profiles directory path
   * @private
   * @returns {string} - Path to profiles directory
   */
  static getProfilesDir() {
    const homeDir = os.homedir();
    return path.join(homeDir, '.config', 'devsetup-pro', 'profiles');
  }

  /**
   * Ensure profiles directory exists
   * @private
   */
  static async ensureProfilesDir() {
    const profilesDir = this.getProfilesDir();
    try {
      await fs.access(profilesDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(profilesDir, { recursive: true });
    }
  }

  /**
   * Get all saved profiles
   * @returns {Promise<Array>} - Array of profile objects
   */
  static async getAll() {
    try {
      await this.ensureProfilesDir();
      const profilesDir = this.getProfilesDir();

      const files = await fs.readdir(profilesDir);
      const profiles = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(profilesDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            const profile = JSON.parse(content);
            profiles.push(profile);
          } catch (error) {
            console.error(`Error reading profile ${file}:`, error);
          }
        }
      }

      // Sort by creation date (newest first)
      profiles.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      return profiles;
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  /**
   * Get a specific profile by ID
   * @param {string} id - Profile ID
   * @returns {Promise<Object|null>} - Profile object or null if not found
   */
  static async getById(id) {
    try {
      await this.ensureProfilesDir();
      const profilesDir = this.getProfilesDir();
      const filePath = path.join(profilesDir, `${id}.json`);

      const content = await fs.readFile(filePath, 'utf8');
      const profile = JSON.parse(content);

      return profile;
    } catch (error) {
      console.error(`Error getting profile ${id}:`, error);
      return null;
    }
  }

  /**
   * Save a new profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} - Saved profile object
   */
  static async save(profileData) {
    try {
      await this.ensureProfilesDir();

      // Generate ID if not provided
      const id = profileData.id || uuidv4();

      const profile = {
        id,
        name: profileData.name,
        description: profileData.description || '',
        tools: profileData.tools || [],
        createdAt: profileData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
      };

      // Validate profile
      const validation = this.validateProfile(profile);
      if (!validation.valid) {
        throw new Error(`Invalid profile: ${validation.errors.join(', ')}`);
      }

      // Save to file
      const profilesDir = this.getProfilesDir();
      const filePath = path.join(profilesDir, `${id}.json`);

      await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');

      console.log(`Profile saved: ${profile.name} (${id})`);

      return profile;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Update an existing profile
   * @param {string} id - Profile ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} - Updated profile object
   */
  static async update(id, updates) {
    try {
      const existing = await this.getById(id);

      if (!existing) {
        throw new Error(`Profile not found: ${id}`);
      }

      const updated = {
        ...existing,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      return await this.save(updated);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete a profile
   * @param {string} id - Profile ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  static async delete(id) {
    try {
      const profilesDir = this.getProfilesDir();
      const filePath = path.join(profilesDir, `${id}.json`);

      await fs.unlink(filePath);
      console.log(`Profile deleted: ${id}`);

      return true;
    } catch (error) {
      console.error(`Error deleting profile ${id}:`, error);
      throw error;
    }
  }

  /**
   * Export a profile to JSON string
   * @param {string} id - Profile ID
   * @returns {Promise<string>} - JSON string of the profile
   */
  static async exportProfile(id) {
    try {
      const profile = await this.getById(id);

      if (!profile) {
        throw new Error(`Profile not found: ${id}`);
      }

      return JSON.stringify(profile, null, 2);
    } catch (error) {
      console.error('Error exporting profile:', error);
      throw error;
    }
  }

  /**
   * Import a profile from JSON string
   * @param {string} jsonString - JSON string of the profile
   * @returns {Promise<Object>} - Imported profile object
   */
  static async importProfile(jsonString) {
    try {
      const profile = JSON.parse(jsonString);

      // Generate new ID for imported profile
      const newProfile = {
        ...profile,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await this.save(newProfile);
    } catch (error) {
      console.error('Error importing profile:', error);
      throw error;
    }
  }

  /**
   * Export profile to file
   * @param {string} id - Profile ID
   * @param {string} filePath - Destination file path
   * @returns {Promise<boolean>} - True if exported successfully
   */
  static async exportToFile(id, filePath) {
    try {
      const jsonString = await this.exportProfile(id);
      await fs.writeFile(filePath, jsonString, 'utf8');

      console.log(`Profile exported to: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error exporting profile to file:', error);
      throw error;
    }
  }

  /**
   * Import profile from file
   * @param {string} filePath - Source file path
   * @returns {Promise<Object>} - Imported profile object
   */
  static async importFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return await this.importProfile(content);
    } catch (error) {
      console.error('Error importing profile from file:', error);
      throw error;
    }
  }

  /**
   * Validate profile data
   * @private
   * @param {Object} profile - Profile object to validate
   * @returns {Object} - Validation result
   */
  static validateProfile(profile) {
    const result = {
      valid: true,
      errors: [],
    };

    if (!profile.name || typeof profile.name !== 'string') {
      result.valid = false;
      result.errors.push('Profile name is required and must be a string');
    }

    if (!profile.tools || !Array.isArray(profile.tools)) {
      result.valid = false;
      result.errors.push('Profile tools must be an array');
    }

    if (profile.tools && profile.tools.length === 0) {
      result.valid = false;
      result.errors.push('Profile must contain at least one tool');
    }

    if (profile.name && profile.name.length > 100) {
      result.valid = false;
      result.errors.push('Profile name must be 100 characters or less');
    }

    return result;
  }

  /**
   * Search profiles by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching profiles
   */
  static async search(searchTerm) {
    try {
      const allProfiles = await this.getAll();

      if (!searchTerm) {
        return allProfiles;
      }

      const lowerSearch = searchTerm.toLowerCase();

      return allProfiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(lowerSearch) ||
          (profile.description &&
            profile.description.toLowerCase().includes(lowerSearch))
      );
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

  /**
   * Duplicate a profile
   * @param {string} id - Profile ID to duplicate
   * @param {string} newName - Name for the duplicated profile
   * @returns {Promise<Object>} - Duplicated profile object
   */
  static async duplicate(id, newName) {
    try {
      const original = await this.getById(id);

      if (!original) {
        throw new Error(`Profile not found: ${id}`);
      }

      const duplicate = {
        ...original,
        id: uuidv4(),
        name: newName || `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await this.save(duplicate);
    } catch (error) {
      console.error('Error duplicating profile:', error);
      throw error;
    }
  }

  /**
   * Get profile statistics
   * @returns {Promise<Object>} - Statistics object
   */
  static async getStatistics() {
    try {
      const profiles = await this.getAll();

      const stats = {
        totalProfiles: profiles.length,
        totalTools: 0,
        mostUsedTools: {},
        averageToolsPerProfile: 0,
      };

      for (const profile of profiles) {
        stats.totalTools += profile.tools.length;

        // Count tool usage
        for (const toolId of profile.tools) {
          stats.mostUsedTools[toolId] =
            (stats.mostUsedTools[toolId] || 0) + 1;
        }
      }

      if (profiles.length > 0) {
        stats.averageToolsPerProfile = (
          stats.totalTools / profiles.length
        ).toFixed(1);
      }

      // Sort most used tools
      stats.mostUsedTools = Object.entries(stats.mostUsedTools)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalProfiles: 0,
        totalTools: 0,
        mostUsedTools: {},
        averageToolsPerProfile: 0,
      };
    }
  }

  /**
   * Generate a bash installation script for a profile
   * @param {Object} profile - The profile object
   * @param {Object} toolsConfig - The full tools configuration
   * @returns {string} - The generated bash script
   */
  static generateInstallScript(profile, toolsConfig) {
    const tools = [];
    
    // Flatten tools config to find packages by ID
    const allTools = toolsConfig.categories.flatMap(cat => cat.tools);
    
    // Find packages for profile tools
    for (const toolId of profile.tools) {
      const tool = allTools.find(t => t.id === toolId);
      if (tool) {
        tools.push(tool);
      }
    }

    const packageNames = tools.map(t => t.package).join(' ');
    const toolNames = tools.map(t => t.name).join(', ');

    return `#!/bin/bash
# DevSetup Pro - Auto-generated Installation Script
# Profile: ${profile.name}
# Description: ${profile.description || 'No description'}
# Generated on: ${new Date().toISOString()}

set -e

echo "=========================================="
echo "  DevSetup Pro - Installer"
echo "  Profile: ${profile.name}"
echo "=========================================="

# Check for sudo
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo)"
  exit 1
fi

echo "Updating package lists..."
apt-get update

echo "Installing tools: ${toolNames}"
echo "Packages: ${packageNames}"

# Install packages
DEBIAN_FRONTEND=noninteractive apt-get install -y ${packageNames}

echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
`;
  }
}

module.exports = ProfileManager;
