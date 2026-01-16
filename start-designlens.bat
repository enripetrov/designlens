@echo off
title DesignLens - Starting...
color 0A

echo.
echo ========================================
echo    DESIGNLENS - Website Analyzer
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    echo This may take a few minutes on first run.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Please make sure Node.js is installed.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo WARNING: .env.local file not found!
    echo Please create .env.local with your ANTHROPIC_API_KEY
    echo.
    pause
)

echo [2/3] Building production version...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting DesignLens server...
echo.
echo ========================================
echo   Server will open at http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

REM Open browser after 3 seconds
start /b timeout /t 3 /nobreak >nul && start http://localhost:3000

REM Start the production server
call npm start
