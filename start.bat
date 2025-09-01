@echo off
chcp 65001 >nul
echo ======================================
echo    WeWork Knowledge Sidebar Tool
echo ======================================

echo.
echo Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not detected, please install Node.js first
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo First run, installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies, please check network connection
        pause
        exit /b 1
    )
)

echo.
echo Starting service...
echo Service will be available at: http://localhost:3000
echo Press Ctrl+C to stop service
echo.

npm start

pause
