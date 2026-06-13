// Signature et vérification des JWT d'authentification.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  // Échec rapide au démarrage plutôt que des tokens non signés en silence.
  throw new Error('JWT_SECRET manquant dans .env');
}

/** Signe un JWT pour un utilisateur ; `sub` = user_id, `role` = role_code. */
function signToken(user) {
  return jwt.sign(
    { sub: user.user_id, role: user.role_code },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/** Vérifie un token et renvoie son payload ; lève si invalide/expiré. */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
