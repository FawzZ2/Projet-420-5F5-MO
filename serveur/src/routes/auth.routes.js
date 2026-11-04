const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

router.post("/inscription", async (req, res) => {
  const { nom, courriel, password } = req.body;

  if (!nom || !courriel || !password) {
    return res.status(400).json({ erreur: "Tous les champs sont obligatoires." });
  }
  if (password.length < 8) {
    return res.status(400).json({ erreur: "Le mot de passe doit avoir 8 caracteres minimum." });
  }

  try {
    const [existe] = await db.query("SELECT id FROM utilisateurs WHERE courriel = ?", [courriel]);
    if (existe.length > 0) {
      return res.status(400).json({ erreur: "Ce courriel est deja utilise." });
    }

    const hash = await bcrypt.hash(password, 10);

    const [resultat] = await db.query(
      "INSERT INTO utilisateurs (nom, courriel, password, role) VALUES (?, ?, ?, 'client')",
      [nom, courriel, hash]
    );

    req.session.utilisateur = { id: resultat.insertId, nom: nom, role: "client" };
    res.json({ nom: nom, role: "client" });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.post("/connexion", async (req, res) => {
  const { courriel, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id, nom, password, role, actif FROM utilisateurs WHERE courriel = ?",
      [courriel]
    );
    const user = rows[0];

    if (!user || !user.actif || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ erreur: "Courriel ou mot de passe invalide." });
    }

    req.session.utilisateur = { id: user.id, nom: user.nom, role: user.role };
    res.json({ nom: user.nom, role: user.role });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.post("/deconnexion", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/moi", (req, res) => {
  if (!req.session.utilisateur) {
    return res.status(401).json({ erreur: "Non connecte." });
  }
  res.json(req.session.utilisateur);
});

module.exports = router;
