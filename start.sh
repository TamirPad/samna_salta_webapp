#!/bin/sh

# Set default port if not provided
export PORT=${PORT:-3000}

echo "Starting Samna Salta application on port $PORT..."

# Start backend in background with proper port handling
echo "Starting backend server on port $PORT..."
npm run start:backend &
BACKEND_PID=$!

# Wait for backend to start and check if it's running
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start. Checking for port conflicts..."
    # Try to find what's using the port
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$PORT || echo "Port $PORT might be in use"
    fi
    echo "Starting backend on alternative port..."
    PORT=$((PORT + 1)) npm run start:backend &
    BACKEND_PID=$!
    sleep 3
fi

# Check if backend is still running after retry
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start even with alternative port. Starting frontend only..."
    # Start frontend even if backend fails
    serve -s frontend/build -l $PORT &
    FRONTEND_PID=$!
    wait $FRONTEND_PID
    exit 0
fi

# Start frontend server
echo "Starting frontend server on port $PORT..."
serve -s frontend/build -l $PORT &
FRONTEND_PID=$!

echo "Both servers started successfully!"

# Function to cleanup processes
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 