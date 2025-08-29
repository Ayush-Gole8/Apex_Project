@echo off
ECHO.
ECHO  Apex Learning Platform - Backend Starter
ECHO  =====================================
ECHO.
ECHO  This script will start the Apex backend server
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

:: Check if port 3001 is available
ECHO Checking if port 3001 is available...
node check-port.js
IF %ERRORLEVEL% NEQ 0 (
  ECHO [31mWARNING: Port checker script failed to run.[0m
  ECHO.
)

ECHO.
ECHO [36mStarting Apex backend server...[0m
ECHO The server will start on port 3001
ECHO.
ECHO Press CTRL+C to stop the server at any time
ECHO.

:: Start the server
node start-server.js

ECHO.
IF %ERRORLEVEL% NEQ 0 (
  ECHO [31mServer exited with an error. See above for details.[0m
) ELSE (
  ECHO [32mServer stopped successfully.[0m
)

PAUSE