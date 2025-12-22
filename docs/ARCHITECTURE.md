# DevSetup Pro - Technical Architecture

## System Overview

DevSetup Pro is an Electron + React desktop application that provides a GUI wrapper around Ubuntu's apt package manager, allowing users to install multiple development tools with checkboxes and one-click installation.

**Key Feature:** Works on Windows via WSL (Windows Subsystem for Linux) by wrapping all commands with `wsl bash -c`.

## Tech Stack

- **Desktop Framework:** Electron 26+
- **Frontend:** React 18 (JavaScript, no TypeScript)
- **Backend:** Node.js + Express (port 3001)
- **Package Manager:** apt-get (Ubuntu native)
- **Storage:** localStorage (settings) + JSON files (profiles)
- **Privilege Escalation:** sudo + password input
- **WSL Support:** Automatic command wrapping for Windows compatibility

## Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│              Main Process (Electron)              │
│         - Window Management                       │
│         - IPC Communication                       │
└────────────────┬─────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────┐    ┌────────▼──────────┐
│   Renderer   │    │   Backend Server  │
│  (React UI)  │◄──►│   (Express)       │
│              │    │                   │
│ • Components │    │ • apt wrapper     │
│ • State      │    │ • Dependencies    │
│ • IPC client │    │ • Privileges      │
│ • Styling    │    │ • File system     │
└──────────────┘    └────────┬──────────┘
                             │
                    ┌────────▼────────┐
                    │  System Level   │
                    │                 │
                    │  • apt-get      │
                    │  • sudo         │
                    │  • Shell        │
                    └─────────────────┘
```

## Component Structure

### Backend (src/main/)

**Main Entry Point:** `main.js`
- Electron application initialization
- Window creation and management
- IPC event handlers
- Application lifecycle

**Express Server:** `server.js`
- REST API endpoints
- Tool management
- Installation orchestration
- File operations

**Libraries** (src/main/lib/)

1. **package-manager.js**
   - apt-get command wrapper
   - WSL command wrapping for Windows (`wsl bash -c "..."`)
   - Package installation/uninstallation
   - Installation status checking via dpkg

2. **privilege-manager.js**
   - Sudo password handling (WSL-compatible)
   - Command execution with privileges
   - Password validation (different methods for WSL vs native)

3. **dependency-resolver.js**
   - Dependency graph analysis
   - Conflict detection
   - Installation order calculation

4. **profile-manager.js**
   - Save/load profiles (JSON files in user data directory)
   - Export/import functionality
   - Profile validation

### Frontend (src/ui/)

**Main App:** `App.js`
- Route definitions
- Global state management
- Theme & styling

**Components:** with install/uninstall button
- `CategorySection` - Grouped tools with expand/collapse (4 categories: Web Servers, Databases, Languages, Dev Tools)
- `ProgressBar` - Installation progress visualization
- `LogViewer` - Real-time installation logs with export functionality
- `PasswordDialog` - Secure sudo password input
- `ProfileDialog` - Save profile with name and description input

**Pages:**
- `Dashboard` - Main tool selection page (24 tools) with search and category filter
- `Installing` - Unified progress page for both install/uninstall operations
- `Profiles` - Saved profiles management with export/import
- `Settings` - Application settings (localStorage-persisted)

**State Management:**
- React useState hooks for local state
- React Router for navigation
- IPC communication for backend interaction
- No Redux or external state librarystate
- Local component state for UI

## API Endpoints

### Endpoints
 with installation status
GET    /api/system/info        Get system information (OS, memory, CPUs)
GET    /api/system/check       Pre-install compatibility check (apt, internet, disk, sudo)
GET    /api/profiles           List saved profiles

POST   /api/install            Start installation (tools array + password)
POST   /api/verify-sudo        Verify sudo password
POST   /api/profiles           Save new profile

DELETE /api/tools/:id          Uninstall tool (requires password)
DELETE /api/profiles/:id       Delete profile
```

### Actual Tool Catalog (24 tools)

**Web Servers:** nginx, apache2
**Databases:** mysql, postgresql, mongodb, redis
**Languages:** nodejs, python3, ruby, golang, php, java (OpenJDK)
**Dev Tools:** git, docker, vim, curl, wget, build-essential, htop, tmuxETE /api/tools/:id          Uninstall tool
DELETE /api/profiles/:id       Delete profile
```

## Data Flow: Installation Process

```
User selects tools
       │
       ▼
