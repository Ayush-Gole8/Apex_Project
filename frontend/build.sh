#!/bin/bash
# Frontend build script for Render

echo "🎨 Building ApeX Frontend for Production..."

# Install dependencies
npm install

# Build the React app
npm run build

# Verify build
if [ -d "build" ]; then
    echo "✅ Frontend build successful!"
    echo "📦 Build size:"
    du -sh build/
    echo "🚀 Ready for deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi