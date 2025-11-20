#!/bin/bash

echo "🚀 Setting up Form C Review Application..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Install Node dependencies
echo "📦 Installing Node dependencies..."
cd ../zen-garden
npm install

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set your Gemini API key in backend/.env"
echo "2. Run './start-backend.sh' to start the backend"
echo "3. Run './start-frontend.sh' to start the frontend"
echo "4. Make the ports public in the PORTS tab"
