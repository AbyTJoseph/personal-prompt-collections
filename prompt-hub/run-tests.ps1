# Playwright Test Runner Script
# This script provides easy commands to run different types of tests

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Playwright Test Runner" -ForegroundColor Green
    Write-Host "=====================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\run-tests.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  all         - Run all tests"
    Write-Host "  ui          - Run tests with Playwright UI"
    Write-Host "  headed      - Run tests in headed mode (visible browser)"
    Write-Host "  debug       - Run tests in debug mode"
    Write-Host "  report      - Show test report"
    Write-Host "  install     - Install Playwright browsers"
    Write-Host "  help        - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\run-tests.ps1 all"
    Write-Host "  .\run-tests.ps1 ui"
    Write-Host "  .\run-tests.ps1 debug"
}

function Run-AllTests {
    Write-Host "Running all tests..." -ForegroundColor Green
    npx playwright test
}

function Run-UITests {
    Write-Host "Starting Playwright UI..." -ForegroundColor Green
    npx playwright test --ui
}

function Run-HeadedTests {
    Write-Host "Running tests in headed mode..." -ForegroundColor Green
    npx playwright test --headed
}

function Run-DebugTests {
    Write-Host "Running tests in debug mode..." -ForegroundColor Green
    npx playwright test --debug
}

function Show-Report {
    Write-Host "Opening test report..." -ForegroundColor Green
    npx playwright show-report
}

function Install-Browsers {
    Write-Host "Installing Playwright browsers..." -ForegroundColor Green
    npx playwright install
}

# Main script logic
switch ($Command.ToLower()) {
    "all" { Run-AllTests }
    "ui" { Run-UITests }
    "headed" { Run-HeadedTests }
    "debug" { Run-DebugTests }
    "report" { Show-Report }
    "install" { Install-Browsers }
    "help" { Show-Help }
    default { 
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use 'help' to see available commands" -ForegroundColor Yellow
        Show-Help
    }
}




