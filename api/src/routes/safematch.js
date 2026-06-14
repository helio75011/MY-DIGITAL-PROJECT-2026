const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');
const safematch = require('../safematch/store');

const router = express.Router();
router.use(requireAuth);

// Vérifie que le trajet appartient à la passagère connectée.
async function ownsRide(rideRef, userId) {
  const [[ride]] = await pool.query(
    'SELECT passenger_id FROM ride WHERE ride_ref = :rideRef',
    { rideRef }
  );
  return ride && ride.passenger_id === userId;
}

/**
 * GET /rides/:ref/safematch
 * Renvoie le code SafeMatch du trajet (couleur + chiffres) à afficher.
 */
router.get('/rides/:ref/safematch', async (req, res, next) => {
  const rideRef = req.params.ref;
  try {
    if (!(await ownsRide(rideRef, req.userId))) {
      return res.status(404).json({ error: 'ride_not_found' });
    }
    // Si absent (ex. API redémarrée), on régénère un code pour rester démontrable.
    const code = safematch.get(rideRef) || safematch.generate(rideRef);
    res.json({ color: code.color, digits: code.digits, confirmed: code.confirmed });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /rides/:ref/safematch/confirm
 * La passagère confirme que le code annoncé correspond : embarquement validé.
 */
router.post('/rides/:ref/safematch/confirm', async (req, res, next) => {
  const rideRef = req.params.ref;
  try {
    if (!(await ownsRide(rideRef, req.userId))) {
      return res.status(404).json({ error: 'ride_not_found' });
    }
    const entry = safematch.confirm(rideRef);
    if (!entry) return res.status(404).json({ error: 'no_code' });
    res.json({ confirmed: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
