#!/bin/bash

# Script to update Gemini API key

echo "🔑 Gemini API Key Update Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: Please run this script from the hackathon directory"
    exit 1
fi

# Prompt for API key
echo "Please enter your new Gemini API key:"
echo "(Get one from: https://aistudio.google.com/app/apikey)"
echo ""
read -p "API Key: " NEW_API_KEY

# Validate input
if [ -z "$NEW_API_KEY" ]; then
    echo "❌ Error: API key cannot be empty"
    exit 1
fi

# Create backup of current .env if it exists
if [ -f "backend/.env" ]; then
    cp backend/.env backend/.env.backup
    echo "✅ Created backup: backend/.env.backup"
fi

# Write new .env file
cat > backend/.env << EOF
# Gemini API Configuration
GEMINI_API_KEY=$NEW_API_KEY

# Backend Server Configuration (Optional - defaults shown)
# PORT=8000
# HOST=0.0.0.0
EOF

echo "✅ Updated backend/.env with new API key"
echo ""

# Test the API key
echo "🧪 Testing API key..."
python3 -c "
import os
import sys
sys.path.append('backend')
try:
    import google.generativeai as genai
    genai.configure(api_key='$NEW_API_KEY')
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content('Say hello')
    print('✅ API key is valid!')
except Exception as e:
    print(f'❌ API key test failed: {e}')
"

echo ""
echo "📝 Next steps:"
echo "1. Restart your backend server (Ctrl+C and run ./start-backend.sh)"
echo "2. Try analyzing a Form C document again"
echo ""
echo "If you're still having issues, check:"
echo "- Is the backend server running on port 8000?"
echo "- Are there any error messages in the backend terminal?"
