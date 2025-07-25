#!/bin/bash

# Render Deployment Script for Samna Salta Webapp

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run linting
echo "🔍 Running linting checks..."
npm run lint

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files created in ./build directory"
    
    # List build contents
    echo "📋 Build contents:"
    ls -la build/
    
    echo "🎉 Deployment ready! Your app can now be deployed to Render."
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi 