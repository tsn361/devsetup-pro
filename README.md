# DevSetup Pro - Ubuntu Developer Tool Installer

[![License: BSL-1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Platform: Ubuntu](https://img.shields.io/badge/Platform-Ubuntu%2020.04+-orange)](https://ubuntu.com/)
[![Platform: MacOS](https://img.shields.io/badge/Platform-MacOS-lightgrey)](https://apple.com)

> A modern, user-friendly GUI tool for Ubuntu developers to install and manage development tools without command-line expertise.
>
> **🍎 MacOS Support Coming Soon!**

**GitHub:** [github.com/tsn361/devsetup-pro](https://github.com/tsn361/devsetup-pro)

**Support:** See [SUPPORT.md](SUPPORT.md)

**Security:** See [SECURITY.md](SECURITY.md)

## Installation & Quick Start

### System Requirements
- Ubuntu 20.04+ (or WSL2 on Windows)
- That's it! No other dependencies required.

### Option 1: Install .deb Package (Recommended)
1. Go to the [Releases](https://github.com/tsn361/devsetup-pro/releases) page.
2. Download the latest `.deb` file.
3. Install it:
   *   **GUI:** Double-click the downloaded file and click "Install".
   *   **Terminal:**
       ```bash
       sudo dpkg -i devsetup-pro_*.deb
       sudo apt-get -f install
       ```
4. Run `devsetup-pro` from your terminal or application menu.

### Option 2: AppImage (Portable)
1. Download the `.AppImage` file from Releases.
2. Make it executable and run:
   ```bash
   chmod +x DevSetup-Pro-*.AppImage
   ./DevSetup-Pro-*.AppImage
   ```

### Option 3: Build from Source (Developers)
*Requires Node.js 18+ and npm 9+*

```bash
git clone https://github.com/tsn361/devsetup-pro.git
cd devsetup-pro
npm install
npm run dev
```
*(On Windows, run these commands inside a WSL2 terminal)*

---



## 🔒 Security & Trust

**DevSetup Pro uses ONLY native Ubuntu commands - no external code or binary downloads.**

- ✅ **100% Native:** Uses `apt-get`, `dpkg`, `sudo` - standard Ubuntu tools
- ✅ **No Downloads:** Doesn't download scripts or binaries from third parties
- ✅ **No Execution:** Doesn't execute remote code
- ✅ **Official Repos:** All packages come from official Ubuntu repositories
- ✅ **Transparent:** Every command is logged and shown in real-time
- ✅ **Open Source:** All code is visible and auditable (BSL 1.1)

**How it works:** This app is simply a GUI wrapper that runs the same commands you would type manually:
```bash
# What DevSetup Pro does behind the scenes:
sudo apt-get update
sudo apt-get install -y <package-name>
dpkg -l | grep <package-name>  # to check installation
```

Your system security remains intact - we just make it easier to use Ubuntu's built-in package manager.

## Vision
Simplify developer environment setup on Ubuntu by providing an intuitive graphical interface that replaces complex command-line operations.

---

## Problem Statement
Ubuntu developers face challenges:
- ❌ Need to remember/lookup apt commands
- ❌ Manual installation of multiple tools is time-consuming
- ❌ Risk of typos and installation errors
- ❌ No easy way to share dev stack configurations
- ❌ Complex dependency management
- ❌ Steep learning curve for beginners

---



## Solution Overview
**DevSetup Pro** provides:
- ✅ Clean, intuitive GUI for tool selection
- ✅ One-click installation of complete dev stacks
- ✅ Automatic dependency resolution
- ✅ Real-time installation progress and logs
- ✅ Save/export installation profiles
- ✅ Pre-installation system checks
- ✅ Post-install setup assistance

---

## Project Structure

```
devsetup-pro/
├── docs/                          # Documentation
│   ├── FEATURES.md                # Detailed features list
│   ├── ROADMAP.md                 # Development roadmap
│   ├── GETTING_STARTED.md         # Developer guide
│   └── INDEX.md                   # Documentation index
├── src/
│   ├── main/                      # Backend (Electron + Express)
│   ├── ui/                        # Frontend (React)
│   └── config/
│       └── tools.json             # Tool definitions
├── tests/
├── package.json
├── .gitignore
└── LICENSE
```

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Desktop** | Electron | Cross-platform, native feel |
| **Frontend** | React | Modern, component-based |
| **Backend** | Node.js + Express | Fast, easy async handling |
| **Package Mgmt** | apt-get wrapper | Native Ubuntu package manager |
| **Storage** | localStorage + JSON | Simple local data storage |
| **Auth** | sudo password | Handle privilege escalation |

---

## Features

### Current (v0.1.0 MVP)

- ✅ 24 development tools across 4 categories
- ✅ One-click install/uninstall
- ✅ Real-time progress tracking with logs
- ✅ System requirements check
- ✅ Save/load/export installation profiles
- ✅ Search and filter tools
- ✅ Windows WSL support
- ✅ Settings persistence

### Tool Categories

- **Web Servers:** nginx, apache2
- **Databases:** mysql, postgresql, mongodb, redis
- **Languages:** nodejs, python3, ruby, golang, php, java
- **Dev Tools:** git, docker, vim, curl, wget, build-essential, htop, tmux

---

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical design and implementation details
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute to this project

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

Business Source License 1.1 - Free for individuals and small teams (< 10 employees).
See [LICENSE](LICENSE) for full details.

After 4 years (2029), this code will become Apache 2.0 licensed (fully open source).

---

## Support & Community

- 🐛 [Report Issues](https://github.com/tsn361/devsetup-pro/issues)
- 💬 [Discussions](https://github.com/tsn361/devsetup-pro/discussions)
- ⭐ Star this repo if you find it useful!

---

---

**Created:** December 2025  
**Status:** MVP Complete (v0.1.0)  
**Maintainer:** [@tsn361](https://github.com/tsn361)
