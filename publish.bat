@echo off
echo ========================================
echo Publishing Time Tracker Application
echo ========================================
echo.

cd apps\backend

echo Publishing .NET project for IIS deployment...
dotnet publish --configuration Release --output C:\Apps\Planning

echo.
echo ========================================
echo Publish complete!
echo ========================================
echo.
echo Output location: C:\Apps\Planning
echo.
echo To deploy to IIS:
echo 1. Copy the contents of the 'publish' folder to your IIS website directory
echo 2. Ensure the IIS Application Pool is set to "No Managed Code"
echo 3. Install the ASP.NET Core Runtime on the server if not already installed
echo 4. Restart IIS
echo.
pause
