@echo off
echo 🚀 Starting Backend Deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI is not installed. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo Please create a .env file with your environment variables before deploying.
    echo See DEPLOYMENT.md for required variables.
    set /p continue="Continue anyway? (y/N): "
    if /i not "%continue%"=="y" exit /b 1
)

REM Deploy to Vercel
echo 📦 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🔗 Check your Vercel dashboard for the deployment URL
echo 📋 Don't forget to set environment variables in Vercel dashboard
echo 📖 See DEPLOYMENT.md for post-deployment steps
pause
