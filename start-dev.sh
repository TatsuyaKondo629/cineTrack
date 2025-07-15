#!/bin/bash

# Development startup script for CineTrack
# This script loads environment variables from .env and starts the backend

echo "Starting CineTrack in development mode..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with your environment variables."
    exit 1
fi

# Load environment variables from .env file
set -a
source .env
set +a

echo "Environment variables loaded from .env"
echo "TMDB_API_KEY: ${TMDB_API_KEY:0:8}..."

# Start PostgreSQL with Docker Compose
echo "Starting PostgreSQL database..."
docker compose up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Start backend with environment variables
echo "Starting backend server..."
cd backend
TMDB_API_KEY=$TMDB_API_KEY TMDB_BASE_URL=$TMDB_BASE_URL mvn spring-boot:run &
BACKEND_PID=$!

cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

cd ..

echo "CineTrack is starting..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose stop; exit' INT
wait