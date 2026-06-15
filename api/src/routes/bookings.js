const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');
const safematch = require('../safematch/store');

const router = express.Router();
router.use(requireAuth);

// Mode de trajet -> rôle de l'acteur recherché + libellé d'option booking.
const MODE = {
  solidaire: { role: 'GUARDIAN', option: 'solidaire' },
  premium: { role: 'DRIVER', option: 'premium' },
};

// Distance/temps simulés mais STABLES par acteur (dérivés de l'user_id) : pas de
// GPS réel côté serveur, mais des valeurs crédibles et constantes en démo.
function fakeProximity(userId) {
  const distanceM = 40 + ((userId * 137) % 960); // 40 m .. ~1 km
  const minutes = 1 + ((userId * 7) % 14); // 1 .. 14 min
  return {
    distance: distanceM >= 1000 ? `${(distanceM / 1000).toFixed(1)} km` : `${distanceM} m`,
    time: `${minutes} min`,
  };
}

/**
 * POST /rides
 * Body : { startPoint, endPoint, distanceKm?, estimatedTime? }
 * Crée un trajet pour la passagère connectée (status 'searching').
 */
router.post('/rides', async (req, res, next) => {
  const { startPoint, endPoint, distanceKm, estimatedTime, scheduledAt } = req.body || {};
  if (!startPoint || !endPoint) {
    return res.status(400).json({ error: 'missing_route' });
  }

  // Trajet planifié si une date future est fournie ; sinon recherche immédiate.
  let scheduled = null;
  if (scheduledAt) {
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ error: 'invalid_date' });
    }
    if (when.getTime() < Date.now()) {
      return res.status(400).json({ error: 'date_in_past' });
    }
    // Format MySQL DATETIME 'YYYY-MM-DD HH:MM:SS'.
    scheduled = when.toISOString().slice(0, 19).replace('T', ' ');
  }
  const status = scheduled ? 'scheduled' : 'searching';

  try {
    const rideRef = `RIDE-${Date.now().toString(36).toUpperCase()}`.slice(0, 30);

    await pool.query(
      `INSERT INTO ride
         (ride_ref, start_point, end_point, status, scheduled_at, distance, estimated_time, passenger_id)
       VALUES
         (:rideRef, :startPoint, :endPoint, :status, :scheduled, :distance, :estimated, :passengerId)`,
      {
        rideRef,
        startPoint,
        endPoint,
        status,
        scheduled,
        distance: distanceKm ?? null,
        estimated: estimatedTime ?? null,
        passengerId: req.userId,
      }
    );

    res.status(201).json({ rideRef, status, scheduledAt: scheduled });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /matching?mode=solidaire|premium
 * Liste les acteurs disponibles pour le mode demandé, avec leur NOTE MOYENNE
 * réelle (depuis driver_rating) et une distance/temps simulés. Pour 'premium',
 * joint le véhicule.
 */
router.get('/matching', async (req, res, next) => {
  const mode = MODE[req.query.mode] ? req.query.mode : 'solidaire';
  const { role } = MODE[mode];

  try {
    const [rows] = await pool.query(
      `
      SELECT
        u.user_id                                    AS userId,
        CONCAT(u.first_name, ' ', u.last_name)       AS name,
        ROUND(AVG(dr.driver_rating), 1)              AS avgRating,
        COUNT(dr.rating_id)                          AS ratingCount,
        v.brand, v.model, v.color, v.plate_number
      FROM app_user u
      LEFT JOIN driver_rating dr ON dr.rated_id = u.user_id
      LEFT JOIN vehicle v        ON v.user_id   = u.user_id
      WHERE u.role_code = :role
        AND u.is_verified = TRUE
        AND u.user_id <> :me
      GROUP BY u.user_id
      ORDER BY avgRating DESC
      `,
      { role, me: req.userId }
    );

    const actors = rows.map((r) => {
      const prox = fakeProximity(r.userId);
      return {
        userId: r.userId,
        name: r.name,
        // Note moyenne réelle ; '—' si l'acteur n'a pas encore été noté.
        rating: r.avgRating != null ? String(r.avgRating) : '—',
        ratingCount: r.ratingCount,
        time: prox.time,
        distance: prox.distance,
        vehicle:
          mode === 'premium' && r.brand
            ? { brand: r.brand, model: r.model, color: r.color, plate: r.plate_number }
            : null,
      };
    });

    res.json(actors);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /bookings
 * Body : { rideRef, actorId, mode, price?, isSponsored? }
 * Crée la réservation (booking) et passe le trajet en 'ongoing'.
 */
router.post('/bookings', async (req, res, next) => {
  const { rideRef, actorId, mode, price, isSponsored } = req.body || {};
  if (!rideRef || !actorId || !MODE[mode]) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const conn = await pool.getConnection();
  try {
    // Le trajet doit appartenir à la passagère connectée (sécurité).
    const [[ride]] = await conn.query(
      'SELECT passenger_id, status FROM ride WHERE ride_ref = :rideRef',
      { rideRef }
    );
    if (!ride) return res.status(404).json({ error: 'ride_not_found' });
    if (ride.passenger_id !== req.userId) {
      return res.status(403).json({ error: 'not_your_ride' });
    }
    // On ne réserve qu'un trajet en cours de recherche (évite de re-réserver un
    // trajet déjà attribué, terminé ou annulé).
    if (ride.status !== 'searching') {
      return res.status(409).json({ error: 'ride_not_bookable' });
    }

    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO booking (user_id, ride_ref, \`option\`, applied_price, is_sponsored)
       VALUES (:actorId, :rideRef, :option, :price, :sponsored)`,
      {
        actorId,
        rideRef,
        option: MODE[mode].option,
        price: price ?? 0,
        sponsored: isSponsored ? 1 : 0,
      }
    );
    await conn.query(
      "UPDATE ride SET status = 'ongoing' WHERE ride_ref = :rideRef",
      { rideRef }
    );
    await conn.commit();

    // Génère le code SafeMatch d'embarquement (couleur + 4 chiffres).
    const code = safematch.generate(rideRef);

    res.status(201).json({
      rideRef,
      actorId,
      status: 'ongoing',
      safematch: { color: code.color, digits: code.digits },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
