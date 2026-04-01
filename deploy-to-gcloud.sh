#!/bin/bash
# Google Cloud Deployment Script for EthioRadio Backend

set -e  # Exit on error

echo "🚀 EthioRadio Backend - Google Cloud Deployment"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
INSTANCE_NAME="ethioradio-backend"
ZONE="us-central1-a"
MACHINE_TYPE="e2-small"
REPO_URL="https://github.com/Yonas143/weri.git"

# Step 1: Check if gcloud is installed
echo -e "${BLUE}Step 1: Checking gcloud CLI...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo -e "${GREEN}✅ gcloud CLI found${NC}"
echo ""

# Step 2: Get project ID
echo -e "${BLUE}Step 2: Setting up Google Cloud project...${NC}"
if [ -z "$PROJECT_ID" ]; then
    echo "Available projects:"
    gcloud projects list
    echo ""
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
fi

gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ Project set to: $PROJECT_ID${NC}"
echo ""

# Step 3: Enable required APIs
echo -e "${BLUE}Step 3: Enabling required APIs...${NC}"
gcloud services enable compute.googleapis.com
gcloud services enable storage-api.googleapis.com
echo -e "${GREEN}✅ APIs enabled${NC}"
echo ""

# Step 4: Create firewall rule
echo -e "${BLUE}Step 4: Creating firewall rule...${NC}"
if gcloud compute firewall-rules describe allow-ethioradio &> /dev/null; then
    echo -e "${YELLOW}Firewall rule already exists${NC}"
else
    gcloud compute firewall-rules create allow-ethioradio \
        --allow=tcp:3000 \
        --target-tags=http-server \
        --description="Allow port 3000 for EthioRadio backend"
    echo -e "${GREEN}✅ Firewall rule created${NC}"
fi
echo ""

# Step 5: Create VM instance
echo -e "${BLUE}Step 5: Creating VM instance...${NC}"
if gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE &> /dev/null; then
    echo -e "${YELLOW}Instance already exists${NC}"
    read -p "Do you want to delete and recreate it? (y/N): " RECREATE
    if [ "$RECREATE" = "y" ] || [ "$RECREATE" = "Y" ]; then
        echo "Deleting existing instance..."
        gcloud compute instances delete $INSTANCE_NAME --zone=$ZONE --quiet
        echo "Creating new instance..."
        gcloud compute instances create $INSTANCE_NAME \
            --zone=$ZONE \
            --machine-type=$MACHINE_TYPE \
            --image-family=ubuntu-2204-lts \
            --image-project=ubuntu-os-cloud \
            --boot-disk-size=30GB \
            --tags=http-server,https-server
        echo -e "${GREEN}✅ New instance created${NC}"
    fi
else
    gcloud compute instances create $INSTANCE_NAME \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --image-family=ubuntu-2204-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=30GB \
        --tags=http-server,https-server
    echo -e "${GREEN}✅ Instance created${NC}"
fi
echo ""

# Step 6: Wait for instance to be ready
echo -e "${BLUE}Step 6: Waiting for instance to be ready...${NC}"
sleep 10
echo -e "${GREEN}✅ Instance ready${NC}"
echo ""

# Step 7: Get instance IP
echo -e "${BLUE}Step 7: Getting instance IP address...${NC}"
INSTANCE_IP=$(gcloud compute instances describe $INSTANCE_NAME \
    --zone=$ZONE \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
echo -e "${GREEN}✅ Instance IP: $INSTANCE_IP${NC}"
echo ""

# Step 8: Create setup script
echo -e "${BLUE}Step 8: Creating setup script...${NC}"
cat > /tmp/setup-backend.sh << 'SETUP_SCRIPT'
#!/bin/bash
set -e

echo "🔧 Setting up EthioRadio Backend..."

# Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
echo "Installing FFmpeg..."
sudo apt install -y ffmpeg

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Clone repository
echo "Cloning repository..."
cd ~
if [ -d "weri" ]; then
    echo "Repository already exists, pulling latest..."
    cd weri
    git pull
else
    git clone REPO_URL_PLACEHOLDER weri
    cd weri
fi

# Setup backend
echo "Setting up backend..."
cp backend.package.json package.json
npm install

# Create directories
mkdir -p recordings logs

# Create .env file
echo "Creating .env file..."
cat > .env << 'ENV_FILE'
NODE_ENV=production
PORT=3000

# IMPORTANT: Replace these with your actual values
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS - Add your Vercel URL after deployment
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
ENV_FILE

echo ""
echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT: Edit the .env file with your actual credentials:"
echo "   nano ~/weri/.env"
echo ""
echo "Then start the server:"
echo "   cd ~/weri"
echo "   pm2 start ecosystem.config.cjs"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
SETUP_SCRIPT

# Replace placeholder with actual repo URL
sed -i "s|REPO_URL_PLACEHOLDER|$REPO_URL|g" /tmp/setup-backend.sh

echo -e "${GREEN}✅ Setup script created${NC}"
echo ""

# Step 9: Copy and run setup script
echo -e "${BLUE}Step 9: Copying setup script to VM...${NC}"
gcloud compute scp /tmp/setup-backend.sh $INSTANCE_NAME:~/setup-backend.sh --zone=$ZONE
echo -e "${GREEN}✅ Script copied${NC}"
echo ""

echo -e "${BLUE}Step 10: Running setup script on VM...${NC}"
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command="chmod +x ~/setup-backend.sh && ~/setup-backend.sh"
echo ""

# Final instructions
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. SSH into your VM:"
echo -e "   ${BLUE}gcloud compute ssh $INSTANCE_NAME --zone=$ZONE${NC}"
echo ""
echo "2. Edit the .env file with your credentials:"
echo -e "   ${BLUE}nano ~/weri/.env${NC}"
echo ""
echo "3. Start the backend server:"
echo -e "   ${BLUE}cd ~/weri${NC}"
echo -e "   ${BLUE}pm2 start ecosystem.config.cjs${NC}"
echo -e "   ${BLUE}pm2 save${NC}"
echo -e "   ${BLUE}pm2 startup${NC}"
echo "   (Follow the command it outputs)"
echo ""
echo "4. Check server status:"
echo -e "   ${BLUE}pm2 status${NC}"
echo -e "   ${BLUE}pm2 logs ethioradio-backend${NC}"
echo ""
echo "5. Your backend will be available at:"
echo -e "   ${GREEN}http://$INSTANCE_IP:3000${NC}"
echo ""
echo "6. Test the API:"
echo -e "   ${BLUE}curl http://$INSTANCE_IP:3000/api/stations${NC}"
echo ""
echo "=========================================="
echo ""
echo "📚 Documentation:"
echo "   - Full guide: DEPLOYMENT.md"
echo "   - Quick start: QUICKSTART.md"
echo "   - Auth setup: SUPABASE-AUTH-SETUP.md"
echo ""
echo "🔐 Don't forget to:"
echo "   - Add your Gemini API key to .env"
echo "   - Add your Supabase credentials to .env"
echo "   - Update ALLOWED_ORIGINS with your Vercel URL"
echo ""
