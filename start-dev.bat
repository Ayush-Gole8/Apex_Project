@echo off
echo Starting APEX Development Environment...

echo.
echo Installing Backend Dependencies...
cd backend
call npm install

echo.
echo Starting Backend Server...
start "APEX Backend" cmd /k "npm run dev"

echo.
echo Starting Frontend Development Server...
cd ../frontend
start "APEX Frontend" cmd /k "npm start"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul