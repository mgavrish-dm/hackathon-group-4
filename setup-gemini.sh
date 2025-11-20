#!/bin/bash

echo "🔧 Setting up Gemini API for Form C Review Application"
echo ""

# Check if key is provided as argument
if [ -n "$1" ]; then
    GEMINI_KEY="$1"
    echo "✅ Using API key from command line"
else
    echo "📋 Please enter your Gemini API key from the 1Password link:"
    echo "   https://share.1password.com/s#94D-wPdw4grmVBufUZPV4VdLq4yAm_ZrJmIv_jkOZrw"
    echo ""
    read -p "Paste your Gemini API key here: " GEMINI_KEY
fi

# Validate key is not empty
if [ -z "$GEMINI_KEY" ]; then
    echo "❌ Error: No API key provided"
    exit 1
fi

# Create .env file
echo "📝 Creating backend/.env file..."
cd backend
cat > .env << EOF
GEMINI_API_KEY=$GEMINI_KEY
PORT=8000
EOF

echo "✅ Configuration saved to backend/.env"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install google-generativeai --user --quiet 2>/dev/null

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start backend:  cd backend && python3 app/main.py"
echo "  2. Start frontend: cd zen-garden && npm run dev"
echo "  3. Open browser:   http://localhost:5173"
echo ""
echo "Test your setup:"
echo "  curl http://localhost:8000/health"
echo ""

