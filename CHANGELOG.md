# Changelog

All notable changes to DevSetup Pro will be documented in this file.

## [0.2.0] - 2025-12-24

### Added
- Service management UI for web servers (Nginx/Apache) and databases (MySQL, PostgreSQL, MongoDB, Redis)
- Real-time service status monitoring with start/stop/restart controls
- Nginx/Apache configuration file management (create, edit, enable, disable, delete)
- Service control panel showing active/inactive status on installed tool cards

### Fixed
- **CRITICAL:** Password dialog input fields were completely non-functional due to React Portal issues
- **CRITICAL:** Config file operations (toggle/delete) failed to show password dialog
- Service management buttons not appearing for installed web servers and databases
- Sudo command execution in config-manager failing with special characters in passwords
- UI layout inconsistency - moved "Installed" badge to left and action buttons to right

### Changed
- Enabled DevTools by default in development mode for easier debugging
- Improved password dialog with auto-focus and proper state management
- All dialogs now use React Portals to prevent z-index and input handling issues

### Known Issues in v0.1.0
> ⚠️ **If you are using v0.1.0, please upgrade immediately to v0.2.0**
>
> Critical bugs in v0.1.0:
> - Password dialogs are completely non-functional (cannot perform any sudo operations)
> - Config file management features do not work
> - Service controls are missing from the UI

## [0.1.0] - 2025-12-23

- Initial public release of DevSetup Pro (Ubuntu/WSL focus)
- Install/uninstall tools via apt with real-time logs
- Profiles support (save/load tool selections)
- System checks (disk space/platform/internet/sudo)
- PHP module management and web server config management
- UI improvements and stability fixes
