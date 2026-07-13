const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tarmigt-admin-secret-key-2026';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acces non autorise' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expire' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
