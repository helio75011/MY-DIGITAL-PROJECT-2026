// Restreint l'accès aux administrateurs / modérateurs.
// À chaîner APRÈS requireAuth (qui pose req.userRole depuis le JWT).
function requireAdmin(req, res, next) {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

module.exports = requireAdmin;
