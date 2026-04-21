const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('data.db');

app.use(express.json());

// Init table
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET all items
app.get('/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items').all();
  res.json(items);
});

// POST new item
app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const result = db.prepare('INSERT INTO items (name) VALUES (?)').run(name);
  res.status(201).json({ id: result.lastInsertRowid, name });
});

// DELETE item
app.delete('/items/:id', (req, res) => {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
