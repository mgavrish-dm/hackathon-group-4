#!/bin/bash

# Start Backend Server for Form C Review Application

echo "🚀 Starting Form C Review Backend..."
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env file not found!"
    echo ""
    echo "You need to create a .env file in the backend folder with your Gemini API key:"
    echo ""
    echo "  cd backend"
    echo "  echo 'GEMINI_API_KEY=your-key-here' > .env"
    echo ""
    echo "Get your API key from: https://aistudio.google.com/app/apikey"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit..."
fi

cd backend

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing backend dependencies..."
    pip3 install -r requirements.txt --user --quiet
    echo "✅ Dependencies installed!"
fi

echo ""
echo "🔥 Starting backend server on http://localhost:8000"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo "Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run using uvicorn (more reliable for FastAPI)
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

