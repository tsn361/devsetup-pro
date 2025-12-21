# DevSetup Pro - Ubuntu Developer Tool Installer

[![License: BSL-1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Platform: Ubuntu](https://img.shields.io/badge/Platform-Ubuntu%2020.04+-orange)](https://ubuntu.com/)

> A modern, user-friendly GUI tool for Ubuntu developers to install and manage development tools without command-line expertise.

**GitHub:** [github.com/tsn361/devsetup-pro](https://github.com/tsn361/devsetup-pro)

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

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+ (or WSL2 on Windows)
- Node.js 18+
- npm 9+

### Installation

**On Ubuntu/Linux:**
```bash
git clone https://github.com/tsn361/devsetup-pro.git
cd devsetup-pro
npm install
npm run dev
```

**On Windows (via WSL2):**
```bash
# First time setup in WSL Ubuntu
mkdir ~/projects
cd ~/projects
git clone https://github.com/tsn361/devsetup-pro.git
cd devsetup-pro
npm install

# Run the app
npm run dev
```

**Windows Quick Launch:**
Double-click `start-devsetup.bat` to launch automatically via WSL2.

---

## 📦 Features

### Tool Categories
- **Programming Languages** - Node.js, Python, Go, Rust, etc.
- **Version Control** - Git, GitHub CLI, GitKraken
- **Databases** - PostgreSQL, MySQL, MongoDB, Redis
- **Web Servers** - Nginx, Apache
- **Development Tools** - Docker, VS Code, Postman
- **CLI Tools** - curl, wget, vim, tmux, htop

### Core Features
- **Automatic Dependency Resolution** - No manual `apt-get` commands
- **Conflict Detection** - Warns before installing incompatible tools
- **Installation Profiles** - Save and export your tool selections
- **Real-Time Logs** - Watch installation progress live
- **System Validation** - Checks disk space, internet, sudo access

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + React Router
- **Backend:** Electron (main process) + Express API
- **Package Management:** Custom apt-get wrapper
- **Build:** electron-builder (AppImage, .deb, Snap)

---

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Licensing Strategy](docs/LICENSING_STRATEGY.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

## 📜 License

**Business Source License 1.1**

This project uses the [Business Source License 1.1](LICENSE), which means:

### ✅ Free for:
- Individual developers
- Students and educators
- Non-profit organizations
- Companies with < 10 employees
- Personal and open-source projects

### 💼 Commercial License Required for:
- Companies with 10+ employees
- SaaS/hosted services
- Redistribution as commercial product
- Enterprise deployments

### 🔓 Open Source Conversion
After 4 years (December 21, 2029), this code automatically becomes **Apache 2.0** licensed (fully open source).

**Commercial licensing:** business@devsetup.pro

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Contributor License Agreement (CLA)
- Code style guidelines
- Pull request process

All contributors must sign the CLA via `git commit -s` (sign-off).

---

## 🗺️ Roadmap

### Current Status: MVP (v0.1.0)
- ✅ Basic GUI with tool selection
- ✅ Automatic dependency resolution
- ✅ Real-time installation progress
- ✅ Profile save/load/export
- ✅ System checks and validation

### Upcoming Features
- 🔄 AppImage/Snap distribution
- 🔄 Advanced filtering and search
- 🔄 Post-install configuration wizards
- 🔄 Community-contributed tool definitions

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/tsn361/devsetup-pro/issues)
- **Discussions:** [GitHub Discussions](https://github.com/tsn361/devsetup-pro/discussions)
- **Commercial Support:** business@devsetup.pro

---

**Built with ❤️ for the Ubuntu developer community.**
