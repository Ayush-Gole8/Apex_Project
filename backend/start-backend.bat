@echo off
echo Starting Apex Backend Server...
cd /d %~dp0
node start-server.js
pause