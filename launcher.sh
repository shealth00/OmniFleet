#!/bin/bash

# OmniFleet Unified Application Launcher
# Frontend + Backend in a single unified application

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

echo ""
echo "🔨 Building frontend..."
npm run build

echo ""
echo "✅ Starting unified application..."
echo "   Open browser to: http://localhost:3000"
echo ""

# Start the unified application
npm run preview
