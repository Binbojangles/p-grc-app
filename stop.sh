#!/bin/bash

# Stop the GRC Solution application

echo "Stopping GRC Solution..."

# Stop and remove containers
docker compose down

echo "GRC Solution has been stopped."
echo "To start the application again, run: ./start.sh" 