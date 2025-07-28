#!/bin/sh
export PORT=${PORT:-3000}
export BACKEND_PORT=${BACKEND_PORT:-3001}
echo "🚀 Starting Samna Salta application on port $PORT..."
echo "🔧 Backend will run on port $BACKEND_PORT..."

cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGTERM SIGINT

echo "🔧 Attempting backend startup..."
echo "📦 Trying wrapper startup..."
BACKEND_PORT=$BACKEND_PORT npm run start:backend &
BACKEND_PID=$!
sleep 3

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Wrapper startup failed. Trying direct startup..."
    kill $BACKEND_PID 2>/dev/null
    BACKEND_PORT=$BACKEND_PORT npm run start:direct &
    BACKEND_PID=$!
    sleep 3
fi

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Direct startup failed. Trying minimal server..."
    kill $BACKEND_PID 2>/dev/null
    BACKEND_PORT=$BACKEND_PORT npm run start:minimal &
    BACKEND_PID=$!
    sleep 3
fi

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Minimal server failed. Trying fallback server..."
    kill $BACKEND_PID 2>/dev/null
    BACKEND_PORT=$BACKEND_PORT npm run start:fallback &
    BACKEND_PID=$!
    sleep 3
fi

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ All backend startup attempts failed. Starting frontend only..."
    echo "⚠️ Backend features will not be available"
    serve -s frontend/build -l $PORT &
    FRONTEND_PID=$!
    wait $FRONTEND_PID
    exit 0
fi

echo "✅ Backend started successfully!"
echo "🌐 Starting frontend server on port $PORT..."
serve -s frontend/build -l $PORT &
FRONTEND_PID=$!

echo "🎉 Both servers started successfully!"
echo "📱 Frontend: http://localhost:$PORT"
echo "🔧 Backend: http://localhost:$BACKEND_PORT/api/test"

wait $BACKEND_PID $FRONTEND_PID 