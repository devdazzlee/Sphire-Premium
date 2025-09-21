@echo off
echo Starting Complete E-commerce Platform...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Application...
start "Frontend App" cmd /k "cd Frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Admin Dashboard...
start "Admin Dashboard" cmd /k "cd Dashboard && npm run dev"

echo.
echo All services are starting up...
echo.
echo Frontend: http://localhost:3000
echo Dashboard: http://localhost:3001
echo Backend API: http://localhost:5000/api
echo.
echo Default Admin Login:
echo Email: admin@luxurybeauty.com
echo Password: admin123
echo.
echo Press any key to exit...
pause > nul
