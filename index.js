const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGODB_URL ||
  process.env.DATABASE_URL ||
  process.env.MONGO_PRIVATE_URL;

if (!MONGO_URL) {
  console.error('ERROR: No MongoDB connection string found.');
  console.error('Checked: MONGO_URL, MONGODB_URL, DATABASE_URL, MONGO_PRIVATE_URL');
  console.error('Available env vars:', Object.keys(process.env).filter(k => /mongo|db|database/i.test(k)));
  process.exit(1);
}

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

// Schema
const Item = mongoose.model('Item', new mongoose.Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}));

// GET all items
app.get('/items', async (req, res) => {
  const items = await Item.find().sort({ created_at: -1 });
  res.json(items.map(i => ({ id: i._id, name: i.name, created_at: i.created_at })));
});

// POST new item
app.post('/items', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const item = await Item.create({ name });
  res.status(201).json({ id: item._id, name: item.name });
});

// DELETE item
app.delete('/items/:id', async (req, res) => {
  const result = await Item.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
