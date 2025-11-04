import { Router } from 'express';
import db from '../database';
import { Category } from '../models/types';

const router = Router();

// Get all categories
router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM Categories ORDER BY IsArchived ASC, CreatedAt DESC');
  const categories = stmt.all();
  res.json(categories);
});

// Get active categories only
router.get('/active', (req, res) => {
  const stmt = db.prepare('SELECT * FROM Categories WHERE IsArchived = 0 ORDER BY CreatedAt DESC');
  const categories = stmt.all();
  res.json(categories);
});

// Create category
router.post('/', (req, res) => {
  const { Name, Color } = req.body;

  const stmt = db.prepare(`
    INSERT INTO Categories (Name, Color, IsArchived, CreatedAt)
    VALUES (?, ?, 0, datetime('now'))
  `);

  const result = stmt.run(Name, Color || '#10b981');

  res.json({ Id: result.lastInsertRowid, Name, Color: Color || '#10b981', IsArchived: false });
});

// Update category
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { Name, Color, IsArchived } = req.body;

  const stmt = db.prepare(`
    UPDATE Categories
    SET Name = ?, Color = ?, IsArchived = ?
    WHERE Id = ?
  `);

  stmt.run(Name, Color, IsArchived ? 1 : 0, id);

  res.json({ Id: id, Name, Color, IsArchived });
});

// Archive category
router.post('/:id/archive', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('UPDATE Categories SET IsArchived = 1 WHERE Id = ?');
  stmt.run(id);

  res.json({ success: true });
});

// Unarchive category
router.post('/:id/unarchive', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('UPDATE Categories SET IsArchived = 0 WHERE Id = ?');
  stmt.run(id);

  res.json({ success: true });
});

// Delete category
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM Categories WHERE Id = ?');
  stmt.run(id);

  res.json({ success: true });
});

// Get category distribution with colors
router.get('/distribution', (req, res) => {
  const { month, year } = req.query;

  let query = `
    SELECT
      COALESCE(c.Name, 'Uncategorized') as CategoryName,
      COALESCE(c.Color, '#6b7280') as Color,
      COALESCE(SUM(te.Hours), 0) as Hours
    FROM TimeEntries te
    LEFT JOIN Categories c ON te.CategoryId = c.Id
  `;

  const params: any[] = [];

  if (month && year) {
    query += ` WHERE strftime('%Y', te.Date) = ? AND strftime('%m', te.Date) = ?`;
    params.push(year, String(month).padStart(2, '0'));
  } else if (year) {
    query += ` WHERE strftime('%Y', te.Date) = ?`;
    params.push(year);
  }

  query += ` GROUP BY c.Id, c.Name, c.Color HAVING Hours > 0 ORDER BY Hours DESC`;

  const stmt = db.prepare(query);
  const distribution = stmt.all(...params);

  res.json(distribution);
});

export default router;
