const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

/** GET /safe-zones — référentiel des zones sûres / bien éclairées. */
router.get('/safe-zones', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT zone_id AS id, name, city, level, latitude, longitude
       FROM safe_zone ORDER BY level DESC, name ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
