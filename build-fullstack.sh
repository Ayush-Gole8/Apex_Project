#!/bin/bash
# Single deployment build script

echo "🚀 Building ApeX Full-Stack Application..."

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build

# Install backend dependencies
echo "⚙️ Installing backend dependencies..."
cd ../backend
npm install

echo "✅ Full-stack build completed!"
echo "📦 Frontend build ready in: frontend/build"
echo "🚀 Backend ready to serve both API and frontend"