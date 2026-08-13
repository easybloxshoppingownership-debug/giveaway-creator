const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory store for giveaways (starter boilerplate — swap for a real DB in production)
const giveaways = [];
let nextId = 1;

app.get('/', (req, res) => {
  res.json({
    service: 'giveaway-creator',
    status: 'ok',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/giveaways', (req, res) => {
  res.json(giveaways);
});

app.get('/giveaways/:id', (req, res) => {
  const giveaway = giveaways.find((g) => g.id === Number(req.params.id));
  if (!giveaway) {
    return res.status(404).json({ error: 'Giveaway not found' });
  }
  res.json(giveaway);
});

app.post('/giveaways', (req, res) => {
  const { title, description, prize } = req.body || {};

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const giveaway = {
    id: nextId++,
    title,
    description: description || '',
    prize: prize || '',
    createdAt: new Date().toISOString(),
  };

  giveaways.push(giveaway);
  res.status(201).json(giveaway);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`giveaway-creator listening on port ${PORT}`);
});
