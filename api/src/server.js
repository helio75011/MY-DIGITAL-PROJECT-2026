require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRouter = require('./routes/auth');
const ridesRouter = require('./routes/rides');
const bookingsRouter = require('./routes/bookings');
const trackingRouter = require('./routes/tracking');
const safematchRouter = require('./routes/safematch');
const ratingsRouter = require('./routes/ratings');
const contactsRouter = require('./routes/contacts');
const adminRouter = require('./routes/admin');
const kycRouter = require('./routes/kyc');

const app = express();
app.use(cors());
app.use(express.json());

// Fichiers KYC uploadés, servis en statique (URL : /uploads/<fichier>).
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Vérifie l'API + la connexion DB.
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(500).json({ status: 'ok', db: 'down' });
  }
});

app.use('/auth', authRouter);
// Admin monté en premier : ses routes gèrent leur propre auth (la page /admin est
// publique). Les routeurs ci-dessous appliquent requireAuth globalement via
// router.use(), ce qui intercepterait /admin s'ils passaient avant.
app.use('/', adminRouter); // /admin (dashboard), /admin/incidents
app.use('/rides', ridesRouter);
app.use('/', bookingsRouter); // POST /rides, GET /matching, POST /bookings
app.use('/', trackingRouter); // /rides/:ref/track, /rides/:ref/complete, /incidents
app.use('/', safematchRouter); // /rides/:ref/safematch (+/confirm)
app.use('/', ratingsRouter); // POST /ratings
app.use('/', contactsRouter); // /contacts (CRUD)
app.use('/kyc', kycRouter);

// Gestion d'erreur centralisée.
app.use((err, _req, res, _next) => {
  // Erreurs d'upload (multer) -> 400 explicite.
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.message === 'invalid_file_type')) {
    return res.status(400).json({ error: err.message === 'invalid_file_type' ? 'invalid_file_type' : 'file_too_large' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Link & Walk API en écoute sur http://localhost:${PORT}`);
});
