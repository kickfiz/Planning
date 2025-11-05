# Time Tracker Application

A full-stack time tracking application with React frontend and Node.js/Express backend.

## 📁 Project Structure

```
Planning/
├── apps/                      # Application code
│   ├── backend/              # Node.js/Express backend
│   │   ├── src/             # TypeScript source files
│   │   ├── dist/            # Compiled JavaScript (generated)
│   │   └── package.json
│   └── frontend/             # React frontend (Vite + TypeScript)
│       ├── src/             # React components and pages
│       ├── dist/            # Production build (generated)
│       └── package.json
├── data/                      # Database files
│   └── timetracker.db
├── docs/                      # Documentation
│   ├── README.md            # This file
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── license.txt
├── scripts/                   # Utility scripts
│   ├── dev/                 # Development scripts
│   │   ├── start-dev.bat
│   │   ├── start-dev.sh
│   │   └── kill-servers.bat
│   ├── production/          # Production scripts
│   │   └── start-production.bat
│   └── service/             # Windows service scripts
│       ├── install-service.bat
│       ├── install-service.js
│       ├── uninstall-service.bat
│       └── uninstall-service.js
├── package.json               # Root package.json
└── .gitignore

```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Planning
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   npm install --prefix apps/backend

   # Install frontend dependencies
   npm install --prefix apps/frontend
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API: http://localhost:3001
   - Frontend: http://localhost:5173

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start both backend and frontend
npm run dev:backend  # Start backend only
npm run dev:frontend # Start frontend only
```

### Production
```bash
npm run build        # Build both apps
npm run start        # Start production server
npm run prod         # Alias for start
```

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **better-sqlite3** - Database
- **CORS** - Cross-origin support

## 🗄 Database

The application uses SQLite for data storage. The database file is located at `data/timetracker.db`.

### Tables
- **Categories** - Task categories with colors
- **TimeEntries** - Time tracking entries

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy and run as a Windows service
- [License](docs/license.txt)

## 🎯 Features

- ✅ Track time entries with dates and hours
- ✅ Categorize tasks with custom colors
- ✅ Monthly/yearly filtering
- ✅ Quick category creation
- ✅ Edit and delete entries
- ✅ Responsive dark theme UI
- ✅ Windows service support (auto-start)

## 🔧 Development

### Project Commands

```bash
# Development
npm run dev                    # Start dev servers
npm run dev:backend           # Backend only (port 3001)
npm run dev:frontend          # Frontend only (port 5173)

# Build
npm run build                 # Build both apps
npm run build:backend         # Build backend
npm run build:frontend        # Build frontend

# Production
npm run start                 # Start production server
```

### File Structure

```
apps/backend/src/
├── database.ts              # Database initialization
├── index.ts                 # Server entry point
├── routes/
│   ├── timeEntries.ts      # Time entries endpoints
│   └── categories.ts       # Categories endpoints
└── ...

apps/frontend/src/
├── api/                     # API client
├── components/              # Reusable components
├── pages/                   # Page components
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
└── App.tsx                 # Root component
```

## 🚀 Deployment

For production deployment instructions, including how to set up as a Windows service, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

### Quick Production Setup

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

3. **Or install as Windows Service** (runs on startup)
   - Right-click `scripts/service/install-service.bat`
   - Select "Run as administrator"

## 📝 License

See [license.txt](docs/license.txt) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Made with ❤️ by André Vieira
