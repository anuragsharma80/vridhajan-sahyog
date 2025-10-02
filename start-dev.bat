@echo off
title Vridhajan Sahyog - Development Server
color 0A

echo.
echo ========================================
echo   Vridhajan Sahyog Development Server
echo ========================================
echo.
echo Starting development server...
echo.

REM Navigate to the project directory
cd /d "%~dp0"

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure this batch file is in the project root directory.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Start the development server
echo Starting both backend and frontend servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev

REM If the command fails, show error message
if errorlevel 1 (
    echo.
    echo ERROR: Failed to start development server!
    echo Please check the error messages above.
    echo.
    pause
)

echo.
echo Development server stopped.
pause

