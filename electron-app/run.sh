#!/bin/bash

echo "SQLMap GUI - Starting..."
echo "============================="

# Check if SQLMap exists
if [ ! -d "../sqlmap-dev" ] && [ ! -f "../sqlmap.py" ]; then
    echo "ERROR: SQLMap not found!"
    echo "Please run: ./setup.sh first"
    exit 1
fi


echo "Starting SQLMap GUI..."
npm start
