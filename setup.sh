#!/bin/bash

# Samna Salta Webapp Setup Script
echo "🚀 Setting up Samna Salta Webapp..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p public/images
mkdir -p src/assets

# Set up Git hooks (if Git is available)
if command -v git &> /dev/null; then
    echo "🔧 Setting up Git hooks..."
    npm run prepare 2>/dev/null || echo "⚠️  Git hooks setup skipped (not critical)"
fi

# Build the project to check for errors
echo "🔨 Building project to check for errors..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Run 'npm start' to start development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🚀 Available commands:"
echo "  npm start     - Start development server"
echo "  npm run build - Build for production"
echo "  npm test      - Run tests"
echo "  npm run lint  - Run linting"
echo ""
echo "📚 For deployment options, see README.md" 