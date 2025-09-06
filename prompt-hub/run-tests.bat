@echo off
REM Playwright Test Runner Script
REM This script provides easy commands to run different types of tests

setlocal enabledelayedexpansion

if "%1"=="" (
    set "command=help"
) else (
    set "command=%1"
)

if /i "%command%"=="help" (
    echo Playwright Test Runner
    echo =====================
    echo.
    echo Usage: run-tests.bat [command]
    echo.
    echo Commands:
    echo   all         - Run all tests
    echo   ui          - Run tests with Playwright UI
    echo   headed      - Run tests in headed mode (visible browser)
    echo   debug       - Run tests in debug mode
    echo   report      - Show test report
    echo   install     - Install Playwright browsers
    echo   help        - Show this help message
    echo.
    echo Examples:
    echo   run-tests.bat all
    echo   run-tests.bat ui
    echo   run-tests.bat debug
    goto :eof
)

if /i "%command%"=="all" (
    echo Running all tests...
    npx playwright test
    goto :eof
)

if /i "%command%"=="ui" (
    echo Starting Playwright UI...
    npx playwright test --ui
    goto :eof
)

if /i "%command%"=="headed" (
    echo Running tests in headed mode...
    npx playwright test --headed
    goto :eof
)

if /i "%command%"=="debug" (
    echo Running tests in debug mode...
    npx playwright test --debug
    goto :eof
)

if /i "%command%"=="report" (
    echo Opening test report...
    npx playwright show-report
    goto :eof
)

if /i "%command%"=="install" (
    echo Installing Playwright browsers...
    npx playwright install
    goto :eof
)

echo Unknown command: %command%
echo Use 'help' to see available commands
goto :eof




