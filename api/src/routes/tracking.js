const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

// Vérifie qu'un trajet existe et appartient à la passagère connectée.
async function loadOwnedRide(rideRef, userId) {
  const [[ride]] = await pool.query(
    'SELECT ride_ref, passenger_id, status FROM ride WHERE ride_ref = :rideRef',
    { rideRef }
  );
  return ride && ride.passenger_id === userId ? ride : null;
}

/**
 * POST /rides/:ref/track
 * Body : { latitude, longitude, type? } — enregistre un point de suivi.
 * type ∈ DEPARTURE | POSITION | ARRIVAL | ALERT (défaut POSITION).
 */
router.post('/rides/:ref/track', async (req, res, next) => {
  const rideRef = req.params.ref;
  const { latitude, longitude, type } = req.body || {};
  const trackType = ['DEPARTURE', 'POSITION', 'ARRIVAL', 'ALERT'].includes(type)
    ? type
    : 'POSITION';

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'missing_coords' });
  }

  try {
    const ride = await loadOwnedRide(rideRef, req.userId);
    if (!ride) return res.status(404).json({ error: 'ride_not_found' });

    // La PK inclut detection_time : NOW(3) évite les collisions en polling rapide.
    await pool.query(
      `INSERT INTO ride_track (ride_ref, track_type_code, detection_time, latitude, longitude)
       VALUES (:rideRef, :trackType, NOW(3), :lat, :lng)`,
      { rideRef, trackType, lat: latitude, lng: longitude }
    );

    res.status(201).json({ saved: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /rides/:ref/track
 * Liste les points de suivi d'un trajet (ordre chronologique).
 */
router.get('/rides/:ref/track', async (req, res, next) => {
  const rideRef = req.params.ref;
  try {
    const ride = await loadOwnedRide(rideRef, req.userId);
    if (!ride) return res.status(404).json({ error: 'ride_not_found' });

    const [rows] = await pool.query(
      `SELECT track_type_code AS type, detection_time AS at, latitude, longitude
       FROM ride_track WHERE ride_ref = :rideRef
       ORDER BY detection_time ASC`,
      { rideRef }
    );
    res.json({ rideRef, status: ride.status, points: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /rides/:ref/complete
 * Marque le trajet terminé (status 'completed') + point d'arrivée optionnel.
 */
router.post('/rides/:ref/complete', async (req, res, next) => {
  const rideRef = req.params.ref;
  const { latitude, longitude } = req.body || {};

  try {
    const ride = await loadOwnedRide(rideRef, req.userId);
    if (!ride) return res.status(404).json({ error: 'ride_not_found' });

    await pool.query("UPDATE ride SET status = 'completed' WHERE ride_ref = :rideRef", {
      rideRef,
    });
    if (latitude != null && longitude != null) {
      await pool.query(
        `INSERT INTO ride_track (ride_ref, track_type_code, detection_time, latitude, longitude)
         VALUES (:rideRef, 'ARRIVAL', NOW(3), :lat, :lng)`,
        { rideRef, lat: latitude, lng: longitude }
      );
    }
    res.json({ rideRef, status: 'completed' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /incidents
 * Body : { rideRef?, type?, description?, latitude?, longitude? }
 * Déclenche une alerte (par défaut SOS). Enregistre l'incident et, si position
 * fournie, un point de suivi de type ALERT pour matérialiser le SOS sur le trajet.
 */
router.post('/incidents', async (req, res, next) => {
  const { rideRef, type, description, latitude, longitude } = req.body || {};
  const incType = ['SOS', 'DELAY', 'MALAISE', 'OTHER'].includes(type) ? type : 'SOS';

  const conn = await pool.getConnection();
  try {
    // Si un trajet est fourni, il doit appartenir à la passagère.
    if (rideRef) {
      const [[ride]] = await conn.query(
        'SELECT passenger_id FROM ride WHERE ride_ref = :rideRef',
        { rideRef }
      );
      if (!ride) return res.status(404).json({ error: 'ride_not_found' });
      if (ride.passenger_id !== req.userId) {
        return res.status(403).json({ error: 'not_your_ride' });
      }
    }

    const incidentRef = `INC-${Date.now().toString(36).toUpperCase()}`.slice(0, 30);

    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO incident (incident_ref, description, reporter_id, inc_type_code, ride_ref)
       VALUES (:incidentRef, :description, :reporterId, :incType, :rideRef)`,
      {
        incidentRef,
        description: description || 'Alerte SOS déclenchée par la passagère',
        reporterId: req.userId,
        incType,
        rideRef: rideRef || null,
      }
    );

    if (rideRef && latitude != null && longitude != null) {
      await conn.query(
        `INSERT INTO ride_track (ride_ref, track_type_code, detection_time, latitude, longitude)
         VALUES (:rideRef, 'ALERT', NOW(3), :lat, :lng)`,
        { rideRef, lat: latitude, lng: longitude }
      );
    }
    await conn.commit();

    res.status(201).json({ incidentRef, type: incType });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
