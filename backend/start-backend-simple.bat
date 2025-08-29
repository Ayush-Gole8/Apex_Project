@echo off
echo Starting ApeX Backend Server...
echo.
echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking if dependencies are installed...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting server on port 3001...
echo Backend will be available at: http://localhost:3001
echo API endpoints will be at: http://localhost:3001/api/
echo.
echo Press Ctrl+C to stop the server
echo.

npm start