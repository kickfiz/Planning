@echo off
echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo All Node.js processes have been terminated.
) else (
    echo No Node.js processes were running.
)
pause
