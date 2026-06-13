const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { signToken } = require('../auth/jwt');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

// Valeurs par défaut à l'inscription (le tunnel KYC les affinera plus tard).
const DEFAULT_ROLE = 'PASSENGER';
const DEFAULT_ZIP = '75001';

// Met en forme une ligne app_user pour l'app (jamais le hash du mot de passe).
function toPublicUser(row) {
  return {
    id: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone || null,
    isVerified: !!row.is_verified,
    role: row.role_code,
  };
}

/**
 * POST /auth/register
 * Body : { email, password, firstName, lastName, phone? }
 * Crée une passagère (is_verified = FALSE) et renvoie un token.
 */
router.post('/register', async (req, res, next) => {
  const { email, password, firstName, lastName, phone } = req.body || {};

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  if (!String(email).includes('@')) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'weak_password' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT user_id FROM app_user WHERE email = :email',
      { email }
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'email_taken' });
    }

    const hash = await bcrypt.hash(String(password), 10);

    const [result] = await pool.query(
      `INSERT INTO app_user
         (email, password, last_name, first_name, phone, is_verified, role_code, zip_code)
       VALUES
         (:email, :password, :lastName, :firstName, :phone, FALSE, :role, :zip)`,
      {
        email,
        password: hash,
        lastName,
        firstName,
        phone: phone || null,
        role: DEFAULT_ROLE,
        zip: DEFAULT_ZIP,
      }
    );

    const user = {
      user_id: result.insertId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      is_verified: false,
      role_code: DEFAULT_ROLE,
    };

    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Body : { email, password }
 * Renvoie un token si les identifiants sont valides.
 */
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT user_id, email, password, first_name, last_name, phone, is_verified, role_code
       FROM app_user WHERE email = :email`,
      { email }
    );

    const user = rows[0];
    // Message identique que l'email existe ou non : on ne révèle rien.
    const ok = user && (await bcrypt.compare(String(password), user.password));
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me  (protégé)
 * Renvoie l'utilisateur courant (réhydrate la session au lancement de l'app).
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, email, first_name, last_name, phone, is_verified, role_code
       FROM app_user WHERE user_id = :userId`,
      { userId: req.userId }
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
