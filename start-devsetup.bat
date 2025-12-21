@echo off
REM DevSetup Pro - Quick Start Launcher
REM Runs the app in WSL2 Ubuntu with full backend functionality

echo Starting DevSetup Pro...
echo.

REM Launch in WSL Ubuntu
wsl -d Ubuntu -e bash -lc "cd ~/projects/devsetup-pro && npm run dev"

pause
