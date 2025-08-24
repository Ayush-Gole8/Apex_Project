#!/bin/bash

echo "Starting APEX Development Environment..."

echo ""
echo "Installing Backend Dependencies..."
cd backend
npm install

echo ""
echo "Starting Backend Server..."
npm run dev &

echo ""
echo "Starting Frontend Development Server..."
cd ../frontend
npm start &

echo ""
echo "Development servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

wait