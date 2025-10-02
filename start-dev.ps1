# Quick Development Startup Script
# This script starts both backend and frontend servers quickly

Write-Host "Starting Vridhajan Sahyog Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the project root directory!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start backend
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start"

# Wait for backend to initialize
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\event-frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "Development servers are starting..." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C in each server window to stop them." -ForegroundColor Yellow
Write-Host ""

# Keep the script running
Read-Host "Press Enter to exit this launcher (servers will continue running)"
