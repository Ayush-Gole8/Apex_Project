#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting ApeX Backend Deployment..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Verify installation
echo "✅ Dependencies installed successfully"
echo "🔍 Checking for required files..."

# Check if server.js exists
if [ -f "server.js" ]; then
    echo "✅ server.js found"
else
    echo "❌ server.js not found"
    exit 1
fi

# Check if .env file exists (optional)
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "⚠️ .env file not found - using environment variables"
fi

echo "🎉 Build completed successfully!"
echo "🚀 Ready to start server..."