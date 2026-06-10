require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const ridesRouter = require('./routes/rides');

const app = express();
app.use(cors());
app.use(express.json());

// Vérifie l'API + la connexion DB.
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(500).json({ status: 'ok', db: 'down' });
  }
});

app.use('/rides', ridesRouter);

// Gestion d'erreur centralisée.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Link & Walk API en écoute sur http://localhost:${PORT}`);
});
