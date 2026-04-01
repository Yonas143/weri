#!/bin/bash
# Backend Deployment Script for Google Cloud VM

echo "🚀 EthioRadio Backend Deployment Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    echo -e "${RED}❌ This script requires Ubuntu/Debian${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}📦 Step 2: Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

echo -e "${YELLOW}📦 Step 3: Installing FFmpeg...${NC}"
if ! command -v ffmpeg &> /dev/null; then
    sudo apt install -y ffmpeg
fi
echo -e "${GREEN}✅ FFmpeg installed${NC}"

echo -e "${YELLOW}📦 Step 4: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 installed${NC}"

echo -e "${YELLOW}📦 Step 5: Setting up project...${NC}"
# Copy backend package.json
if [ -f "backend.package.json" ]; then
    cp backend.package.json package.json
    echo -e "${GREEN}✅ Backend package.json copied${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Create necessary directories
mkdir -p recordings logs

echo -e "${YELLOW}🔐 Step 6: Environment setup...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Backend Environment Variables
NODE_ENV=production
PORT=3000

# Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional - for cloud backup)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# CORS - Allow your Vercel frontend
ALLOWED_ORIGINS=https://your-app.vercel.app
EOF
    echo -e "${RED}⚠️  Please edit .env file with your actual credentials${NC}"
    echo -e "${YELLOW}Run: nano .env${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Start the server: pm2 start ecosystem.config.cjs"
echo "3. Save PM2 config: pm2 save"
echo "4. Enable startup: pm2 startup (follow the command it outputs)"
echo "5. Check status: pm2 status"
echo "6. View logs: pm2 logs ethioradio-backend"
echo ""
echo "Your backend will be available at: http://$(curl -s ifconfig.me):3000"
echo ""
