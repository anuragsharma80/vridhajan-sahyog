@echo off
title Vridhajan Sahyog - Project Launcher
color 0F

:menu
cls
echo.
echo ========================================
echo   Vridhajan Sahyog Project Launcher
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Start Full Development Server (Backend + Frontend)
echo 2. Start Backend Only
echo 3. Start Frontend Only
echo 4. Install Dependencies
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start_full
if "%choice%"=="2" goto start_backend
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto install_deps
if "%choice%"=="5" goto exit
echo Invalid choice. Please try again.
pause
goto menu

:start_full
echo.
echo Starting full development server...
echo.
cd /d "%~dp0"
if not exist "package.json" (
    echo ERROR: package.json not found!
    pause
    goto menu
)
npm run dev
pause
goto menu

:start_backend
echo.
echo Starting backend server...
echo.
cd /d "%~dp0\backend"
if not exist "package.json" (
    echo ERROR: Backend package.json not found!
    pause
    goto menu
)
npm start
pause
goto menu

:start_frontend
echo.
echo Starting frontend server...
echo.
cd /d "%~dp0\event-frontend"
if not exist "package.json" (
    echo ERROR: Frontend package.json not found!
    pause
    goto menu
)
npm start
pause
goto menu

:install_deps
echo.
echo Installing all dependencies...
echo.
cd /d "%~dp0"
echo Installing root dependencies...
npm install
echo.
echo Installing backend dependencies...
cd backend
npm install
echo.
echo Installing frontend dependencies...
cd ..\event-frontend
npm install
echo.
echo All dependencies installed successfully!
pause
goto menu

:exit
echo.
echo Goodbye!
exit /b 0

