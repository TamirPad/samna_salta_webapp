#!/bin/bash

# Production start script for Samna Salta Backend
echo "🚀 Starting Samna Salta Backend in production mode..."

# Set default values for missing environment variables
export DATABASE_URL=${DATABASE_URL:-""}
export JWT_SECRET=${JWT_SECRET:-"dev-secret-key-change-in-production"}
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-10000}
export FRONTEND_URL=${FRONTEND_URL:-"https://samna-salta-webapp.onrender.com"}
export LOG_LEVEL=${LOG_LEVEL:-"info"}

# Log configuration
echo "📊 Configuration:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "   JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "   FRONTEND_URL: $FRONTEND_URL"
echo "   LOG_LEVEL: $LOG_LEVEL"

# Check for required environment variables
if [ -z "$JWT_SECRET" ]; then
    echo "⚠️ Warning: JWT_SECRET not set, using default"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ Warning: DATABASE_URL not set, running in development mode"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server
echo "🔧 Starting Node.js server..."
node src/server.js 