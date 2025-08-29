@echo off
echo Checking port availability...
cd /d %~dp0
node check-port.js
pause