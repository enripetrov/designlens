@echo off
title DesignLens - Development Mode
color 0B

echo.
echo ========================================
echo    DESIGNLENS - Development Mode
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo Starting development server...
echo.
echo ========================================
echo   Server: http://localhost:3000
echo   Hot reload enabled
echo   Press Ctrl+C to stop
echo ========================================
echo.

REM Open browser after 3 seconds
start /b timeout /t 3 /nobreak >nul && start http://localhost:3000

REM Start dev server
call npm run dev
