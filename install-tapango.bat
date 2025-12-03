@echo off
REM Tapan Go Production Upgrade - Windows Installation Script
SETLOCAL EnableDelayedExpansion

echo.
echo ==============================================================
echo    Tapan Go Production Upgrade - Installation
echo ==============================================================
echo.

echo Step 1: Installing Core Dependencies...
echo.

call npm install @tanstack/react-table @tanstack/react-query

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Core dependencies installed!
echo.

echo ==============================================================
echo    Optional Dependencies
echo ==============================================================
echo.
echo The following packages are optional but recommended:
echo.
echo   - bullmq ioredis         (Background job queue)
echo   - @upstash/ratelimit     (Rate limiting)
echo   - @upstash/redis         (Redis client)
echo   - twilio                 (WhatsApp notifications)
echo.
echo To install optional packages, run:
echo   npm install bullmq ioredis @upstash/ratelimit @upstash/redis twilio
echo.

echo ==============================================================
echo    Next Steps
echo ==============================================================
echo.
echo 1. Set up environment variables in .env.local
echo 2. Run database migration in Supabase SQL Editor
echo    File: supabase\migrations\20251201_add_role_and_rls.sql
echo 3. Set admin user:
echo    UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
echo 4. Start dev server: npm run dev
echo.

echo ==============================================================
echo    Documentation
echo ==============================================================
echo.
echo  * START_HERE.md                     - Quick start
echo  * FINAL_IMPLEMENTATION_GUIDE.md     - Complete setup
echo  * USAGE_EXAMPLES.md                 - Code examples
echo.

echo [SUCCESS] Installation complete! Ready to launch!
echo.

pause
