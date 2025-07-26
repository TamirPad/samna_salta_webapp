#!/bin/bash

# Render Deployment Script for Samna Salta
# This script helps prepare and deploy the application to Render

set -e

echo "🚀 Samna Salta Render Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    cp env.example .env
    print_warning "Please update .env with your actual values"
fi

# Install dependencies
print_status "Installing dependencies..."
npm run install:all

# Run tests
print_status "Running tests..."
npm run test

# Build applications
print_status "Building applications..."
npm run build:frontend
npm run build:backend

print_success "Build completed successfully!"

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo "✅ Dependencies installed"
echo "✅ Tests passed"
echo "✅ Frontend built"
echo "✅ Backend built"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will use the render.yaml file"
echo ""
echo "3. Configure Environment Variables:"
echo "   - Set all required environment variables in Render dashboard"
echo "   - See RENDER_DEPLOYMENT_GUIDE.md for details"
echo ""
echo "4. Monitor Deployment:"
echo "   - Check build logs in Render dashboard"
echo "   - Verify all services are healthy"
echo "   - Test the application functionality"
echo ""

# Check if render CLI is installed
if command -v render &> /dev/null; then
    print_status "Render CLI detected. You can also deploy using:"
    echo "   render blueprint apply"
else
    print_warning "Render CLI not installed. Install with:"
    echo "   npm install -g @render/cli"
fi

print_success "Deployment preparation completed!"
print_status "Follow the steps above to deploy to Render." 