const {
  getUserBySessionToken,
  sanitizeUser
} = require('../services/authService');

async function requireAuth(req, res, next) {

  try {
    const authorization =
      req.headers.authorization || '';
    const token =
      authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;

    const user = await getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({
        message: 'Sessao invalida ou expirada.'
      });
    }

    req.user = sanitizeUser(user);

    return next();
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao validar sessao.'
    });
  }
}

module.exports = {
  requireAuth
};
