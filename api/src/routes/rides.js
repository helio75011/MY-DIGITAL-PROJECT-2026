const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

/**
 * GET /rides/history  (protégé)
 * Historique des trajets de la passagère connectée (déduite du token), avec
 * l'acteur (accompagnatrice / chauffeur), le mode et le tarif. Reconstitue les
 * champs attendus par l'écran HistoryScreen (name, kind, price, date, lieux, heures).
 */
router.get('/history', requireAuth, async (req, res, next) => {
  const passengerId = req.userId;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        r.ride_ref                                   AS id,
        CONCAT(u.first_name, ' ', u.last_name)       AS name,
        CASE WHEN b.\`option\` = 'solidaire' THEN 'walk'
             ELSE 'driver' END                       AS kind,
        b.applied_price                              AS price,
        DATE_FORMAT(r.creation_date, '%d/%m/%y')     AS date,
        r.start_point                                AS departurePlace,
        DATE_FORMAT(r.creation_date, '%HH%i')        AS departureTime,
        r.end_point                                  AS arrivalPlace,
        r.estimated_time                             AS estimatedMinutes
      FROM ride r
      JOIN booking  b ON b.ride_ref = r.ride_ref
      JOIN app_user u ON u.user_id  = b.user_id
      WHERE r.passenger_id = :passengerId
        AND r.status = 'completed'
      ORDER BY r.creation_date DESC
      `,
      { passengerId }
    );

    // Mise en forme : prix "24,50€" pour un chauffeur, null pour un accompagnement.
    const trips = rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      kind: row.kind,
      price:
        row.kind === 'driver'
          ? `${Number(row.price).toFixed(2).replace('.', ',')}€`
          : null,
      date: row.date,
      departurePlace: row.departurePlace,
      departureTime: row.departureTime,
      arrivalPlace: row.arrivalPlace,
    }));

    res.json(trips);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /rides/upcoming  (protégé)
 * Trajets planifiés à venir de la passagère connectée (status 'scheduled').
 */
router.get('/upcoming', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         ride_ref                                  AS id,
         start_point                               AS departurePlace,
         end_point                                 AS arrivalPlace,
         DATE_FORMAT(scheduled_at, '%d/%m/%y')     AS date,
         DATE_FORMAT(scheduled_at, '%Hh%i')        AS time
       FROM ride
       WHERE passenger_id = :passengerId AND status = 'scheduled'
       ORDER BY scheduled_at ASC`,
      { passengerId: req.userId }
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
