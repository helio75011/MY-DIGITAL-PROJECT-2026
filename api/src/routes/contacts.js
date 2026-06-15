const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

/** GET /contacts — contacts d'urgence de l'utilisateur connecté. */
router.get('/contacts', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT contact_id AS id, name, phone
       FROM emergency_contact WHERE user_id = :me ORDER BY contact_id`,
      { me: req.userId }
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/** POST /contacts — ajoute un contact { name, phone }. */
router.post('/contacts', async (req, res, next) => {
  const { name, phone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO emergency_contact (user_id, name, phone) VALUES (:me, :name, :phone)',
      { me: req.userId, name: String(name).slice(0, 100), phone: String(phone).slice(0, 20) }
    );
    res.status(201).json({ id: result.insertId, name, phone });
  } catch (err) {
    next(err);
  }
});

/** DELETE /contacts/:id — supprime un contact (s'il appartient à l'utilisateur). */
router.delete('/contacts/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM emergency_contact WHERE contact_id = :id AND user_id = :me',
      { id: req.params.id, me: req.userId }
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'contact_not_found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
