#!/bin/bash
# Frontend Deployment Script for Vercel

echo "🚀 EthioRadio Frontend Deployment Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found${NC}"
    echo -e "${YELLOW}Creating template...${NC}"
    cat > .env.production << 'EOF'
# Frontend Environment Variables (Vercel)
VITE_API_URL=http://YOUR_BACKEND_IP:3000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
EOF
    echo -e "${YELLOW}⚠️  Please edit .env.production with your backend URL${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking configuration...${NC}"
source .env.production

if [[ $VITE_API_URL == *"YOUR_BACKEND_IP"* ]]; then
    echo -e "${RED}❌ Please update VITE_API_URL in .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration looks good${NC}"
echo ""

echo -e "${YELLOW}📦 Building frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
echo ""
echo "You'll need to:"
echo "1. Login to Vercel (if not already)"
echo "2. Set environment variables in Vercel dashboard:"
echo "   - VITE_API_URL = $VITE_API_URL"
echo "   - VITE_GEMINI_API_KEY = your_key"
echo ""
read -p "Press Enter to continue with deployment..."

vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Don't forget to:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Update ALLOWED_ORIGINS in backend .env with your Vercel URL"
echo "3. Restart backend: pm2 restart ethioradio-backend"
echo ""
