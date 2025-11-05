# Time Tracker Application

A full-stack time tracking application with React frontend and .NET 9 backend, ready for IIS deployment.

## 🏗️ Architecture

- **Backend**: ASP.NET Core 9 Web API with Entity Framework Core + SQLite
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Deployment**: Single-server deployment where .NET serves both API and React app from wwwroot

## 📁 Project Structure

```
Planning/
├── apps/
│   ├── backend/              # .NET Web API
│   │   ├── Controllers/      # API Controllers
│   │   ├── Data/            # DbContext
│   │   ├── Models/          # Entity models
│   │   ├── Program.cs       # App configuration
│   │   └── wwwroot/         # React build output (auto-generated)
│   └── frontend/            # React SPA
│       ├── src/             # React source code
│       └── vite.config.ts  # Builds to ../backend/wwwroot
├── data/                    # SQLite database
│   └── timetracker.db
├── docs/                    # Documentation
├── build.bat               # Build script
└── publish.bat             # IIS publish script
```

## 🚀 Quick Start

### Development

**Terminal 1 - Backend:**
```bash
cd apps/backend
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm install    # First time only
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
build.bat
```

### Deploy to IIS

```bash
publish.bat
```

Then copy the `publish/` folder to your IIS website directory.

## 🎯 Key Features

- ✅ Track time entries with dates and hours
- ✅ Categorize tasks with custom colors
- ✅ Monthly/yearly filtering
- ✅ Quick category creation
- ✅ Edit and delete entries
- ✅ Responsive dark theme UI
- ✅ Single command build and deployment

## 🛠️ Tech Stack

**Backend:** ASP.NET Core 9, Entity Framework Core, SQLite
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router

## 📡 API Endpoints

- `GET/POST /api/time-entries` - Time entries
- `GET /api/time-entries/month/{year}/{month}` - Monthly entries
- `GET/POST /api/categories` - Categories management

Swagger UI available at `/swagger` in development mode.

## 🚀 IIS Deployment

1. Run `publish.bat`
2. Install [ASP.NET Core 9 Runtime](https://dotnet.microsoft.com/download/dotnet/9.0) on server
3. Copy `publish/` folder contents to IIS website directory
4. Set Application Pool to "No Managed Code"
5. Ensure write permissions on `data/` folder
6. Restart IIS

## 🔧 How It Works

1. **Build Process**: When you build the .NET backend, it automatically runs `npm install` and `npm run build` in the frontend folder
2. **Frontend Output**: React app builds directly into `apps/backend/wwwroot`
3. **Single Server**: .NET backend serves both the API (`/api/*`) and the React app from wwwroot
4. **Client Routing**: The `MapFallbackToFile` ensures React Router works correctly

## 📝 Configuration

### Backend Port
Check `apps/backend/Properties/launchSettings.json`

### Frontend Proxy
In development, frontend proxies `/api` to backend. Update `apps/frontend/vite.config.ts` if needed.

### Database Location
Configure in `apps/backend/Program.cs` if you need to change the database path.

## 🐛 Troubleshooting

**Build fails with "file is locked"**: Stop all running instances of the backend

**React app doesn't update**: Run `npm run build` in the frontend folder manually

**Database errors**: Ensure the `data/` folder exists and has write permissions

---

For detailed documentation, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
