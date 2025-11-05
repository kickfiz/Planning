import { Router } from 'express';
import db from '../database';
import { TimeEntry } from '../models/types';

const router = Router();

// Get entries by month and year
router.get('/month/:year/:month', (req, res) => {
  const { year, month } = req.params;

  const stmt = db.prepare(`
    SELECT
      te.*,
      c.Id as Category_Id,
      c.Name as Category_Name,
      c.Color as Category_Color
    FROM TimeEntries te
    LEFT JOIN Categories c ON te.CategoryId = c.Id
    WHERE strftime('%Y', te.Date) = ? AND strftime('%m', te.Date) = ?
    ORDER BY te.Date DESC
  `);

  const rows = stmt.all(year, month.padStart(2, '0'));

  const entries = rows.map((row: any) => ({
    Id: row.Id,
    Date: row.Date,
    Hours: Number(row.Hours),
    Description: row.Description,
    CategoryId: row.CategoryId,
    Category: row.Category_Id ? {
      Id: row.Category_Id,
      Name: row.Category_Name,
      Color: row.Category_Color
    } : null
  }));

  res.json(entries);
});

// Create time entry
router.post('/', (req, res) => {
  const { Date, Hours, Description, CategoryId } = req.body;

  const stmt = db.prepare(`
    INSERT INTO TimeEntries (Date, Hours, Description, CategoryId)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(Date, Hours, Description, CategoryId || null);

  res.json({ Id: result.lastInsertRowid, Date, Hours, Description, CategoryId });
});

// Update time entry
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { Date, Hours, Description, CategoryId } = req.body;

  const stmt = db.prepare(`
    UPDATE TimeEntries
    SET Date = ?, Hours = ?, Description = ?, CategoryId = ?
    WHERE Id = ?
  `);

  stmt.run(Date, Hours, Description, CategoryId || null, id);

  res.json({ Id: id, Date, Hours, Description, CategoryId });
});

// Delete time entry
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM TimeEntries WHERE Id = ?');
  stmt.run(id);

  res.json({ success: true });
});

// Get monthly statistics
router.get('/statistics/:year/:month', (req, res) => {
  const { year, month } = req.params;

  const stmt = db.prepare(`
    SELECT
      COALESCE(SUM(Hours), 0) as TotalHours,
      COUNT(*) as TasksCompleted,
      COALESCE(AVG(Hours), 0) as AverageDailyHours
    FROM TimeEntries
    WHERE strftime('%Y', Date) = ? AND strftime('%m', Date) = ?
  `);

  const stats = stmt.get(year, month.padStart(2, '0')) as any;

  res.json({
    TotalHours: Number(stats.TotalHours),
    TasksCompleted: stats.TasksCompleted,
    AverageDailyHours: Number(stats.AverageDailyHours)
  });
});

// Get annual hours (by month)
router.get('/annual/:year', (req, res) => {
  const { year } = req.params;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const stmt = db.prepare(`
    SELECT
      CAST(strftime('%m', Date) AS INTEGER) as Month,
      COALESCE(SUM(Hours), 0) as Hours
    FROM TimeEntries
    WHERE strftime('%Y', Date) = ?
    GROUP BY Month
  `);

  const rows = stmt.all(year) as any[];

  // Only return months that have data
  const data = rows.map(row => ({
    MonthName: months[row.Month - 1],
    Hours: Number(row.Hours)
  }));

  res.json(data);
});

// Get monthly hours by day
router.get('/monthly/:year/:month', (req, res) => {
  const { year, month } = req.params;

  const stmt = db.prepare(`
    SELECT
      CAST(strftime('%d', Date) AS INTEGER) as Day,
      COALESCE(SUM(Hours), 0) as Hours
    FROM TimeEntries
    WHERE strftime('%Y', Date) = ? AND strftime('%m', Date) = ?
    GROUP BY Day
  `);

  const rows = stmt.all(year, month.padStart(2, '0')) as any[];

  const data = rows.map(row => ({
    Day: row.Day,
    Hours: Number(row.Hours)
  }));

  res.json(data);
});

export default router;
