#!/bin/bash

# Test Docker Build Script for Samna Salta Webapp

echo "🐳 Testing Docker build..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -f Dockerfile.prod -t samna-salta-webapp:test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Test running the container
    echo "🚀 Testing container..."
    docker run -d --name samna-salta-test -p 8080:80 samna-salta-webapp:test
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully!"
        echo "🌐 App should be available at: http://localhost:8080"
        echo ""
        echo "To stop the container:"
        echo "docker stop samna-salta-test"
        echo "docker rm samna-salta-test"
    else
        echo "❌ Failed to start container"
    fi
else
    echo "❌ Docker build failed!"
    exit 1
fi 