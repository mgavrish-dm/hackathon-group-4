#!/bin/bash

# Script to start both backend and frontend in Codespaces

echo "🚀 Starting Form C Review Application in Codespaces..."
echo "=================================================="

# Check if running in Codespaces
if [ -z "$CODESPACES" ]; then
    echo "⚠️  Not running in GitHub Codespaces environment"
    echo "This script is designed for Codespaces. Use start-backend.sh and start-frontend.sh locally."
    exit 1
fi

# Check for API key
if [ ! -f "backend/.env" ] || ! grep -q "GEMINI_API_KEY" backend/.env; then
    echo "❌ ERROR: Gemini API key not configured!"
    echo ""
    echo "Please create backend/.env with:"
    echo "GEMINI_API_KEY=your-api-key-here"
    echo ""
    echo "Get a key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Give backend time to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../zen-garden
npm run dev -- --host 0.0.0.0 --port 5173

# This will run in foreground. When you Ctrl+C, we'll clean up
echo ""
echo "Stopping servers..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Servers stopped"
