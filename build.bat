@echo off
echo ========================================
echo Building Time Tracker Application
echo ========================================
echo.

cd apps\backend

echo Building .NET project (will automatically build React frontend)...
dotnet build --configuration Release

echo.
echo Build complete!
echo.
pause
