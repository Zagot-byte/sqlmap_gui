#!/bin/bash

echo "Running setup.sh"
echo "============================="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd ..
if [ ! -d "sqlmap-dev" ]; then
    echo "creating a directory for sql map in ../"
    mkdir sqlmap-dev
    echo "cloning sqlmap-dev"
    git clone https://github.com/sqlmapproject/sqlmap.git sqlmap-dev
else
    echo "✓ SQLMap already exists"
fi
cd "$SCRIPT_DIR"
echo "Installing Node.js dependencies..."
npm install
echo "============================="
echo "✓ Setup Complete!"
echo ""
echo "To run the app:"
echo "  ./run.sh"
echo "  or"
echo "  npm start"