┌─────────────────┐
│  Verify sudo    │
│  privileges     │
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ System checks    │
│ • Disk space     │
│ • Permissions    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Resolve          │
│ dependencies     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Execute apt      │
│ install commands │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Stream logs to   │
│ UI in real-time  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Show success or  │
│ failure report   │
└──────────────────┘
```

## IPC Communication

### Main Process → Renderer
```javascript
// Send updates to UI
mainWindow.webContents.send('installation-update', {
  toolId: 'nginx',
  progress: 50,
  status: 'installing',
  log: '[apt] Installing nginx-full...'
})
```

### Renderer → Main Process
```javascript
// Request installation
const result = await ipcRenderer.invoke('install-tools', {
  tools: ['nginx', 'mysql'],
  paStorage Method: File-based + localStorage

**Profiles:** Stored as JSON files in Electron's user data directory
```javascript
// Profile structure
{
  id: "unique-id",
  name: "Full Stack Dev",
  description: "Complete full-stack development setup",
  tools: ["nodejs", "postgresql", "nginx", "git"],
  created_at: "2025-12-23T10:30:00Z"
}
```

**Settings:** Stored in browser localStorage
```javascript
// Settings structure
{
  showLogsRealtime: true,
  autoScrollLogs: true,
  checkUpdatesAuto: false,
  showSystemWarnings: true
}
```

**No SQLite database** - Simplified approach using file system and localStorage.ools TEXT NOT NULL,  -- JSON array
  status TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  logs TEXT
);
```
",
  "version": "latest",
  "dependencies": [],
  "conflicts": [],
  "size": "10MB",
  "postInstall": "",
  "checkCommand": "nginx -v",
  "website": "https://nginx.org"
}
```

**Actual Configuration:** All tools defined in `src/config/tools.json` grouped by 4 categories.package": "nginx-full",
  "version": "latest",password type field)
   - Transmitted to backend only
   - Kept only in memory during installation
   - Never persisted to disk or logs

2. **Command Safety**
   - Whitelist only pre-defined tools from tools.json
   - Use child_process.exec with proper escaping
   - WSL command wrapping sanitizes input
   - All package names validated against config

3. **File Access**
   - Profiles restricted to Electron userData directory
   - Validate all imported JSON profiles
   - No arbitrary file system access

4. **Native Commands Only**
   - Uses ONLY Ubuntu native commands (apt-get, dpkg, sudo)
   - No external downloads or script execution
   - All packages from official Ubuntu repositories
   - Complete transparency - all commands logged
   - Never log to disk

2. **Command Safety**
   - Whitelist only pre-defined tools
   - Escape all shell commands
   - Use array arguments (no shell interpretation)
   - Validate all user inputs

3. **File Access**
   - Restrict to config directory
   - Use proper file permissions
   - Validate imported profiles

## Error Handling

All errors mapped to user-friendly messages:

```javascript
const errorMessages = {
  'package-not-found': 'Package not found in repositories',
  'permission-denied': 'Sudo password incorrect',
  'network-error': 'Network connection failed',
  'dependency-conflict': 'Package conflict detected',
  'insufficient-disk': 'Insufficient disk space'
}
```

## Performance Targets

- App startup: < 2 seconds
- Tool list load: < 500ms
- ProgrElectron with React dev server
# React: http://localhost:3000
# Express backend: http://localhost:3001
# Hot reload enabled
```

## WSL Support

All system commands automatically wrapped when running on Windows:

```javascript
// On Linux:
dpkg -l | grep nginx

// On Windows (auto-wrapped):
wsl bash -c "dpkg -l | grep nginx"
```

Platform detection: `os.platform() === 'win32'` triggers WSL wrapping.
## Development Setup

```bash
# Install dependencies
npm install

# Start dev environment
npm run dev

# Runs React dev server + Electron
# Hot reload enabled for fast iteration
```

## Build & Distribution

- **Target:** Ubuntu 20.04+
- **Format:** AppImage (single executable)
- **Optional:** Snap package for Ubuntu Store
- **Auto-update:** Via GitHub releases

---

For detailed feature specifications, see [FEATURES.md](FEATURES.md)
For development timeline, see [ROADMAP.md](ROADMAP.md)
