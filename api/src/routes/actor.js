const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

// Réserve ces routes aux acteurs (accompagnatrice / chauffeur).
function requireActor(req, res, next) {
  if (req.userRole !== 'GUARDIAN' && req.userRole !== 'DRIVER') {
    return res.status(403).json({ error: 'not_an_actor' });
  }
  next();
}
router.use(requireActor);

/**
 * GET /actor/requests
 * Trajets en recherche d'un acteur (status 'searching'), non encore réservés.
 */
router.get('/actor/requests', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.ride_ref                              AS rideRef,
         r.start_point                           AS startPoint,
         r.end_point                             AS endPoint,
         r.distance,
         r.estimated_time                        AS estimatedTime,
         r.creation_date                         AS createdAt,
         CONCAT(u.first_name, ' ', u.last_name)  AS passenger
       FROM ride r
       JOIN app_user u ON u.user_id = r.passenger_id
       WHERE r.status = 'searching'
         AND NOT EXISTS (SELECT 1 FROM booking b WHERE b.ride_ref = r.ride_ref)
       ORDER BY r.creation_date DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /actor/requests/:ref/accept
 * L'acteur accepte une course : crée le booking et passe le trajet en 'ongoing'.
 */
router.post('/actor/requests/:ref/accept', async (req, res, next) => {
  const rideRef = req.params.ref;
  // Option selon le rôle (cohérent avec le matching côté passagère).
  const option = req.userRole === 'DRIVER' ? 'premium' : 'solidaire';

  const conn = await pool.getConnection();
  try {
    const [[ride]] = await conn.query(
      'SELECT status FROM ride WHERE ride_ref = :rideRef',
      { rideRef }
    );
    if (!ride) return res.status(404).json({ error: 'ride_not_found' });
    if (ride.status !== 'searching') {
      return res.status(409).json({ error: 'ride_not_available' });
    }
    const [existing] = await conn.query(
      'SELECT 1 FROM booking WHERE ride_ref = :rideRef LIMIT 1',
      { rideRef }
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'already_taken' });
    }

    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO booking (user_id, ride_ref, \`option\`, applied_price, is_sponsored)
       VALUES (:me, :rideRef, :option, 0, FALSE)`,
      { me: req.userId, rideRef, option }
    );
    await conn.query("UPDATE ride SET status = 'ongoing' WHERE ride_ref = :rideRef", { rideRef });
    await conn.commit();

    res.status(201).json({ rideRef, status: 'ongoing' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

/**
 * GET /actor/rides
 * Trajets pris en charge par l'acteur connecté (en cours puis passés).
 */
router.get('/actor/rides', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.ride_ref                              AS rideRef,
         r.start_point                           AS startPoint,
         r.end_point                             AS endPoint,
         r.status,
         r.creation_date                         AS createdAt,
         CONCAT(u.first_name, ' ', u.last_name)  AS passenger
       FROM booking b
       JOIN ride r     ON r.ride_ref = b.ride_ref
       JOIN app_user u ON u.user_id  = r.passenger_id
       WHERE b.user_id = :me
       ORDER BY FIELD(r.status, 'ongoing', 'searching', 'completed', 'cancelled'),
                r.creation_date DESC`,
      { me: req.userId }
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /actor/vehicle  — véhicule de l'acteur (chauffeur). null s'il n'en a pas.
 */
router.get('/actor/vehicle', async (req, res, next) => {
  try {
    const [[v]] = await pool.query(
      `SELECT vehicle_id AS id, plate_number AS plate, brand, model, color, year, veh_type_code AS type
       FROM vehicle WHERE user_id = :me`,
      { me: req.userId }
    );
    res.json(v || null);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /actor/vehicle  — crée ou met à jour le véhicule de l'acteur.
 * Body : { plate, brand, model, color, year, type? }
 */
router.put('/actor/vehicle', async (req, res, next) => {
  const { plate, brand, model, color, year, type } = req.body || {};
  if (!plate) return res.status(400).json({ error: 'missing_plate' });
  const vehType = ['SEDAN', 'CITY', 'VAN'].includes(type) ? type : 'SEDAN';

  try {
    const [[existing]] = await pool.query(
      'SELECT vehicle_id FROM vehicle WHERE user_id = :me',
      { me: req.userId }
    );

    if (existing) {
      await pool.query(
        `UPDATE vehicle SET plate_number = :plate, brand = :brand, model = :model,
           color = :color, year = :year, veh_type_code = :vehType
         WHERE user_id = :me`,
        { plate, brand, model, color, year: year || null, vehType, me: req.userId }
      );
    } else {
      await pool.query(
        `INSERT INTO vehicle (plate_number, brand, model, color, year, user_id, veh_type_code)
         VALUES (:plate, :brand, :model, :color, :year, :me, :vehType)`,
        { plate, brand, model, color, year: year || null, me: req.userId, vehType }
      );
    }
    res.json({ saved: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
