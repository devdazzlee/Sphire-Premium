#!/bin/bash

echo "Starting Complete E-commerce Platform..."
echo

# Function to start service in background
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    
    echo "Starting $service_name..."
    cd "$directory"
    $command &
    cd ..
    sleep 2
}

# Start Backend Server
start_service "Backend Server" "Backend" "npm run dev"

# Start Frontend Application
start_service "Frontend App" "Frontend" "npm run dev"

# Start Admin Dashboard
start_service "Admin Dashboard" "Dashboard" "npm run dev"

echo
echo "All services are starting up..."
echo
echo "Frontend: http://localhost:3000"
echo "Dashboard: http://localhost:3001"
echo "Backend API: http://localhost:5000/api"
echo
echo "Default Admin Login:"
echo "Email: admin@luxurybeauty.com"
echo "Password: admin123"
echo
echo "Press Ctrl+C to stop all services"
echo

# Wait for user interrupt
trap 'echo "Stopping all services..."; kill $(jobs -p); exit' INT
wait
