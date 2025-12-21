# DevSetup Pro - Technical Architecture

## System Overview

DevSetup Pro is an Electron + React desktop application that provides a GUI wrapper around Ubuntu's apt package manager, allowing users to install multiple development tools with checkboxes and one-click installation.

## Tech Stack

- **Desktop Framework:** Electron 26+
- **Frontend:** React 18 + TypeScript
- **Backend:** Node.js + Express
- **Package Manager:** apt (Ubuntu native)
- **Database:** SQLite (local storage)
- **Privilege Escalation:** sudo + password input

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
   - Package installation/uninstallation
   - Dependency checking

2. **privilege-manager.js**
   - Sudo password handling
   - Command execution with privileges
   - Password validation

3. **dependency-resolver.js**
   - Dependency graph analysis
   - Conflict detection
   - Installation order calculation

4. **profile-manager.js**
   - Save/load profiles
   - Export/import functionality
   - Profile validation

### Frontend (src/ui/)

**Main App:** `App.js`
- Route definitions
- Global state management
- Theme & styling

**Components:**
- `ToolCard` - Individual tool selection
- `CategorySection` - Grouped tools with expand/collapse
- `ProgressBar` - Installation progress visualization
- `LogViewer` - Real-time installation logs
- `PasswordDialog` - Secure sudo password input
- `ProfileManager` - Save/load profiles

**Pages:**
- `Dashboard` - Main tool selection page
- `Installing` - Progress page during installation
- `Profiles` - Saved profiles management
- `Settings` - Application settings

**State Management:**
- Redux or Zustand for global state
- Local component state for UI

## API Endpoints

### Endpoints

```
GET    /api/tools              Get all available tools
GET    /api/tools/:id          Get specific tool details
GET    /api/system/info        Get system information
GET    /api/system/check       Pre-install compatibility check
GET    /api/profiles           List saved profiles

POST   /api/install            Start installation
POST   /api/verify-sudo        Verify sudo password
POST   /api/profiles           Save new profile

DELETE /api/tools/:id          Uninstall tool
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
  password: hashedPassword
})
```

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tools TEXT NOT NULL,  -- JSON array
  created_at DATETIME,
  updated_at DATETIME
);
```

### Installation History
```sql
CREATE TABLE installations (
  id TEXT PRIMARY KEY,
  tools TEXT NOT NULL,  -- JSON array
  status TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  logs TEXT
);
```

## Tool Definition Format

```json
{
  "id": "nginx",
  "name": "Nginx",
  "description": "High-performance web server",
  "package": "nginx-full",
  "version": "latest",
  "dependencies": [],
  "conflicts": ["apache2"],
  "postInstall": "sudo systemctl enable nginx",
  "checkCommand": "nginx -v",
  "website": "https://nginx.org"
}
```

## Security Considerations

1. **Sudo Password Handling**
   - Accept via secure input (no echo)
   - Hash before transmission
   - Keep only in memory
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
- Progress updates: < 500ms
- Support 50+ tools without lag

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
