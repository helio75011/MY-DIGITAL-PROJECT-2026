// Configuration multer pour les uploads KYC (documents d'identité, selfie).
// Les fichiers sont écrits sur le disque local (api/uploads/) ; la base ne
// stocke que le chemin/URL public. Suffisant pour un usage projet/démo.
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// S'assure que le dossier existe au démarrage.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Nom unique : <userId>-<champ>-<timestamp>.<ext>
    const ext = path.extname(file.originalname) || '.jpg';
    const userId = req.userId || 'anon';
    const safeField = file.fieldname.replace(/[^a-z0-9_-]/gi, '');
    cb(null, `${userId}-${safeField}-${Date.now()}${ext}`);
  },
});

// On accepte uniquement les images (CNI, passeport, selfie).
function fileFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('invalid_file_type'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo max par fichier
});

// Construit l'URL publique servie par Express pour un fichier stocké.
function publicUrl(filename) {
  return `/uploads/${filename}`;
}

module.exports = { upload, publicUrl, UPLOAD_DIR };
