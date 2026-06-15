const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

/**
 * GET /users/me/stats
 * Statistiques de gamification de l'utilisateur connecté :
 *  - trajets sécurisés (trajets terminés en tant que passagère)
 *  - score de confiance (moyenne des notes reçues, défaut 5)
 *  - ancienneté (jours depuis l'inscription)
 *  - badges débloqués (dérivés des stats)
 */
router.get('/users/me/stats', async (req, res, next) => {
  try {
    const [[trips]] = await pool.query(
      `SELECT COUNT(*) AS completed
       FROM ride WHERE passenger_id = :me AND status = 'completed'`,
      { me: req.userId }
    );
    const [[rating]] = await pool.query(
      `SELECT ROUND(AVG(driver_rating), 1) AS avg, COUNT(*) AS count
       FROM driver_rating WHERE rated_id = :me`,
      { me: req.userId }
    );
    const [[user]] = await pool.query(
      `SELECT DATEDIFF(CURRENT_DATE, join_date) AS days, is_verified
       FROM app_user WHERE user_id = :me`,
      { me: req.userId }
    );

    const completed = trips.completed;
    const trustScore = rating.avg != null ? Number(rating.avg) : 5;

    // Badges débloqués (règles simples, dérivées des stats réelles).
    const badges = [
      {
        code: 'verified',
        label: 'Profil vérifié',
        icon: 'shield-checkmark',
        unlocked: !!user?.is_verified,
      },
      {
        code: 'first_trip',
        label: 'Premier trajet',
        icon: 'walk',
        unlocked: completed >= 1,
      },
      {
        code: 'regular',
        label: 'Habituée',
        icon: 'repeat',
        unlocked: completed >= 5,
      },
      {
        code: 'trusted',
        label: 'Profil de confiance',
        icon: 'heart',
        unlocked: trustScore >= 4.5 && rating.count >= 1,
      },
      {
        code: 'veteran',
        label: 'Membre fidèle',
        icon: 'star',
        unlocked: (user?.days ?? 0) >= 90,
      },
    ];

    res.json({
      completedTrips: completed,
      trustScore,
      ratingCount: rating.count,
      memberDays: user?.days ?? 0,
      badges,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
