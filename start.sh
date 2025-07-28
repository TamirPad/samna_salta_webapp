#!/bin/sh

# Set default port if not provided
export PORT=${PORT:-3000}

echo "🚀 Starting Samna Salta application on port $PORT..."

# Function to cleanup processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Try different backend startup approaches
echo "🔧 Attempting backend startup..."

# First, try the wrapper approach
echo "📦 Trying wrapper startup..."
npm run start:backend &
BACKEND_PID=$!
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Wrapper startup failed. Trying direct startup..."
    kill $BACKEND_PID 2>/dev/null
    
    npm run start:direct &
    BACKEND_PID=$!
    sleep 3
fi

# Check if backend is still running after retry
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Direct startup failed. Trying minimal server..."
    kill $BACKEND_PID 2>/dev/null
    
    npm run start:minimal &
    BACKEND_PID=$!
    sleep 3
fi

# Check if backend is still running after minimal server
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Minimal server failed. Trying fallback server..."
    kill $BACKEND_PID 2>/dev/null
    
    npm run start:fallback &
    BACKEND_PID=$!
    sleep 3
fi

# Final check
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ All backend startup attempts failed. Starting frontend only..."
    echo "⚠️ Backend features will not be available"
    
    # Start frontend even if backend fails
    serve -s frontend/build -l $PORT &
    FRONTEND_PID=$!
    wait $FRONTEND_PID
    exit 0
fi

echo "✅ Backend started successfully!"

# Start frontend server
echo "🌐 Starting frontend server on port $PORT..."
serve -s frontend/build -l $PORT &
FRONTEND_PID=$!

echo "🎉 Both servers started successfully!"
echo "📱 Frontend: http://localhost:$PORT"
echo "🔧 Backend: http://localhost:$PORT/api/test"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 