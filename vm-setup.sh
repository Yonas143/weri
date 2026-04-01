#!/bin/bash
set -e

echo "🔧 Setting up EthioRadio Backend on Google Cloud..."
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "✅ Node.js installed: $(node -v)"

# Install FFmpeg
echo "📦 Installing FFmpeg..."
sudo apt install -y ffmpeg

echo "✅ FFmpeg installed: $(ffmpeg -version | head -n1)"

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

echo "✅ PM2 installed"

# Clone repository
echo "📦 Cloning repository..."
cd ~
if [ -d "weri" ]; then
    echo "Repository exists, pulling latest..."
    cd weri
    git pull
else
    git clone https://github.com/Yonas143/weri.git
    cd weri
fi

# Setup backend
echo "📦 Setting up backend..."
cp backend.package.json package.json
npm install

# Create directories
mkdir -p recordings logs

# Create .env template
echo "📝 Creating .env template..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000

# IMPORTANT: Replace these with your actual values!
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS - Add your Vercel URL after frontend deployment
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
EOF

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: Edit the .env file with your actual credentials:"
echo "   nano ~/weri/.env"
echo ""
echo "Required values:"
echo "  - GEMINI_API_KEY (from Google AI Studio)"
echo "  - SUPABASE_URL (from Supabase dashboard)"
echo "  - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)"
echo ""
echo "Then start the server:"
echo "  cd ~/weri"
echo "  pm2 start ecosystem.config.cjs"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "Your backend will be available at:"
echo "  http://136.115.62.42:3000"
echo ""
