#!/bin/bash

echo "🚀 Starting Form C Review Application in Codespaces..."
echo ""

# Function to get the Codespace URL
get_codespace_url() {
    if [ -n "$CODESPACE_NAME" ]; then
        echo "https://$CODESPACE_NAME-$1.app.github.dev"
    else
        echo "http://localhost:$1"
    fi
}

# Kill any existing processes
echo "🛑 Stopping any existing services..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd /workspaces/hackathon-group-4/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
curl -s http://localhost:8000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running!"
    BACKEND_URL=$(get_codespace_url 8000)
    echo "   Backend URL: $BACKEND_URL"
else
    echo "❌ Backend failed to start. Check the logs above."
    exit 1
fi

# Start frontend
echo ""
echo "🔧 Starting frontend..."
cd /workspaces/hackathon-group-4/zen-garden

# Update API URL for Codespaces if needed
if [ -n "$CODESPACE_NAME" ]; then
    echo "📝 Detected Codespaces environment"
fi

npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait a bit for frontend to start
sleep 5

# Show URLs
echo ""
echo "============================================"
echo "🎉 Application is starting!"
echo ""
FRONTEND_URL=$(get_codespace_url 5173)
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔌 Backend API: $BACKEND_URL"
echo ""
echo "⚠️  IMPORTANT for Codespaces:"
echo "1. Make sure both ports (5173 and 8000) are set to PUBLIC"
echo "2. Go to the 'Ports' tab in VS Code"
echo "3. Right-click on each port and select 'Port Visibility' → 'Public'"
echo ""
echo "Press Ctrl+C to stop all services"
echo "============================================"
echo ""

# Keep script running
wait
