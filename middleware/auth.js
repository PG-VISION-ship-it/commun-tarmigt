const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set. Using a fallback secret. Set JWT_SECRET in .env for production.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'tarmigt-fallback-secret-change-in-production';

const tokenBlacklist = new Set();

function blacklistToken(token) {
  tokenBlacklist.add(token);
}

function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acces non autorise' });
  }
  try {
    const token = header.split(' ')[1];
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ error: 'Token revoque' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expire' });
  }
}

module.exports = { authMiddleware, JWT_SECRET, blacklistToken, isTokenBlacklisted };
