const express = require('express');
const pool = require('../db');
const requireAuth = require('../middlewares/requireAuth');
const { upload, publicUrl } = require('../upload');

const router = express.Router();

// Toutes les routes KYC exigent d'être connecté.
router.use(requireAuth);

// --- Codes de vérification (mockés, en mémoire) -----------------------------
// userId -> { code, expiresAt }. En prod : table dédiée + envoi email/SMS réel.
const verificationCodes = new Map();
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
}

/**
 * POST /kyc/send-code
 * Body : { phone? }  — met éventuellement à jour le téléphone, génère un code.
 * En dev, le code est renvoyé dans la réponse (devCode) ET loggé serveur.
 */
router.post('/send-code', async (req, res, next) => {
  try {
    const { phone } = req.body || {};
    if (phone) {
      await pool.query('UPDATE app_user SET phone = :phone WHERE user_id = :userId', {
        phone,
        userId: req.userId,
      });
    }

    const code = generateCode();
    verificationCodes.set(req.userId, { code, expiresAt: Date.now() + CODE_TTL_MS });
    console.log(`[KYC] Code de vérification pour user ${req.userId} : ${code}`);

    // devCode exposé uniquement pour la démo (pas de service email/SMS configuré).
    res.json({ sent: true, devCode: code });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /kyc/verify-code
 * Body : { code } — valide le code envoyé précédemment.
 */
router.post('/verify-code', (req, res) => {
  const { code } = req.body || {};
  const entry = verificationCodes.get(req.userId);

  if (!entry || Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: 'code_expired' });
  }
  if (String(code) !== entry.code) {
    return res.status(400).json({ error: 'invalid_code' });
  }

  // Code consommé.
  verificationCodes.delete(req.userId);
  res.json({ verified: true });
});

/**
 * POST /kyc/documents  (multipart/form-data)
 * Champs fichiers : front (requis), back (optionnel). Champ texte : docType.
 * Enregistre une ligne dans `documents` rattachée à l'utilisateur.
 */
router.post(
  '/documents',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const front = req.files?.front?.[0];
      const back = req.files?.back?.[0];
      const docType = (req.body?.docType || 'id_card').slice(0, 50);

      if (!front) {
        return res.status(400).json({ error: 'front_required' });
      }

      // doc_code unique et court (PK VARCHAR(20)).
      const docCode = `D${req.userId}-${Date.now().toString(36)}`.slice(0, 20);

      await pool.query(
        `INSERT INTO documents (doc_code, doc_type, front_url, back_url, user_id)
         VALUES (:docCode, :docType, :frontUrl, :backUrl, :userId)`,
        {
          docCode,
          docType,
          frontUrl: publicUrl(front.filename),
          backUrl: back ? publicUrl(back.filename) : null,
          userId: req.userId,
        }
      );

      res.status(201).json({ docCode, docType });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /kyc/selfie  (multipart/form-data)
 * Champ fichier : selfie. Enregistre l'URL dans app_user.selfie.
 * Vérification faciale simulée (pas de SDK biométrique réel).
 */
router.post('/selfie', upload.single('selfie'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'selfie_required' });
    }
    await pool.query('UPDATE app_user SET selfie = :selfie WHERE user_id = :userId', {
      selfie: publicUrl(req.file.filename),
      userId: req.userId,
    });
    res.json({ selfieUrl: publicUrl(req.file.filename) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /kyc/complete
 * Clôt le tunnel : exige qu'au moins un document et un selfie soient présents,
 * puis passe is_verified = TRUE. (Reconnaissance faciale simulée -> succès.)
 */
router.post('/complete', async (req, res, next) => {
  try {
    const [[user]] = await pool.query(
      'SELECT selfie FROM app_user WHERE user_id = :userId',
      { userId: req.userId }
    );
    const [docs] = await pool.query(
      'SELECT doc_code FROM documents WHERE user_id = :userId LIMIT 1',
      { userId: req.userId }
    );

    if (!user?.selfie) {
      return res.status(400).json({ error: 'selfie_missing' });
    }
    if (docs.length === 0) {
      return res.status(400).json({ error: 'document_missing' });
    }

    await pool.query(
      'UPDATE app_user SET is_verified = TRUE WHERE user_id = :userId',
      { userId: req.userId }
    );

    res.json({ verified: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /kyc/status
 * Renvoie l'état d'avancement du KYC pour réhydrater le tunnel.
 */
router.get('/status', async (req, res, next) => {
  try {
    const [[user]] = await pool.query(
      'SELECT is_verified, selfie, phone FROM app_user WHERE user_id = :userId',
      { userId: req.userId }
    );
    const [docs] = await pool.query(
      'SELECT doc_code FROM documents WHERE user_id = :userId LIMIT 1',
      { userId: req.userId }
    );

    res.json({
      isVerified: !!user?.is_verified,
      hasSelfie: !!user?.selfie,
      hasDocument: docs.length > 0,
      hasPhone: !!user?.phone,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
