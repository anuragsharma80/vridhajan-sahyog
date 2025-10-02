@echo off
title Vridhajan Sahyog - Frontend Server
color 0C

echo.
echo ========================================
echo   Vridhajan Sahyog Frontend Server
echo ========================================
echo.
echo Starting frontend server...
echo.

REM Navigate to the project directory
cd /d "%~dp0"

REM Check if event-frontend directory exists
if not exist "event-frontend" (
    echo ERROR: Frontend directory not found!
    echo Please make sure this batch file is in the project root directory.
    echo.
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd event-frontend

REM Check if package.json exists in frontend
if not exist "package.json" (
    echo ERROR: Frontend package.json not found!
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists in frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    echo.
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Start the frontend server
echo Starting frontend server...
echo.
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

REM If the command fails, show error message
if errorlevel 1 (
    echo.
    echo ERROR: Failed to start frontend server!
    echo Please check the error messages above.
    echo.
    pause
)

echo.
echo Frontend server stopped.
pause

