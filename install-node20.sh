#!/bin/bash

echo "🔧 Installing Node.js 20 for current session..."

# Install nvm if not already installed
if ! command -v nvm &> /dev/null; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install and use Node 20
nvm install 20
nvm use 20

echo "✅ Node.js version:"
node --version

echo ""
echo "Now you can run:"
echo "  cd zen-garden && npm run dev"
