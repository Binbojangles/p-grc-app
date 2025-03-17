@echo off

REM Stop any running containers
echo Stopping any running containers...
docker-compose down

REM Build images
echo Building Docker images...
docker-compose build

REM Start containers
echo Starting containers...
docker-compose up -d

echo Application is running!
echo Client: http://localhost
echo API: http://localhost:3000
echo.
echo Login credentials:
echo Email: admin@example.com
echo Password: password

pause 