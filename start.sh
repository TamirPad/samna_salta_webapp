#!/bin/sh

# Set default ports
export PORT=${PORT:-3000}
export BACKEND_PORT=${BACKEND_PORT:-3001}

echo "🚀 Starting Samna Salta application..."
echo "🔧 Backend port: $BACKEND_PORT"
echo "📱 Frontend port: $PORT"

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGTERM SIGINT

# Start backend
echo "🔧 Starting backend..."
cd apps/backend && PORT=$BACKEND_PORT npm start &
BACKEND_PID=$!
sleep 5

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend started successfully!"

# Start frontend
echo "📱 Starting frontend..."
cd apps/frontend && npm start &
FRONTEND_PID=$!

echo "🎉 Both servers started successfully!"
echo "📱 Frontend: http://localhost:$PORT"
echo "🔧 Backend: http://localhost:$BACKEND_PORT"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 