@echo off
echo Stopping GRC Solution...

REM Stop and remove containers
docker compose down

echo.
echo GRC Solution has been stopped.
echo To start the application again, run: start.bat 