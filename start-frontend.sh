#!/bin/bash

# Start Frontend for Form C Review Application

echo "🚀 Starting Form C Review Frontend..."
echo ""

cd zen-garden

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Dependencies installed!"
fi

echo ""
echo "🔥 Starting frontend on http://localhost:5173"
echo ""
echo "Make sure backend is running on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

