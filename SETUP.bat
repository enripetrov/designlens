@echo off
title DesignLens - Smart Setup Wizard
color 0E
setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo    DESIGNLENS SETUP WIZARD
echo ========================================
echo.
echo Kontrollin sulle vajalikke asju...
echo.

REM ====================
REM 1. Check Node.js
REM ====================
echo [1/4] Kontrollin Node.js...
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo [X] Node.js EI OLE INSTALLITUD!
    echo.
    echo LAHENDUS:
    echo 1. Mine: https://nodejs.org/
    echo 2. Laadi alla LTS versioon
    echo 3. Installi see
    echo 4. Taaskäivita see fail
    echo.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    OK! Node.js %NODE_VERSION% on olemas
echo.

REM ====================
REM 2. Install npm packages
REM ====================
echo [2/4] Kontrollin npm pakette...
if exist "node_modules\" (
    echo    OK! Paketid juba installitud
) else (
    echo    Installin npm pakette (see võtab mõned minutid)...
    call npm install
    if errorlevel 1 (
        color 0C
        echo.
        echo [X] npm install ebaõnnestus!
        echo.
        pause
        exit /b 1
    )
    echo    OK! Paketid installitud
)
echo.

REM ====================
REM 3. Check .env.local
REM ====================
echo [3/4] Kontrollin .env.local faili...
if exist ".env.local" (
    echo    OK! .env.local fail on olemas
    findstr /C:"ANTHROPIC_API_KEY" .env.local >nul
    if errorlevel 1 (
        color 0C
        echo.
        echo [!] HOIATUS: .env.local ei sisalda ANTHROPIC_API_KEY
        echo.
    )
) else (
    color 0E
    echo.
    echo [!] .env.local fail PUUDUB!
    echo.
    echo Kas tahad selle nüüd luua? (Y/N)
    set /p CREATE_ENV=^> 
    
    if /i "!CREATE_ENV!"=="Y" (
        echo.
        echo Sisesta oma Anthropic API võti:
        echo (Saad siit: https://console.anthropic.com/)
        echo.
        set /p API_KEY=API võti: 
        
        if "!API_KEY!"=="" (
            echo.
            echo [X] Võti ei saa olla tühi!
            echo Loo .env.local fail käsitsi!
            echo.
            pause
            exit /b 1
        )
        
        echo ANTHROPIC_API_KEY=!API_KEY! > .env.local
        echo.
        echo    OK! .env.local fail loodud!
    ) else (
        color 0C
        echo.
        echo [X] .env.local fail on kohustuslik!
        echo.
        echo Loo fail käsitsi:
        echo 1. Loo fail nimega .env.local
        echo 2. Lisa sinna: ANTHROPIC_API_KEY=sk-ant-xxxxx
        echo 3. Käivita see fail uuesti
        echo.
        pause
        exit /b 1
    )
)
echo.

REM ====================
REM 4. Ready to start
REM ====================
echo [4/4] Kõik on valmis!
echo.
color 0A
echo ========================================
echo    SETUP EDUKAS!
echo ========================================
echo.
echo Mida tahad teha?
echo.
echo [1] Käivita arendusrežiim (soovitatud)
echo [2] Käivita tootmisrežiim
echo [3] Välju (käivitan hiljem)
echo.
set /p CHOICE=Vali (1-3): 

if "%CHOICE%"=="1" (
    echo.
    echo Käivitan arendusrežiimi...
    echo Brauser avaneb http://localhost:3000
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
    call npm run dev
) else if "%CHOICE%"=="2" (
    echo.
    echo Ehitan tootmisversiooni...
    call npm run build
    if errorlevel 1 (
        echo.
        echo [X] Build ebaõnnestus!
        pause
        exit /b 1
    )
    echo Käivitan serveri...
    start http://localhost:3000
    call npm start
) else (
    echo.
    echo Käivitamiseks kasuta hiljem:
    echo - start-dev.bat (arendus)
    echo - start-designlens.bat (tootmine)
    echo.
    pause
)

endlocal
