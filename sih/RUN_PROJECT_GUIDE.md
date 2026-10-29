# KisanQueue — Complete Project Setup & Execution Guide

> **For beginners on Windows 11 with PowerShell**
> Every command in this guide was verified against the actual project files.
> Created: 17 October 2026

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Project Directory Structure](#3-project-directory-structure)
4. [First-Time Setup](#4-first-time-setup)
5. [MongoDB Startup and Verification](#5-mongodb-startup-and-verification)
6. [Pure MongoDB Architecture (No Redis Needed)](#6-pure-mongodb-architecture-no-redis-needed)
7. [Environment Configuration](#7-environment-configuration)
8. [Start the Backend](#8-start-the-backend)
9. [Start Each Frontend](#9-start-each-frontend)
10. [Correct Startup Order](#10-correct-startup-order)
11. [First-Time Initialization and Seed Data](#11-first-time-initialization-and-seed-data)
12. [CORS Configuration](#12-cors-configuration)
13. [Authentication Troubleshooting](#13-authentication-troubleshooting)
14. [MongoDB Troubleshooting](#14-mongodb-troubleshooting)
15. [Concurrency & Slot Locking (MongoDB Native)](#15-concurrency--slot-locking-mongodb-native)
16. [CORS and Frontend Troubleshooting](#16-cors-and-frontend-troubleshooting)
17. [Testing Checklist](#17-testing-checklist)
18. [One-Command Startup Option](#18-one-command-startup-option)
19. [Shutdown Instructions](#19-shutdown-instructions)
20. [Common Commands Reference](#20-common-commands-reference)

---

## 1. Project Architecture

KisanQueue is a digital agricultural procurement slot-booking system.
It has **three separate running processes** and **two database services**.

```
Farmer App (localhost:3000)      Admin/Officer App (localhost:3001)
       |  React + Vite                   |  React + Vite + Express
       |                                 |
       +---------------+  +--------------+
                       |  |
              FastAPI Backend (port 8000)
              python -m uvicorn app.main:app
                       |        |
               MongoDB (27017)  Redis (6379)
               Windows Service  Local install
```

### What each part does

| Service | Purpose | Port | Storage |
|---|---|---|---|
| FastAPI Backend | JWT auth, booking logic, all API routes | 8000 | MongoDB (Pure NoSQL) |
| Farmer App | Farmers log in, book slots, view tokens | 3000 | Reads FastAPI |
| Admin/Officer App | Admin manages centers; officers verify tokens | 3001 | JSON files + FastAPI |
| MongoDB | Stores farmers, bookings, crops, centers, payments, locks | 27017 | Windows Service |

> **IMPORTANT:** The Admin/Officer App has its own built-in Express server
> (server.ts) that serves both the API and the React frontend on port 3001.
> It reads data directly from JSON files in its data/ folder.
> The FastAPI backend (KisanQueue_backend) is the primary service using MongoDB.
> **Redis is NOT required:** Concurrency control and slot locking are handled natively in MongoDB.

---

## 2. Prerequisites

### Required Software

| Software | Purpose | How to Check |
|---|---|---|
| Node.js 18+ | Run frontends | `node --version` |
| npm | Install JS packages | `npm --version` |
| Python 3.10+ | Run FastAPI backend | `python --version` |
| MongoDB | Primary database & lock manager | `Get-Service MongoDB` |

### Check all prerequisites at once

Open PowerShell and run each command:

```powershell
node --version
npm --version
python --version
Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
Test-NetConnection -ComputerName localhost -Port 27017
Test-NetConnection -ComputerName localhost -Port 6379
```

---

## 3. Project Directory Structure

```
C:\Users\user\OneDrive\Desktop\sihf\sih\
|
+-- RUN_PROJECT_GUIDE.md              <- This file
+-- start-kisanqueue.ps1              <- One-command startup script
|
+-- KisanQueue_backend_starter\
|   +-- KisanQueue_backend\           <- THE REAL FastAPI BACKEND
|       +-- .venv\                    <- Python virtual environment (always use this)
|       +-- app\
|       |   +-- main.py               <- FastAPI entry point (uvicorn runs this)
|       |   +-- auth.py               <- JWT signing and validation
|       |   +-- config.py             <- Reads .env variables
|       |   +-- database.py           <- MongoDB + Redis connections
|       |   +-- routes\
|       |       +-- auth.py           <- /auth/farmer/login, /auth/admin/login
|       |       +-- farmer.py         <- /farmer/bookings, /farmer/notifications
|       |       +-- admin.py          <- /admin/...
|       |       +-- officer.py        <- /officer/...
|       +-- data\                     <- Small seed JSON files (crops, centers, slots)
|       +-- .env                      <- Your actual environment config
|       +-- .env.example              <- Template only, do not use directly
|       +-- requirements.txt          <- Python dependencies
|       +-- seed.py                   <- DB seed script, run manually once
|
+-- Farmer-Procurement-App-main\
|   +-- Farmer-Procurement-App-main\  <- FARMER FRONTEND (React + Vite)
|       +-- src\
|       +-- .env                      <- VITE_API_URL=http://127.0.0.1:8000
|       +-- package.json              <- dev script: vite --port=3000 --host=0.0.0.0
|       +-- vite.config.ts
|
+-- Admin-Procurement-Officer--main\
|   +-- Admin-Procurement-Officer--main\  <- ADMIN/OFFICER FRONTEND
|       +-- src\
|       +-- backend\
|       |   +-- main.py               <- Reference stub only, NOT the running backend
|       |   +-- seed.py               <- Seeds kisanqueue_db (different DB name)
|       +-- data\                     <- JSON files read directly by server.ts
|       +-- server.ts                 <- Express + Vite server (runs on port 3001)
|       +-- .env                      <- VITE_API_URL=http://localhost:8000
|       +-- package.json              <- dev script: tsx server.ts
|
+-- .venv\                            <- Root-level shared venv, do NOT use for backend
```

> KEY FACT: The sih/.venv at the root is NOT the backend's virtual environment.
> Always activate KisanQueue_backend/.venv before running backend commands.

---

## 4. First-Time Setup

Do this once after cloning the project.

### 4a. Farmer App - Install Dependencies

Open Terminal 1:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Farmer-Procurement-App-main\Farmer-Procurement-App-main"
npm install
```

### 4b. Admin/Officer App - Install Dependencies

Open Terminal 2:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Admin-Procurement-Officer--main\Admin-Procurement-Officer--main"
npm install
```

### 4c. Backend - Activate Virtual Environment and Install Dependencies

Open Terminal 3:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.venv\Scripts\activate
pip install -r requirements.txt
```

If .venv does not exist yet, create it first:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

---

## 5. MongoDB Startup and Verification

MongoDB is installed as a Windows service named MongoDB.
MongoDB Compass is a GUI tool. It does NOT start or stop the database server.
You only need an elevated (Administrator) PowerShell to start or stop the service.

### Check if MongoDB is already running (no admin needed)

```powershell
Get-Service -Name "MongoDB"
```

- Status = Running: MongoDB is already up. Skip to verification below.
- Status = Stopped: You need to start it. See the section below.

### Verify MongoDB is accessible

```powershell
Test-NetConnection -ComputerName localhost -Port 27017
```

Expected: TcpTestSucceeded : True

### Start MongoDB only if it is Stopped (requires Administrator)

1. Press Win key
2. Search for PowerShell
3. Right-click and select Run as Administrator
4. In the elevated window run:

```powershell
net start MongoDB
```

Expected output: The MongoDB service was started successfully.

If you see "System error 5 - Access is denied":
You are not running PowerShell as Administrator. Repeat the steps above.

If you see "The service name is invalid":
MongoDB is not installed as a Windows service.
Download it from https://www.mongodb.com/try/download/community
and install it with the Install as Windows Service option checked.

### Connect with MongoDB Compass

- Open MongoDB Compass
- Connection string: mongodb://localhost:27017
- Click Connect
- You should see the kisanqueue database

---

## 6. Pure MongoDB Architecture (No Redis Needed)

The KisanQueue platform has been migrated to a **100% MongoDB architecture**, completely removing the Redis dependency.

### How Concurrency & Double-Booking Protection Works without Redis:
1. **Atomic Document-Level Conditional Updates:**
   - In `app/routes/farmer.py`, slot booking uses MongoDB's atomic `find_one_and_update`:
     ```python
     slot_alloc = db.slots.find_one_and_update(
         {"slot_id": slot_ident, "booked_count": {"$lt": capacity}},
         {"$inc": {"booked_count": 1}},
         return_document=True
     )
     ```
   - MongoDB evaluates the condition `booked_count < capacity` and increments atomically.
   - If two farmers book simultaneously when only 1 spot remains, exactly one succeeds and the other receives an HTTP 409 conflict error. No race conditions can occur.

2. **Native MongoDB Slot Locks Collection (`db.slot_locks`):**
   - Active concurrency locks and checkout barriers are stored directly in MongoDB collection `slot_locks`.
   - Indexed with a TTL index on `expires_at` for automatic cleanup.
   - The `/system/redis-locks`, `/system/redis-locks/acquire`, and `/system/redis-locks/release` endpoints are fully backed by MongoDB for 100% backward compatibility with existing frontends.

3. **Verification Command:**
   Test that MongoDB is healthy and accepting operations:
   ```powershell
   Get-Service -Name "MongoDB"
   ```
   No Redis service or port 6379 is required.

---

## 7. Environment Configuration

### Backend .env file

Location:
C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend\.env

Check it exists:

```powershell
Test-Path "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend\.env"
```

View it (safe):

```powershell
Get-Content "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend\.env"
```

Required variables:

| Variable | Required Value | Purpose |
|---|---|---|
| MONGO_URI | mongodb://localhost:27017 | MongoDB connection |
| MONGO_DB | kisanqueue | Database name |
| REDIS_URL | redis://localhost:6379/0 | Redis connection |
| JWT_SECRET | Any long random string | Signs JWT tokens |
| JWT_EXPIRE_MINUTES | 60 | Token lifetime in minutes |

SECURITY WARNING:
The default JWT_SECRET in your .env is "change-this-in-production".
This is acceptable for local development only.
Never use this on a public-facing server.
Generate a secure secret:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

If .env does not exist, create it from the example:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
Copy-Item .env.example .env
```

Then open .env in a text editor and fill in the correct values.
Do NOT overwrite an existing .env that already has correct values.

### Farmer App .env (verified)

Location: Farmer-Procurement-App-main\Farmer-Procurement-App-main\.env

Contents:
```
VITE_API_URL=http://127.0.0.1:8000
```

### Admin/Officer App .env (verified)

Location: Admin-Procurement-Officer--main\Admin-Procurement-Officer--main\.env

Contents:
```
VITE_API_URL=http://localhost:8000
```

---

## 8. Start the Backend

Every time you start the backend, activate the virtual environment first.

Open a dedicated terminal and leave it open:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

ALWAYS use "python -m uvicorn" instead of just "uvicorn".
Using just "uvicorn" fails when it is not in your system PATH.

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Verify it is running:
- http://127.0.0.1:8000/docs    (Swagger UI)
- http://127.0.0.1:8000/health  (returns {"status": "ok"})

To stop: Press Ctrl+C in this terminal.

---

## 9. Start Each Frontend

### 9a. Farmer App

Terminal 2:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Farmer-Procurement-App-main\Farmer-Procurement-App-main"
npm run dev
```

Port: http://localhost:3000
Connects to backend at: http://127.0.0.1:8000

### 9b. Admin/Officer App

Terminal 3:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Admin-Procurement-Officer--main\Admin-Procurement-Officer--main"
npm run dev
```

Port: http://localhost:3001
This starts the Express + Vite server (tsx server.ts).
It serves its own API from JSON files. It does NOT use MongoDB.

Login credentials for this app:
- Admin: admin / Admin@123
- Officer: OFF001 / Officer@123

---

## 10. Correct Startup Order

Start services in this exact order:

1. MongoDB
   - Check: Get-Service MongoDB
   - If Stopped: Run "net start MongoDB" in Administrator PowerShell

2. Redis
   - Check: Test-NetConnection localhost -Port 6379
   - If not running: start Memurai service or run redis-server.exe

3. FastAPI Backend
   - cd KisanQueue_backend_starter\KisanQueue_backend
   - .venv\Scripts\activate
   - python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

4. Farmer App
   - cd Farmer-Procurement-App-main\Farmer-Procurement-App-main
   - npm run dev
   - Opens at http://localhost:3000

5. Admin/Officer App
   - cd Admin-Procurement-Officer--main\Admin-Procurement-Officer--main
   - npm run dev
   - Opens at http://localhost:3001

---

---

## 11. First-Time Initialization and Seed Data

### Database Standardization: `kisanqueue`

Both the active FastAPI backend and seed scripts are standardized to use:
- **MongoDB URI:** `mongodb://localhost:27017`
- **Database Name:** `kisanqueue`

### Canonical Seed Script: `seed.py`

**File:** `KisanQueue_backend_starter\KisanQueue_backend\seed.py`

#### Safe Idempotent Execution (Default)
The seed script has been engineered to be **safe and idempotent** using MongoDB upserts:
- Running `python seed.py` will insert or update missing admin, officer, crop, center, and demo farmer records without deleting active bookings, digital tokens, or procurement records.
- Running it multiple times will NOT create duplicate records.

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.\.venv\Scripts\activate
python seed.py
```

#### Clean Reset Mode (`--reset`)
If you specifically want to wipe all live bookings, receipts, and collections for a clean demo:

```powershell
python seed.py --reset
```

#### Verified Demo Credentials Seeded:
- **Admin Portal:** `admin` / `Admin@123`
- **Procurement Officer:** `OFF001` / `Officer@123`
- **Farmer Quick Login Accounts (password: `password123`):**
  - `MH-PUN-2026-0814` (Bhagyashri Patil, Pune)
  - `MH-PUN-2026-1102` (Ramesh Balasaheb Jadhav, Pune)
  - `MH-SAT-2026-4421` (Suresh Narayan More, Satara)
  - `MH-NAS-2026-7789` (Ananda Tukaram Deshmukh, Nashik)
  - `MH-PUN-2026-2390` (Sunita Dnyaneshwar Shinde, Pune)
- **Legacy Test Farmer:** `FR001` / `Password123`

---

## 12. CORS Configuration

CORS controls which browser origins can call the FastAPI backend.

### Active Verified Configuration

File: `KisanQueue_backend_starter\KisanQueue_backend\app\main.py`

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- **Port 3000:** Farmer Procurement Web Application
- **Port 3001:** Admin & Procurement Officer Management Portal
- **Port 3002:** Alternate local port fallback for Vite dev server
- **Authorization header:** Explicitly allowed (`allow_headers=["*"]`)
- **Credentials:** Enabled (`allow_credentials=True`) with explicit origins (no wildcard combined with credentials)


### Why origins must be explicit, not "*"

When allow_credentials=True, browsers require the server to return a
specific origin in Access-Control-Allow-Origin.
Using ["*"] with allow_credentials=True violates browser security policy
and causes CORS errors.

### Adding another port (for example 3001)

Edit app/main.py and add it to allow_origins:

```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
],
```

The backend auto-reloads when you save the file because of --reload.

### Verify CORS in the browser

1. Open Chrome DevTools (F12) -> Network tab
2. Click a request to 127.0.0.1:8000
3. Click the Response Headers tab
4. Look for:
   access-control-allow-origin: http://localhost:3000
   access-control-allow-credentials: true

---

## 13. Authentication Troubleshooting

### How login works step by step

1. Farmer enters Farmer ID (e.g. MH-PUN-2026-0814) and password
2. Frontend POSTs to POST /auth/farmer/login
3. Backend checks password against hashed value in MongoDB
4. Backend returns: { access_token: "eyJ...", farmer: {...} }
5. Frontend stores token in localStorage under key kq_farmer_token
6. All API calls include header: Authorization: Bearer eyJ...
7. Backend validates the token on every protected route

### If you get 401 Unauthorized

Checklist:
- Is the farmer in MongoDB? Run seed.py if unsure.
- Are you using the correct password? (password123 for demo farmers)
- Is the token in localStorage?
  Open Chrome DevTools -> Application -> Local Storage -> http://localhost:3000
  Look for key kq_farmer_token - it should start with eyJ
- Has the token expired? Default is 60 minutes.
  Log out and log in again to get a fresh token.
- Is Authorization header being sent?
  Chrome DevTools -> Network -> failing request -> Headers -> Request Headers
  Look for: Authorization: Bearer eyJ...

### If login always fails

- Confirm backend is running: http://127.0.0.1:8000/health
- Confirm MongoDB is running and seeded
- Confirm MONGO_DB=kisanqueue in .env

### Token storage keys (verified from source code)

| App | Token key | User key |
|---|---|---|
| Farmer App | kq_farmer_token | kq_current_farmer |
| Admin/Officer App | kisanqueue_auth_token | kisanqueue_auth_user |

---

## 14. MongoDB Troubleshooting

### Access is denied when running net start MongoDB

Cause: Not running as Administrator
Fix: Right-click PowerShell -> Run as Administrator -> net start MongoDB

### mongod is not recognized

Cause: MongoDB bin folder not in PATH
Fix (current session only):

```powershell
$env:PATH += ";C:\Program Files\MongoDB\Server\8.0\bin"
mongod --version
```

Replace 8.0 with your installed version number.
Check what versions are installed:

```powershell
Get-ChildItem "C:\Program Files\MongoDB\Server\"
```

### mongosh is not recognized

Same cause and fix as mongod above.
Alternative: use MongoDB Compass GUI instead.

### Connection refused on port 27017

Cause: MongoDB service is not running
Fix:

```powershell
Get-Service -Name "MongoDB"
```

If Stopped, open Administrator PowerShell and run:

```powershell
net start MongoDB
```

### Python MongoDB driver missing

Symptom: ModuleNotFoundError: No module named 'pymongo'
Fix:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.venv\Scripts\activate
pip install pymongo
```

### Incorrect MONGO_URI

Symptom: Backend starts but cannot read or write data
Fix: Check KisanQueue_backend\.env - must be exactly:
MONGO_URI=mongodb://localhost:27017
MONGO_DB=kisanqueue

---

## 15. Concurrency & Slot Locking (MongoDB Native)

### Why Redis is Not Needed:
MongoDB provides native, document-level ACID guarantees and atomic operations.
By utilizing atomic conditional updates (`db.slots.find_one_and_update`), double bookings are prevented completely at the database engine level with zero latency and zero external dependencies.

### Slot booking returns 409 Conflict:
- **Cause:** The slot has reached its maximum capacity (`booked_count >= capacity`).
- **Fix:** Choose a different date or time slot that has remaining availability.

### Concurrency Lock Inspection:
- Concurrency locks are stored in the MongoDB `slot_locks` collection.
- To view active locks in MongoDB:
  ```powershell
  # Using mongosh:
  mongosh kisanqueue --eval "db.slot_locks.find()"
  ```
- Locks can also be inspected and tested visually in the Admin Portal via the **Tech Stack & Concurrency** modal.

---

## 16. CORS and Frontend Troubleshooting

### Failed to fetch in browser console

Cause: Backend not running or wrong API URL in .env
Fix:
1. Visit http://127.0.0.1:8000/health to confirm backend is running
2. Check farmer app .env: VITE_API_URL=http://127.0.0.1:8000
3. Restart frontend (Ctrl+C then npm run dev) after editing .env

### No Access-Control-Allow-Origin header (CORS error)

Cause: Frontend origin not in allow_origins in app/main.py
Fix: Add your frontend port to allow_origins. See Section 12.

### 401 Unauthorized on API requests

Cause: Token not sent, token expired, or farmer not in database
Fix: See Section 13. Usually: log out and log in again.

### 404 Not Found

Cause: Wrong endpoint URL
Fix: Visit http://127.0.0.1:8000/docs to see all available routes.

### Port already in use

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
taskkill /PID <pid-number> /F
```

Replace <pid-number> with the number shown in the last column.

### Vite .env changes not taking effect

After editing any .env file, stop and restart the dev server.
Press Ctrl+C then run npm run dev again.

---

## 17. Testing Checklist

### MongoDB
- Get-Service MongoDB shows Status: Running
- Test-NetConnection localhost -Port 27017 shows TcpTestSucceeded: True
- MongoDB Compass connects to mongodb://localhost:27017
- Database kisanqueue is visible with its collections

### Redis
- Test-NetConnection localhost -Port 6379 shows TcpTestSucceeded: True
- redis-cli ping returns PONG (if redis-cli is available)

### Backend
- http://127.0.0.1:8000/health returns {"status": "ok"}
- http://127.0.0.1:8000/docs shows Swagger UI with all routes

### Farmer Login
- Open http://localhost:3000
- Login with MH-PUN-2026-0814 / password123
- Dashboard loads with farmer name
- No 401 errors in Chrome DevTools Console

### Farmer Booking Flow
- Select Location -> Select Crop -> Select Center -> Available Slots
- Select a time slot -> Booking Confirmation page loads
- Enter quantity -> Click Confirm Booking
- Digital Token page appears with a KQ-YYYYMMDD-XXXXXX token
- GET http://127.0.0.1:8000/farmer/bookings returns 200 in DevTools

### Notifications
- Navigate to Notifications page
- No 401 errors appear
- Page shows No Notifications or a list

### Admin/Officer
- Open http://localhost:3001
- Login with admin / Admin@123 -> dashboard loads
- Login with OFF001 / Officer@123 -> officer dashboard loads
- Officer can verify a booking token
- Officer can confirm weighing and generate digital receipt
- System Tech Stack modal displays live MongoDB & Redis architecture

### Automated End-to-End Verification (All 34 Tests)

To automatically verify the entire system without clicking through the browser:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.\.venv\Scripts\activate
python test_e2e.py
```

Expected result:
```
============================================================
TEST RESULTS SUMMARY: 34 PASSED, 0 FAILED
============================================================
ALL TESTS PASSED SUCCESSFULLY!
```

---

## 18. One-Command Startup Option

A startup script is included at the project root.

Location: C:\Users\user\OneDrive\Desktop\sihf\sih\start-kisanqueue.ps1

How to run:

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih"
.\start-kisanqueue.ps1
```

If you see "running scripts is disabled on this system", run this once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again.

What the script does:
- Checks if MongoDB is running (does not attempt to start it)
- Checks if Redis is reachable on port 6379
- Checks that node_modules is installed for each frontend
- Checks that .venv exists for the backend
- Opens three separate PowerShell windows:
  Window 1: FastAPI backend
  Window 2: Farmer App
  Window 3: Admin/Officer App

What the script does NOT do:
- Does NOT start MongoDB (requires Administrator)
- Does NOT start Redis (depends on your installation)
- Does NOT run seed.py
- Does NOT install npm packages
- Does NOT delete any data

---

## 19. Shutdown Instructions

### Stop frontends and backend

In each terminal, press Ctrl+C.
This safely stops Vite and Uvicorn without affecting MongoDB or Redis.

### Stop Redis (if you started it manually)

If redis-server is running in a terminal: press Ctrl+C in that terminal.
If Memurai runs as a Windows service: no action needed, it stays running.

### Stop MongoDB

Do not stop MongoDB unless necessary. It is a Windows service.
Stopping requires Administrator PowerShell:

```powershell
net stop MongoDB
```

MongoDB data is preserved when the service stops and restarts.

---

## 20. Common Commands Reference

### Start the project every day

Terminal 1 (Backend):
```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Farmer App):
```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Farmer-Procurement-App-main\Farmer-Procurement-App-main"
npm run dev
```

Terminal 3 (Admin/Officer App):
```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Admin-Procurement-Officer--main\Admin-Procurement-Officer--main"
npm run dev
```

### Check all services

```powershell
Get-Service -Name "MongoDB"
Test-NetConnection -ComputerName localhost -Port 27017
Test-NetConnection -ComputerName localhost -Port 6379
Test-NetConnection -ComputerName localhost -Port 8000
```

### Seed the database (WARNING: deletes all bookings)

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.venv\Scripts\activate
python seed.py
```

### Install backend dependencies

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\KisanQueue_backend_starter\KisanQueue_backend"
.venv\Scripts\activate
pip install -r requirements.txt
```

### Install frontend dependencies

```powershell
cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Farmer-Procurement-App-main\Farmer-Procurement-App-main"
npm install

cd "C:\Users\user\OneDrive\Desktop\sihf\sih\Admin-Procurement-Officer--main\Admin-Procurement-Officer--main"
npm install
```

### URLs at a glance

| Service | URL |
|---|---|
| FastAPI Backend | http://127.0.0.1:8000 |
| FastAPI Swagger Docs | http://127.0.0.1:8000/docs |
| FastAPI Health Check | http://127.0.0.1:8000/health |
| Farmer App | http://localhost:3000 |
| Admin/Officer App | http://localhost:3001 |

### Demo credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | Admin@123 |
| Officer | OFF001 | Officer@123 |
| Farmer | MH-PUN-2026-0814 | password123 |
| Farmer | MH-PUN-2026-1102 | password123 |
| Farmer | MH-SAT-2026-4421 | password123 |
| Farmer | MH-NAS-2026-7789 | password123 |
| Farmer | MH-PUN-2026-2390 | password123 |
| Farmer (legacy) | FR001 | Password123 |

---

Guide created: 17 October 2026
Based on actual inspection of all project files.
