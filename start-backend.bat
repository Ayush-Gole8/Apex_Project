@echo off
echo.
echo ===================================
echo      APEX Backend Startup
echo ===================================
echo.

cd /d "%~dp0backend"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting backend server...
echo.
echo ===================================
echo  Backend will run on port 5000
echo  Press Ctrl+C to stop the server
echo ===================================
echo.

call npm run dev

pause