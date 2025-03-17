#!/bin/sh

echo "Waiting for database to be ready..."

# Wait for the database to be ready before proceeding
until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  # wait for 5 seconds before checking again
  sleep 5
done

echo "Database is ready, running setup..."

# Run database initialization and seeding
npm run setup-db

echo "Starting application..."
# Start the application
npm run dev 