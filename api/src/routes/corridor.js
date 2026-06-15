const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

// Distance approximative (km) entre deux points (équirectangulaire, suffisant à l'échelle ville).
function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const x = ((bLng - aLng) * Math.PI) / 180 * Math.cos(((aLat + bLat) / 2) * Math.PI / 180);
  const y = ((bLat - aLat) * Math.PI) / 180;
  return Math.sqrt(x * x + y * y) * R;
}

// Distance d'un point au segment [A,B] (en km) — proximité au "corridor" du trajet.
function distanceToSegmentKm(pLat, pLng, aLat, aLng, bLat, bLng) {
  // Approximation planaire locale (degrés -> km).
  const kx = 111 * Math.cos((pLat * Math.PI) / 180);
  const ky = 111;
  const ax = aLng * kx, ay = aLat * ky;
  const bx = bLng * kx, by = bLat * ky;
  const px = pLng * kx, py = pLat * ky;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/**
 * POST /corridor/assess
 * Body : { startLat, startLng, endLat, endLng }
 * "IA Corridor" : évalue la sûreté de l'itinéraire par une heuristique —
 * bonus pour les zones sûres proches du trajet (pondérées par leur niveau),
 * malus pour les incidents passés à proximité. Renvoie un score 0..100,
 * un libellé, et les zones sûres qui jalonnent le parcours.
 */
router.post('/corridor/assess', async (req, res, next) => {
  const { startLat, startLng, endLat, endLng } = req.body || {};
  if ([startLat, startLng, endLat, endLng].some((v) => v == null || Number.isNaN(Number(v)))) {
    return res.status(400).json({ error: 'missing_coords' });
  }
  const sLat = Number(startLat), sLng = Number(startLng);
  const eLat = Number(endLat), eLng = Number(endLng);

  try {
    const [zones] = await pool.query(
      'SELECT zone_id AS id, name, level, latitude, longitude FROM safe_zone'
    );

    const CORRIDOR_KM = 0.6; // largeur de prise en compte de part et d'autre du trajet
    let score = 55; // base neutre
    const onPath = [];

    for (const z of zones) {
      const d = distanceToSegmentKm(Number(z.latitude), Number(z.longitude), sLat, sLng, eLat, eLng);
      if (d <= CORRIDOR_KM) {
        // Zone proche du trajet : bonus pondéré par le niveau et la proximité.
        score += z.level * (1 - d / CORRIDOR_KM) * 8;
        onPath.push({ id: z.id, name: z.name, level: z.level });
      }
    }

    // Malus pour les incidents passés proches du trajet.
    const [incidents] = await pool.query(
      `SELECT rt.latitude, rt.longitude
       FROM incident i
       JOIN ride_track rt ON rt.ride_ref = i.ride_ref AND rt.track_type_code = 'ALERT'`
    );
    for (const inc of incidents) {
      if (inc.latitude == null) continue;
      const d = distanceToSegmentKm(Number(inc.latitude), Number(inc.longitude), sLat, sLng, eLat, eLng);
      if (d <= CORRIDOR_KM) score -= 15;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    const level = score >= 70 ? 'safe' : score >= 45 ? 'moderate' : 'caution';
    const label =
      level === 'safe'
        ? 'Itinéraire sécurisé : bien jalonné de zones sûres.'
        : level === 'moderate'
        ? 'Itinéraire correct : restez vigilante.'
        : 'Itinéraire à vigilance : privilégiez un accompagnement.';

    res.json({
      score,
      level,
      label,
      distanceKm: Math.round(distanceKm(sLat, sLng, eLat, eLng) * 10) / 10,
      safeZonesOnPath: onPath.sort((a, b) => b.level - a.level),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
