@echo off
echo ================================
echo   Publishing Planning App
echo ================================
echo.

cd /d "%~dp0"

echo Publishing to: C:\Users\AndréVieira\OneDrive - Unipartner IT Services, S.A\André\Planning\PlanningApp
echo.

dotnet publish -c Release -o "C:/Users/AndréVieira/OneDrive - Unipartner IT Services, S.A/André/Planning/PlanningApp"

if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo   Publish Successful!
    echo ================================
    echo.
    echo Your app has been updated.
    echo Close and reopen the Planning app to see changes.
) else (
    echo.
    echo ================================
    echo   Publish Failed!
    echo ================================
    echo Check the errors above.
)

echo.
pause
