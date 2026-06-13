// Middleware d'authentification : exige un JWT valide dans l'en-tête
// `Authorization: Bearer <token>` et pose `req.userId` pour les routes suivantes.
const { verifyToken } = require('../auth/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  try {
    const payload = verifyToken(token);
    req.userId = Number(payload.sub);
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthenticated' });
  }
}

module.exports = requireAuth;
