# DevSetup Pro - Release Guide

## Building for Ubuntu

### Prerequisites
```bash
# On Ubuntu development machine
sudo apt-get update
sudo apt-get install -y nodejs npm
npm install -g electron-builder
```

### Build All Formats
```bash
# Build AppImage, deb, and snap
npm run make

# Output in dist/ folder:
# - DevSetup-Pro-0.1.0.AppImage
# - devsetup-pro_0.1.0_amd64.deb
# - devsetup-pro_0.1.0_amd64.snap
```

## Distribution Channels

### 1. GitHub Releases (Primary)

**Setup:**
```bash
# 1. Create GitHub repository
# 2. Add to package.json:
"repository": {
  "type": "git",
  "url": "https://github.com/your-username/devsetup-pro"
}

# 3. Build and publish
npm run make
gh release create v0.1.0 dist/*.AppImage dist/*.deb
```

**User Installation:**
```bash
# Download from releases page
wget https://github.com/your-username/devsetup-pro/releases/download/v0.1.0/DevSetup-Pro-0.1.0.AppImage
chmod +x DevSetup-Pro-0.1.0.AppImage
./DevSetup-Pro-0.1.0.AppImage
```

### 2. Ubuntu Snap Store

**Setup:**
```bash
# 1. Create snapcraft account at snapcraft.io
# 2. Login
snapcraft login

# 3. Build snap
cd snap/
snapcraft

# 4. Publish
snapcraft upload devsetup-pro_0.1.0_amd64.snap --release=stable
```

**User Installation:**
```bash
sudo snap install devsetup-pro
```

### 3. PPA (Personal Package Archive)

**Setup:**
```bash
# 1. Create Launchpad account
# 2. Create PPA
# 3. Build source package
debuild -S
# 4. Upload to PPA
dput ppa:your-name/devsetup-pro devsetup-pro_0.1.0_source.changes
```

**User Installation:**
```bash
sudo add-apt-repository ppa:your-name/devsetup-pro
sudo apt-get update
sudo apt-get install devsetup-pro
```

### 4. Standalone .deb

**Build:**
```bash
npm run make
# Output: dist/devsetup-pro_0.1.0_amd64.deb
```

**User Installation:**
```bash
# Download .deb file
sudo dpkg -i devsetup-pro_0.1.0_amd64.deb
sudo apt-get install -f  # Fix any dependencies
```

## Recommended Release Strategy

### Phase 1: MVP Release (v0.1)
1. **GitHub Releases** - Primary distribution
   - Upload AppImage (easiest for users)
   - Upload .deb (traditional users)
   - Clear installation instructions in README

2. **Testing**
   - Share with beta testers
   - Gather feedback
   - Fix critical bugs

### Phase 2: Wider Distribution (v0.2+)
1. **Snap Store** - Official Ubuntu channel
   - Submit to Snap Store
   - Automatic updates
   - Better discoverability

2. **PPA** (optional)
   - For users who prefer apt-get
   - Better integration with system updates

### Phase 3: Mature Release (v1.0)
1. All channels active
2. Website with download links
3. Auto-update functionality
4. Community support

## Installation Instructions for Users

### Easiest: AppImage
```bash
# 1. Download
wget https://github.com/your-username/devsetup-pro/releases/latest/download/DevSetup-Pro.AppImage

# 2. Make executable
chmod +x DevSetup-Pro.AppImage

# 3. Run
./DevSetup-Pro.AppImage
```

### Traditional: .deb Package
```bash
# 1. Download
wget https://github.com/your-username/devsetup-pro/releases/latest/download/devsetup-pro_amd64.deb

# 2. Install
sudo dpkg -i devsetup-pro_amd64.deb
sudo apt-get install -f

# 3. Run
devsetup-pro
```

### Official: Snap Store
```bash
# Install
sudo snap install devsetup-pro

# Run
devsetup-pro
```

## Auto-Updates

### electron-updater Setup
```bash
npm install electron-updater

# Add to main.js:
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

## Marketing & Distribution

### 1. Reddit
- r/Ubuntu
- r/linux
- r/programming
- r/webdev

### 2. Dev Communities
- Dev.to
- Hacker News
- Product Hunt

### 3. Documentation
- Installation guide
- Video tutorial
- Quick start guide

### 4. Website
- Landing page
- Download buttons for all formats
- Feature showcase
- Documentation

## File Sizes (Estimated)
- AppImage: ~80-100 MB
- .deb: ~80-100 MB
- .snap: ~90-110 MB

## System Requirements
- Ubuntu 20.04 LTS or later
- 512 MB RAM minimum (1 GB recommended)
- 200 MB disk space
- Internet connection for tool downloads
