const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

/**
 * POST /ratings
 * Body : { ratedId, rating, comment? }
 * La passagère connectée note un acteur (1..5). Une seule note par paire
 * (rater, rated) : une nouvelle note écrase la précédente (upsert).
 */
router.post('/ratings', async (req, res, next) => {
  const { ratedId, rating, comment } = req.body || {};
  const value = Number(rating);

  if (!ratedId || !Number.isInteger(value)) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  if (value < 1 || value > 5) {
    return res.status(400).json({ error: 'invalid_rating' });
  }
  if (Number(ratedId) === req.userId) {
    return res.status(400).json({ error: 'cannot_rate_self' });
  }

  try {
    // Vérifie que l'acteur noté a bien accompagné un trajet de cette passagère.
    const [[link]] = await pool.query(
      `SELECT 1 FROM booking b
       JOIN ride r ON r.ride_ref = b.ride_ref
       WHERE r.passenger_id = :me AND b.user_id = :ratedId
       LIMIT 1`,
      { me: req.userId, ratedId }
    );
    if (!link) {
      return res.status(403).json({ error: 'no_shared_ride' });
    }

    // Upsert : insère, ou met à jour la note/commentaire si la paire existe déjà.
    await pool.query(
      `INSERT INTO driver_rating (rater_id, rated_id, driver_rating, driver_comment)
       VALUES (:me, :ratedId, :value, :comment)
       ON DUPLICATE KEY UPDATE driver_rating = :value, driver_comment = :comment`,
      { me: req.userId, ratedId, value, comment: comment || null }
    );

    // Renvoie la nouvelle note moyenne de l'acteur (cohérent avec le matching).
    const [[agg]] = await pool.query(
      `SELECT ROUND(AVG(driver_rating), 1) AS avg, COUNT(*) AS count
       FROM driver_rating WHERE rated_id = :ratedId`,
      { ratedId }
    );

    res.status(201).json({ rated: true, average: agg.avg, count: agg.count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
