#!/bin/bash
# This script builds the .deb package in WSL.
# It may require sudo password to install Ruby and FPM.
# Note: This will reinstall node_modules for Linux. You may need to run 'npm install' again on Windows.

set -e

echo "Checking for prerequisites..."

if ! command -v ruby &> /dev/null; then
    echo "Ruby is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y ruby ruby-dev rubygems build-essential
fi

if ! command -v fpm &> /dev/null; then
    echo "fpm is not installed. Installing..."
    sudo gem install --no-document fpm
fi

echo "Installing dependencies for Linux..."
npm install

echo "Building .deb package..."
npm run make:deb

echo "Build complete! Check the 'dist' folder."
