# KisanQueue - Intelligent Multi-Service Project Startup Script
# Run from: C:\Users\user\OneDrive\Desktop\sihf\sih\
# Usage: .\start-kisanqueue.ps1

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

$BACKEND_DIR  = "$ROOT\KisanQueue_backend_starter\KisanQueue_backend"
$FARMER_DIR   = "$ROOT\Farmer-Procurement-App-main\Farmer-Procurement-App-main"
$ADMIN_DIR    = "$ROOT\Admin-Procurement-Officer--main\Admin-Procurement-Officer--main"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "         KisanQueue Hackathon Project Startup Script        " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Helper to check if a TCP port is in use and retrieve process
function Check-Port($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    return $conn
}

# 1. VERIFY ROOT & DIRECTORIES
Write-Host "[1/5] Verifying project directories..." -ForegroundColor Yellow
if (!(Test-Path $BACKEND_DIR) -or !(Test-Path $FARMER_DIR) -or !(Test-Path $ADMIN_DIR)) {
    Write-Host "      ERROR: One or more project directories could not be found." -ForegroundColor Red
    Write-Host "      Backend: $BACKEND_DIR"
    Write-Host "      Farmer:  $FARMER_DIR"
    Write-Host "      Admin:   $ADMIN_DIR"
    exit 1
}
Write-Host "      OK - All verified project directories exist." -ForegroundColor Green

# 2. CHECK MONGODB SERVICE & CONNECTIVITY
Write-Host "[2/5] Checking MongoDB (Port 27017)..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "      OK - Windows Service 'MongoDB' is Running." -ForegroundColor Green
    } else {
        Write-Host "      WARNING - 'MongoDB' service status is $($mongoService.Status)." -ForegroundColor Yellow
        Write-Host "      To start MongoDB, run in Admin PowerShell: Start-Service MongoDB (or net start MongoDB)" -ForegroundColor Yellow
    }
} else {
    Write-Host "      INFO - Windows Service 'MongoDB' not registered as standard service name." -ForegroundColor Gray
}

$mongoPort = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -WarningAction SilentlyContinue
if ($mongoPort.TcpTestSucceeded) {
    Write-Host "      OK - MongoDB is accepting connections on 127.0.0.1:27017." -ForegroundColor Green
} else {
    Write-Host "      ERROR - Cannot connect to MongoDB on port 27017." -ForegroundColor Red
    Write-Host "      Please ensure MongoDB is running before starting the applications." -ForegroundColor Red
    $continueMongo = Read-Host "      Continue anyway? (y/n)"
    if ($continueMongo -ne "y") { exit 1 }
}

# 3. CHECK BACKEND PYTHON VIRTUAL ENVIRONMENT
Write-Host "[3/5] Checking Backend Python Environment..." -ForegroundColor Yellow
if (Test-Path "$BACKEND_DIR\.venv\Scripts\Activate.ps1") {
    Write-Host "      OK - Python virtual environment (.venv) is present." -ForegroundColor Green
} else {
    Write-Host "      ERROR - .venv not found in $BACKEND_DIR." -ForegroundColor Red
    Write-Host "      Run: cd '$BACKEND_DIR'; python -m venv .venv; .\.venv\Scripts\activate; pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# 4. CHECK FRONTEND DEPENDENCIES
Write-Host "[4/5] Checking Frontend Dependencies..." -ForegroundColor Yellow
$farmerModules = Test-Path "$FARMER_DIR\node_modules"
$adminModules  = Test-Path "$ADMIN_DIR\node_modules"

if ($farmerModules) {
    Write-Host "      OK - Farmer App node_modules verified." -ForegroundColor Green
} else {
    Write-Host "      WARNING - Farmer App node_modules missing. Run: cd '$FARMER_DIR'; npm install" -ForegroundColor Yellow
}

if ($adminModules) {
    Write-Host "      OK - Admin/Officer App node_modules verified." -ForegroundColor Green
} else {
    Write-Host "      WARNING - Admin/Officer App node_modules missing. Run: cd '$ADMIN_DIR'; npm install" -ForegroundColor Yellow
}

# 5. DETECT PORT CONFLICTS & START SERVICES
Write-Host "[5/5] Checking active ports & launching services..." -ForegroundColor Yellow

# Port 8000: FastAPI
$p8000 = Check-Port 8000
if ($p8000) {
    Write-Host "      NOTICE: Port 8000 is ALREADY active (PID $($p8000.OwningProcess)). Skipping duplicate FastAPI backend launch." -ForegroundColor Cyan
} else {
    Write-Host "      Starting FastAPI Backend on port 8000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_DIR'; `$host.UI.RawUI.WindowTitle = 'KisanQueue - FastAPI Backend (Port 8000)'; Write-Host 'Starting KisanQueue Backend...' -ForegroundColor Cyan; .\.venv\Scripts\activate; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
    Start-Sleep -Seconds 2
}

# Port 3000: Farmer App
$p3000 = Check-Port 3000
if ($p3000) {
    Write-Host "      NOTICE: Port 3000 is ALREADY active (PID $($p3000.OwningProcess)). Skipping duplicate Farmer App launch." -ForegroundColor Cyan
} else {
    Write-Host "      Starting Farmer App on port 3000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FARMER_DIR'; `$host.UI.RawUI.WindowTitle = 'KisanQueue - Farmer App (Port 3000)'; Write-Host 'Starting Farmer App (Vite)...' -ForegroundColor Green; npm run dev"
    Start-Sleep -Seconds 1
}

# Port 3001: Admin / Officer App
$p3001 = Check-Port 3001
if ($p3001) {
    Write-Host "      NOTICE: Port 3001 is ALREADY active (PID $($p3001.OwningProcess)). Skipping duplicate Admin App launch." -ForegroundColor Cyan
} else {
    Write-Host "      Starting Admin / Officer App on port 3001..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ADMIN_DIR'; `$host.UI.RawUI.WindowTitle = 'KisanQueue - Admin/Officer Portal (Port 3001)'; Write-Host 'Starting Admin / Officer Portal...' -ForegroundColor Yellow; npm run dev"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "               KisanQueue Application Status                " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  FastAPI Backend:       http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  API Documentation:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  Health Endpoint:       http://127.0.0.1:8000/health" -ForegroundColor White
Write-Host "  Farmer Procurement App: http://localhost:3000" -ForegroundColor Green
Write-Host "  Admin & Officer Portal: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Demo Credentials:" -ForegroundColor Cyan
Write-Host "    - Farmer Quick Login:   MH-PUN-2026-0814 / password123" -ForegroundColor Gray
    Write-Host "    - Officer Login:        OFF001 / Officer@123" -ForegroundColor Gray
    Write-Host "    - Admin Login:          admin / Admin@123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Automated Verification:" -ForegroundColor Cyan
Write-Host "    Run in backend venv: python test_e2e.py" -ForegroundColor Gray
Write-Host ""
Write-Host "  Shutdown Instructions:" -ForegroundColor Cyan
Write-Host "    Press Ctrl+C inside each open PowerShell window to stop that service." -ForegroundColor Gray
Write-Host ""
