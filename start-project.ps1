# Vridhajan Sahyog - PowerShell Project Launcher
# This script provides a menu-driven interface to start the project components

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Vridhajan Sahyog Project Launcher" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Start Full Development Server (Backend + Frontend)" -ForegroundColor Green
    Write-Host "2. Start Backend Only" -ForegroundColor Green
    Write-Host "3. Start Frontend Only" -ForegroundColor Green
    Write-Host "4. Install Dependencies" -ForegroundColor Green
    Write-Host "5. Exit" -ForegroundColor Red
    Write-Host ""
}

function Start-FullServer {
    Write-Host ""
    Write-Host "Starting full development server..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        Write-Host "ERROR: package.json not found!" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }
    
    # Start backend in new window
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in new window
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\event-frontend'; npm start"
    
    Write-Host ""
    Write-Host "Both servers are starting in separate windows..." -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Blue
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
    Read-Host "Press Enter to continue"
}

function Start-BackendOnly {
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path "backend\package.json")) {
        Write-Host "ERROR: Backend package.json not found!" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }
    
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"
    
    Write-Host ""
    Write-Host "Backend server is starting..." -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Blue
    Read-Host "Press Enter to continue"
}

function Start-FrontendOnly {
    Write-Host ""
    Write-Host "Starting frontend server..." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path "event-frontend\package.json")) {
        Write-Host "ERROR: Frontend package.json not found!" -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return
    }
    
    Write-Host "Starting Frontend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\event-frontend'; npm start"
    
    Write-Host ""
    Write-Host "Frontend server is starting..." -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
    Read-Host "Press Enter to continue"
}

function Install-Dependencies {
    Write-Host ""
    Write-Host "Installing all dependencies..." -ForegroundColor Yellow
    Write-Host ""
    
    # Install root dependencies
    Write-Host "Installing root dependencies..." -ForegroundColor Green
    npm install
    
    # Install backend dependencies
    Write-Host ""
    Write-Host "Installing backend dependencies..." -ForegroundColor Green
    Set-Location backend
    npm install
    
    # Install frontend dependencies
    Write-Host ""
    Write-Host "Installing frontend dependencies..." -ForegroundColor Green
    Set-Location ..\event-frontend
    npm install
    
    # Return to root
    Set-Location ..
    
    Write-Host ""
    Write-Host "All dependencies installed successfully!" -ForegroundColor Green
    Read-Host "Press Enter to continue"
}

# Main menu loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-5)"
    
    switch ($choice) {
        "1" { Start-FullServer }
        "2" { Start-BackendOnly }
        "3" { Start-FrontendOnly }
        "4" { Install-Dependencies }
        "5" { 
            Write-Host ""
            Write-Host "Goodbye!" -ForegroundColor Cyan
            exit 
        }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
