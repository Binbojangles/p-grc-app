#!/bin/bash

# Start the GRC Solution application using Docker Compose

echo "Starting GRC Solution..."
echo "This will start the database, backend API, and frontend application."

# Build and start the containers
docker compose up -d

# Wait for the containers to be ready
echo "Waiting for services to start..."
sleep 10

# Initialize the database with sample data
echo "Initializing database with sample data..."
docker compose exec server node ../scripts/init-db.js

echo "GRC Solution is now running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo ""
echo "Default admin credentials:"
echo "Email: admin@example.com"
echo "Password: Admin123!"
echo ""
echo "To stop the application, run: docker compose down" 