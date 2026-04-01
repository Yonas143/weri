#!/bin/bash
# Fix Node.js version on Google Cloud VM

echo "🔧 Fixing Node.js version..."
echo ""

# Check current version
echo "Current Node.js version:"
node -v
echo ""

# Remove old Node.js
echo "Removing old Node.js..."
sudo apt remove -y nodejs
sudo apt autoremove -y

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
echo ""
echo "✅ New Node.js version:"
node -v
npm -v

echo ""
echo "Now restart your server:"
echo "  cd ~/weri"
echo "  pm2 restart ethioradio-backend"
echo "  pm2 logs ethioradio-backend"
