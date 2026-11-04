function aRole(role) {
  return function (req, res, next) {
    if (!req.session.utilisateur) {
      return res.status(401).json({ erreur: "Vous devez etre connecte." });
    }
    if (req.session.utilisateur.role !== role) {
      return res.status(403).json({ erreur: "Acces refuse." });
    }
    next();
  };
}

module.exports = { aRole };
