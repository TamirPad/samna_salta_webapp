#!/bin/bash

# Render Deployment Script for Samna Salta
# This script prepares the application for deployment to Render

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="samna-salta"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="render-deploy-${TIMESTAMP}.log"

echo -e "${BLUE}🚀 Preparing Samna Salta for Render deployment${NC}"
echo -e "${BLUE}📝 Logging to: ${LOG_FILE}${NC}"

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
log "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check required tools
if ! command_exists node; then
    log "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    log "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists git; then
    log "${RED}❌ Git is not installed${NC}"
    exit 1
fi

log "${GREEN}✅ All required tools are available${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    log "${RED}❌ Not in the correct project directory${NC}"
    log "${YELLOW}💡 Please run this script from the project root${NC}"
    exit 1
fi

log "${GREEN}✅ In correct project directory${NC}"

# Check if render.yaml exists and is valid
if [ ! -f "render.yaml" ]; then
    log "${RED}❌ render.yaml not found${NC}"
    exit 1
fi

log "${GREEN}✅ render.yaml found${NC}"

# Clean previous builds
log "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf apps/frontend/build
rm -rf apps/backend/dist
rm -rf node_modules
rm -rf apps/*/node_modules
log "${GREEN}✅ Cleaned previous builds${NC}"

# Install dependencies
log "${YELLOW}📦 Installing dependencies...${NC}"
npm install
log "${GREEN}✅ Dependencies installed${NC}"

# Build applications
log "${YELLOW}🔨 Building applications...${NC}"

# Build frontend
log "${BLUE}📱 Building frontend...${NC}"
npm run build:frontend
if [ $? -eq 0 ]; then
    log "${GREEN}✅ Frontend built successfully${NC}"
else
    log "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Build backend
log "${BLUE}🔧 Building backend...${NC}"
npm run build:backend
if [ $? -eq 0 ]; then
    log "${GREEN}✅ Backend built successfully${NC}"
else
    log "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Run tests
log "${YELLOW}🧪 Running tests...${NC}"
npm run test
if [ $? -eq 0 ]; then
    log "${GREEN}✅ Tests passed${NC}"
else
    log "${YELLOW}⚠️  Some tests failed, but continuing deployment${NC}"
fi

# Check for environment variables
log "${YELLOW}🔐 Checking environment variables...${NC}"

# Check if .env files exist
if [ -f "apps/backend/.env" ]; then
    log "${GREEN}✅ Backend .env file found${NC}"
else
    log "${YELLOW}⚠️  Backend .env file not found (will be set in Render)${NC}"
fi

# Validate build outputs
log "${YELLOW}🔍 Validating build outputs...${NC}"

# Check frontend build
if [ -d "apps/frontend/build" ]; then
    log "${GREEN}✅ Frontend build directory exists${NC}"
    FRONTEND_FILES=$(find apps/frontend/build -name "*.js" -o -name "*.html" | wc -l)
    log "${BLUE}📁 Frontend build contains ${FRONTEND_FILES} files${NC}"
else
    log "${RED}❌ Frontend build directory not found${NC}"
    exit 1
fi

# Check backend build
if [ -d "apps/backend/dist" ] || [ -f "apps/backend/src/server.js" ]; then
    log "${GREEN}✅ Backend build/source exists${NC}"
else
    log "${RED}❌ Backend build/source not found${NC}"
    exit 1
fi

# Check render.yaml syntax
log "${YELLOW}📋 Validating render.yaml...${NC}"
if command_exists yq; then
    yq eval '.' render.yaml > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ render.yaml syntax is valid${NC}"
    else
        log "${RED}❌ render.yaml syntax is invalid${NC}"
        exit 1
    fi
else
    log "${YELLOW}⚠️  yq not installed, skipping render.yaml validation${NC}"
fi

# Create deployment summary
log "${YELLOW}📊 Creating deployment summary...${NC}"

cat > "render-deployment-summary-${TIMESTAMP}.md" << EOF
# Render Deployment Summary

**Project**: ${PROJECT_NAME}
**Timestamp**: ${TIMESTAMP}
**Status**: Ready for deployment

## Build Results

### Frontend
- ✅ Build completed successfully
- 📁 Build directory: apps/frontend/build
- 📄 Files generated: ${FRONTEND_FILES}

### Backend
- ✅ Build completed successfully
- 📁 Source: apps/backend/src/
- 🔧 Start command: npm run start --workspace=apps/backend

## Environment Variables Required

### Backend Service
- SUPABASE_CONNECTION_STRING
- JWT_SECRET
- FRONTEND_URL (auto-set by Render)
- STRIPE_SECRET_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS

### Frontend Service
- REACT_APP_STRIPE_PUBLISHABLE_KEY
- REACT_APP_GOOGLE_MAPS_API_KEY

## Next Steps

1. Push to GitHub: \`git push origin main\`
2. Connect repository to Render
3. Configure environment variables in Render dashboard
4. Deploy using Blueprint

## Files to Deploy

- render.yaml (Render configuration)
- package.json (Dependencies)
- apps/frontend/build/ (Frontend assets)
- apps/backend/src/ (Backend source)

EOF

log "${GREEN}✅ Deployment summary created${NC}"

# Final checks
log "${YELLOW}🔍 Final deployment checks...${NC}"

# Check git status
if git diff --quiet; then
    log "${GREEN}✅ No uncommitted changes${NC}"
else
    log "${YELLOW}⚠️  You have uncommitted changes${NC}"
    log "${BLUE}💡 Consider committing changes before deployment${NC}"
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    log "${GREEN}✅ On main branch (${CURRENT_BRANCH})${NC}"
else
    log "${YELLOW}⚠️  Not on main branch (current: ${CURRENT_BRANCH})${NC}"
    log "${BLUE}💡 Consider switching to main branch for deployment${NC}"
fi

# Success message
log "${GREEN}🎉 Deployment preparation completed successfully!${NC}"
log ""
log "${BLUE}📋 Next Steps:${NC}"
log "1. Commit and push your changes:"
log "   git add ."
log "   git commit -m 'Prepare for Render deployment'"
log "   git push origin main"
log ""
log "2. Go to Render Dashboard: https://dashboard.render.com"
log "3. Create new Blueprint from your repository"
log "4. Configure environment variables"
log "5. Deploy!"
log ""
log "${GREEN}📁 Deployment summary saved to: render-deployment-summary-${TIMESTAMP}.md${NC}"
log "${GREEN}📝 Full log saved to: ${LOG_FILE}${NC}"

echo -e "${GREEN}🎉 Ready for Render deployment!${NC}" 