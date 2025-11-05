# Time Tracker - Deployment Guide

This guide explains how to run your Time Tracker application in production mode on your Windows PC, including setting it up to run automatically on startup.

## Table of Contents
- [Quick Start (Manual)](#quick-start-manual)
- [Windows Service (Auto-start on Boot)](#windows-service-auto-start-on-boot)
- [Alternative: Task Scheduler](#alternative-task-scheduler)
- [Accessing the Application](#accessing-the-application)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Manual)

To run the application in production mode manually:

### 1. Build the Application
```bash
npm run build
```

This will:
- Compile the TypeScript backend to JavaScript
- Build the React frontend for production

### 2. Start the Production Server
```bash
npm run start
```

Or use the batch file:
```bash
start-production.bat
```

The application will be available at: http://localhost:3001

**Note:** This method requires you to manually start the app each time you restart your PC.

---

## Windows Service (Auto-start on Boot)

The recommended way to run the application permanently is as a Windows Service. This ensures the app starts automatically when Windows boots.

### Prerequisites
- Node.js installed
- Administrator privileges

### Installation Steps

#### 1. Build the Application (First Time Only)
```bash
npm run build
```

#### 2. Install as Windows Service

**Right-click** `install-service.bat` and select **"Run as administrator"**

This will:
- Install `node-windows` package globally (if needed)
- Create a Windows Service named "TimeTrackerApp"
- Start the service automatically
- Configure it to start on Windows boot

#### 3. Verify Installation

Open Task Manager → Services tab → Look for "TimeTrackerApp"

Or use Command Prompt:
```bash
sc query TimeTrackerApp
```

### Managing the Service

#### View Service Status
- Open Windows Services: Press `Win + R`, type `services.msc`, press Enter
- Find "TimeTrackerApp" in the list

#### Start/Stop/Restart
In the Services window:
- Right-click "TimeTrackerApp"
- Select Start, Stop, or Restart

Or use Command Prompt (as Administrator):
```bash
# Stop
sc stop TimeTrackerApp

# Start
sc start TimeTrackerApp
```

#### Uninstall Service

**Right-click** `uninstall-service.bat` and select **"Run as administrator"**

---

## Alternative: Task Scheduler

If you prefer not to use a Windows Service, you can use Task Scheduler:

### 1. Create a VBS Script (Silent Startup)

Create `start-hidden.vbs`:
```vbs
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & """ && start-production.bat", 0, False
```

### 2. Configure Task Scheduler

1. Open Task Scheduler: `Win + R` → type `taskschd.msc`
2. Click "Create Basic Task"
3. Name: "Time Tracker App"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program/script: Browse to `start-hidden.vbs`
7. Finish

---

## Accessing the Application

Once running (either as service or manually):

**Open your browser and navigate to:**
```
http://localhost:3001
```

The backend API is also accessible at:
```
http://localhost:3001/api/
```

API Health Check:
```
http://localhost:3001/api/health
```

---

## Troubleshooting

### Service Won't Start

1. **Check if port 3001 is in use:**
   ```bash
   netstat -ano | findstr :3001
   ```

2. **View service logs:**
   - Navigate to: `C:\ProgramData\node-windows\TimeTrackerApp\`
   - Check `TimeTrackerApp.err.log` and `TimeTrackerApp.out.log`

3. **Test manually first:**
   ```bash
   npm run build
   npm run start
   ```

### Database Issues

The SQLite database is located at:
```
<project-root>/timetracker.db
```

Ensure the backend process has read/write permissions to this directory.

### Port Conflicts

To change the port, edit `backend\src\index.ts`:
```typescript
const PORT = process.env.PORT || 3001; // Change 3001 to your desired port
```

Then rebuild:
```bash
npm run build
```

### Firewall Issues

If accessing from other devices on your network:
1. Open Windows Defender Firewall
2. Advanced Settings → Inbound Rules → New Rule
3. Port → TCP → 3001
4. Allow the connection
5. Apply to all profiles

---

## Updating the Application

When you make changes to the code:

### 1. Stop the Service (if running)
```bash
sc stop TimeTrackerApp
```

### 2. Rebuild
```bash
npm run build
```

### 3. Restart the Service
```bash
sc start TimeTrackerApp
```

Or if running manually, just restart `start-production.bat`

---

## Production Checklist

- [ ] Application builds without errors (`npm run build`)
- [ ] Backend starts successfully (`npm run start`)
- [ ] Frontend loads at http://localhost:3001
- [ ] API endpoints respond correctly
- [ ] Database is accessible and writable
- [ ] Service installs and starts automatically (if using service method)
- [ ] Application survives system restart

---

## Additional Notes

### Development vs Production

- **Development** (`npm run dev`): Hot reload, verbose logging, separate frontend/backend servers
- **Production** (`npm run start`): Optimized build, single server, frontend served as static files

### Environment Variables

Create a `.env` file in the `backend` directory for production settings:
```
NODE_ENV=production
PORT=3001
```

### Security Considerations

For local use only:
- Default configuration is secure for localhost access
- CORS is enabled for development convenience

For network access:
- Consider adding authentication
- Use HTTPS with a reverse proxy (nginx, IIS)
- Restrict CORS to specific origins
- Keep Windows Firewall enabled

---

## Support

For issues or questions:
1. Check the logs (if using Windows Service)
2. Run manually to see console output
3. Check that all dependencies are installed
4. Ensure Node.js is up to date

Good luck! Your Time Tracker app should now be running 24/7 on your PC.
