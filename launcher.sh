#!/bin/bash

# OmniFleet Desktop Launcher
# This script starts both the backend API and frontend UI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting OmniFleet..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start frontend and backend concurrently
npm start
