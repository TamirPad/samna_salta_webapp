#!/bin/sh

# Start backend in background
echo "Starting backend server..."
npm run start:backend &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
serve -s frontend/build -l ${PORT:-3000} &
FRONTEND_PID=$!

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 