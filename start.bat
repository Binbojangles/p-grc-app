@echo off
echo Starting GRC Solution...
echo This will start the database, backend API, and frontend application.

REM Build and start the containers
docker compose up -d

REM Wait for the containers to be ready
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Initialize the database with sample data (temporarily commented out due to path issues)
REM echo Initializing database with sample data...
REM docker compose exec server node ../../scripts/init-db.js

echo.
echo GRC Solution is now running!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo To stop the application, run: stop.bat 