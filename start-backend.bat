@echo off
title Vridhajan Sahyog - Backend Server
color 0B

echo.
echo ========================================
echo   Vridhajan Sahyog Backend Server
echo ========================================
echo.
echo Starting backend server...
echo.

REM Navigate to the project directory
cd /d "%~dp0"

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: Backend directory not found!
    echo Please make sure this batch file is in the project root directory.
    echo.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if package.json exists in backend
if not exist "package.json" (
    echo ERROR: Backend package.json not found!
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists in backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    echo.
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Start the backend server
echo Starting backend server...
echo.
echo Backend will run on: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

REM If the command fails, show error message
if errorlevel 1 (
    echo.
    echo ERROR: Failed to start backend server!
    echo Please check the error messages above.
    echo.
    pause
)

echo.
echo Backend server stopped.
pause

