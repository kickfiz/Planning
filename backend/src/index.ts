import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import timeEntriesRouter from './routes/timeEntries';
import categoriesRouter from './routes/categories';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/categories', categoriesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
