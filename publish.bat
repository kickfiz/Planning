@echo off
echo ========================================
echo Publishing Time Tracker Application
echo ========================================
echo.

cd apps\backend

echo Publishing .NET project for IIS deployment...
dotnet publish --configuration Release --output C:\Apps\Planning

pause
