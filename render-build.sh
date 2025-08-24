#!/bin/bash
# Render deployment script

echo "🚀 Starting ApeX Full-Stack Deployment..."

# Build frontend first
echo "🎨 Building React frontend..."
cd frontend
npm ci --production=false
npm run build

# Verify frontend build
if [ ! -d "build" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully"

# Install backend dependencies
echo "⚙️ Installing backend dependencies..."
cd ../backend
npm ci --production

echo "✅ Backend dependencies installed"
echo "🎉 Full-stack build completed successfully!"
echo "🌐 Ready to serve both frontend and API from single service"