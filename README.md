# DevSetup Pro - Ubuntu Developer Tool Installer

[![License: BSL-1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Platform: Ubuntu](https://img.shields.io/badge/Platform-Ubuntu%2020.04+-orange)](https://ubuntu.com/)

> A modern, user-friendly GUI tool for Ubuntu developers to install and manage development tools without command-line expertise.

**GitHub:** [github.com/tsn361/devsetup-pro](https://github.com/tsn361/devsetup-pro)

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
Create a professional desktop application that simplifies developer environment setup on Ubuntu by replacing manual command-line installations with an intuitive graphical interface.

**Future expansion:** macOS version as a premium/paid product

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

## Quick Start

### Prerequisites
- Ubuntu 20.04+ (or WSL2 on Windows)
- Node.js 18+
- npm 9+

### Installation & Run

**Option 1: On Ubuntu/Linux directly**
```bash
git clone https://github.com/tsn361/devsetup-pro.git
cd devsetup-pro
npm install
npm run dev
```

**Option 2: On Windows (via WSL2)**
```bash
# First time setup
wsl -d Ubuntu bash
mkdir ~/projects
cd ~/projects
git clone https://github.com/tsn361/devsetup-pro.git
cd devsetup-pro
npm install

# Daily start (or use start-devsetup.bat)
npm run dev
```

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
│   ├── ARCHITECTURE.md            # Technical architecture
│   ├── FEATURES.md                # Detailed features list
│   ├── ROADMAP.md                 # Development roadmap
│   ├── BUSINESS_PLAN.md           # Market analysis
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
| **Desktop** | Electron / Tauri | Cross-platform, native feel |
| **Frontend** | React + TypeScript | Modern, component-based |
| **Backend** | Node.js + Express | Fast, easy async handling |
| **Package Mgmt** | apt wrapper | Native Ubuntu package manager |
| **Database** | SQLite | Store profiles locally |
| **Auth** | PolicyKit / sudo password | Handle privilege escalation |

---

## Quick Start

1. **Review Documentation**
   - Start with [docs/INDEX.md](docs/INDEX.md) for a complete overview
   - Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical design
   - Read [docs/ROADMAP.md](docs/ROADMAP.md) for timeline

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

---

## Development Timeline

- **v0.1 (MVP):** Jan-Feb 2025 - Core features
- **v0.2:** Mar-Apr 2025 - Enhanced features
- **v0.3:** May-Jun 2025 - Polish
- **v1.0:** Jul 2025 - Stable release
- **macOS:** Aug 2025+ - Premium paid version

---

## Key Features (MVP)

- ✅ Tool selection UI (30+ tools)
- ✅ One-click installation
- ✅ Real-time progress tracking
- ✅ System requirements check
- ✅ Save/load installation profiles
- ✅ Installation logs
- ✅ Error handling & recovery

---

## Revenue Model

**Ubuntu:** Free (user acquisition)
**macOS:** $9.99/month (individual), $49.99/month (teams)
**Enterprise:** Custom pricing

**Year 1 Projection:** $100,000-150,000

---

## Documentation

All documentation is in the `docs/` folder:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical design
- [FEATURES.md](docs/FEATURES.md) - Feature specifications
- [ROADMAP.md](docs/ROADMAP.md) - Development timeline
- [BUSINESS_PLAN.md](docs/BUSINESS_PLAN.md) - Market & revenue
- [GETTING_STARTED.md](docs/GETTING_STARTED.md) - Dev setup
- [INDEX.md](docs/INDEX.md) - Documentation index

---

## Getting Help

1. Read the relevant documentation file
2. Check [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) for setup issues
3. Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design questions

---

## License
MIT

---

Created: December 21, 2025
Status: Planning & MVP Development
