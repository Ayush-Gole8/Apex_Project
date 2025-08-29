@echo off
ECHO.
ECHO  Apex Learning Platform - Frontend Starter
ECHO  =====================================
ECHO.
ECHO  This script will start the Apex frontend React application
ECHO.

:: Check if Node.js is installed
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO [31mERROR: Node.js is not installed or not in your PATH.[0m
  ECHO Please install Node.js from https://nodejs.org/
  ECHO.
  PAUSE
  EXIT /B 1
)

:: Check if the backend is running
ECHO Checking if backend server is running...

curl -s http://localhost:3001/api/ping >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO [31mWARNING: Backend server doesn't seem to be running.[0m
  ECHO Make sure to start the backend server first at http://localhost:3001
  ECHO.
  CHOICE /C YN /M "Do you want to continue anyway? (Backend must be running for the application to work)"
  IF %ERRORLEVEL% NEQ 1 EXIT /B 0
  ECHO.
) ELSE (
  ECHO [32mBackend server is running correctly![0m
  ECHO.
)

ECHO [36mStarting Apex frontend application...[0m
ECHO The application will be available at http://localhost:3000
ECHO.
ECHO Press CTRL+C to stop the application at any time
ECHO.

:: Start the React app
npm start

ECHO.
IF %ERRORLEVEL% NEQ 0 (
  ECHO [31mApplication exited with an error. See above for details.[0m
) ELSE (
  ECHO [32mApplication stopped successfully.[0m
)

PAUSE