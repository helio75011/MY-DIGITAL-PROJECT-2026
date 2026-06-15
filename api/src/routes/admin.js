const path = require('path');
const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

/**
 * GET /admin  — page web du dashboard (HTML statique).
 * Le navigateur s'authentifie via /auth/login (compte ADMIN) puis appelle
 * /admin/incidents avec le token. Pas d'auth sur la page elle-même.
 */
router.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'dashboard.html'));
});

/**
 * GET /admin/incidents  (ADMIN)  — liste des incidents (SOS en priorité),
 * avec le rapporteur et le trajet associé.
 */
router.get('/admin/incidents', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         i.incident_ref                              AS ref,
         i.inc_type_code                             AS type,
         i.description,
         i.is_resolved                               AS resolved,
         i.\`timestamp\`                              AS at,
         CONCAT(u.first_name, ' ', u.last_name)      AS reporter,
         u.phone                                     AS reporterPhone,
         i.ride_ref                                  AS rideRef,
         r.start_point                               AS startPoint,
         r.end_point                                 AS endPoint
       FROM incident i
       JOIN app_user u ON u.user_id = i.reporter_id
       LEFT JOIN ride r ON r.ride_ref = i.ride_ref
       ORDER BY i.is_resolved ASC, i.\`timestamp\` DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /admin/incidents/:ref/resolve  (ADMIN) — marque un incident traité.
 */
router.post('/admin/incidents/:ref/resolve', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE incident SET is_resolved = TRUE WHERE incident_ref = :ref',
      { ref: req.params.ref }
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'incident_not_found' });
    }
    res.json({ ref: req.params.ref, resolved: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/users  (ADMIN) — liste des utilisateurs pour la modération
 * (validation KYC + bannissement). Les non-vérifiés et bannis remontent en tête.
 */
router.get('/admin/users', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.user_id                              AS id,
         CONCAT(u.first_name, ' ', u.last_name) AS name,
         u.email,
         u.phone,
         u.role_code                            AS role,
         u.is_verified                          AS verified,
         u.is_banned                            AS banned,
         (SELECT COUNT(*) FROM documents d WHERE d.user_id = u.user_id) AS docCount
       FROM app_user u
       WHERE u.role_code <> 'ADMIN'
       ORDER BY u.is_banned DESC, u.is_verified ASC, u.user_id ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /admin/users/:id/verify   (ADMIN) — valide (ou refuse) le KYC.
 * Body : { verified: boolean }
 */
router.post('/admin/users/:id/verify', requireAuth, requireAdmin, async (req, res, next) => {
  const verified = req.body?.verified !== false; // true par défaut
  try {
    const [result] = await pool.query(
      'UPDATE app_user SET is_verified = :verified WHERE user_id = :id AND role_code <> \'ADMIN\'',
      { verified: verified ? 1 : 0, id: req.params.id }
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    res.json({ id: Number(req.params.id), verified });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /admin/users/:id/ban   (ADMIN) — bannit (ou réactive) un utilisateur.
 * Body : { banned: boolean }
 */
router.post('/admin/users/:id/ban', requireAuth, requireAdmin, async (req, res, next) => {
  const banned = req.body?.banned !== false; // true par défaut
  try {
    const [result] = await pool.query(
      'UPDATE app_user SET is_banned = :banned WHERE user_id = :id AND role_code <> \'ADMIN\'',
      { banned: banned ? 1 : 0, id: req.params.id }
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    res.json({ id: Number(req.params.id), banned });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
