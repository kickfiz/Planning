# Time Tracker Application

A modern time tracking application built with React and Node.js, migrated from Blazor.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript**
- **SQLite** with better-sqlite3
- **CORS** enabled

## Features

- ⏱️ **Time Entries**: Track your daily work hours with detailed descriptions
- 📊 **Reports**: View analytics with interactive charts showing hours over time
- 🏷️ **Categories**: Organize your work with color-coded categories
- 📈 **Analytics**: Monthly and annual views of your productivity
- 🎨 **Dark Theme**: Easy on the eyes with a modern dark interface

## Project Structure

```
Planning/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # TypeScript types
│   │   ├── database.ts     # Database initialization
│   │   └── index.ts        # Server entry point
│   └── package.json
├── react-timetracker/      # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api.ts          # API client
│   │   └── types.ts        # TypeScript types
│   └── package.json
└── timetracker.db          # SQLite database (shared)
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd Planning
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../react-timetracker
   npm install
   ```

### Running the Application

You'll need to run both the backend and frontend servers:

1. **Start the backend server** (in the `backend` directory):
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server** (in the `react-timetracker` directory):
   ```bash
   cd react-timetracker
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## API Endpoints

### Time Entries
- `GET /api/time-entries/month/:year/:month` - Get entries by month
- `POST /api/time-entries` - Create a new entry
- `PUT /api/time-entries/:id` - Update an entry
- `DELETE /api/time-entries/:id` - Delete an entry
- `GET /api/time-entries/statistics/:year/:month` - Get monthly statistics
- `GET /api/time-entries/annual/:year` - Get annual hours
- `GET /api/time-entries/monthly/:year/:month` - Get monthly hours by day

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/active` - Get active categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `POST /api/categories/:id/archive` - Archive a category
- `POST /api/categories/:id/unarchive` - Unarchive a category
- `DELETE /api/categories/:id` - Delete a category
- `GET /api/categories/distribution` - Get category distribution

## Database

The application uses SQLite with the existing `timetracker.db` database. The database contains two main tables:

- **TimeEntries**: Stores time log entries with date, hours, description, and category
- **Categories**: Stores category definitions with name, color, and archived status

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd react-timetracker
npm run build
```

The production build will be in the `dist` directory.

## License

See license.txt for details.
