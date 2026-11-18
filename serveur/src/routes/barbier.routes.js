const express = require("express");
const db = require("../db");
const { aRole } = require("../middleware/auth");

const router = express.Router();

// toutes les routes de ce fichier sont seulement pour les barbiers
router.use(aRole("barbier"));

// horaire du barbier : ses rendez-vous confirmes a venir
router.get("/horaire", async (req, res) => {
  const barbierId = req.session.utilisateur.id;

  try {
    const [rows] = await db.query(`
      SELECT r.id, d.debut, d.fin, u.nom AS client,
             s.nom AS service, s.duree_min, s.prix
      FROM rendezvous r
      JOIN disponibilites d ON d.id = r.disponibilites_id
      JOIN utilisateurs u ON u.id = r.client_id
      JOIN services s ON s.id = r.services_id
      WHERE r.barbier_id = ? AND r.statut = 'confirme' AND d.debut > NOW()
      ORDER BY d.debut
    `, [barbierId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// les plages du barbier qui sont pas encore passees
router.get("/disponibilites", async (req, res) => {
  const barbierId = req.session.utilisateur.id;

  try {
    const [rows] = await db.query(`
      SELECT id, debut, fin, est_reserve
      FROM disponibilites
      WHERE barbier_id = ? AND fin > NOW()
      ORDER BY debut
    `, [barbierId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ouvrir une nouvelle plage
// on refuse si elle chevauche une plage existante, sinon le meme moment
// pourrait etre reserve deux fois par deux plages differentes
router.post("/disponibilites", async (req, res) => {
  const barbierId = req.session.utilisateur.id;
  const { debut, fin } = req.body;

  if (!debut || !fin) {
    return res.status(400).json({ erreur: "Le debut et la fin sont obligatoires." });
  }
  if (new Date(fin) <= new Date(debut)) {
    return res.status(400).json({ erreur: "La fin doit etre apres le debut." });
  }
  if (new Date(debut) < new Date()) {
    return res.status(400).json({ erreur: "On peut pas ouvrir une plage dans le passe." });
  }

  // le formulaire envoie "2026-11-20T09:00", mysql veut un espace a la place du T
  const debutSql = debut.replace("T", " ");
  const finSql = fin.replace("T", " ");

  try {
    // deux plages se chevauchent si l'une commence avant la fin de l'autre
    // et finit apres son debut
    const [conflits] = await db.query(
      "SELECT id FROM disponibilites WHERE barbier_id = ? AND debut < ? AND fin > ?",
      [barbierId, finSql, debutSql]
    );
    if (conflits.length > 0) {
      return res.status(409).json({ erreur: "Cette plage chevauche une plage deja ouverte." });
    }

    await db.query(
      "INSERT INTO disponibilites (debut, fin, barbier_id) VALUES (?, ?, ?)",
      [debutSql, finSql, barbierId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// retirer une plage
// on refuse si un client l'a deja reservee : on annule jamais un rendez-vous dans son dos
router.post("/disponibilites/:id/retirer", async (req, res) => {
  const barbierId = req.session.utilisateur.id;

  try {
    const [rows] = await db.query(
      "SELECT id, est_reserve FROM disponibilites WHERE id = ? AND barbier_id = ?",
      [req.params.id, barbierId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erreur: "Plage introuvable." });
    }
    if (rows[0].est_reserve === 1) {
      return res.status(409).json({ erreur: "Un client a deja reserve cette plage. Contactez-le si vous devez vous liberer." });
    }

    await db.query("DELETE FROM disponibilites WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// les evaluations recues par le barbier, il peut juste les lire
router.get("/evaluations", async (req, res) => {
  const barbierId = req.session.utilisateur.id;

  try {
    const [avis] = await db.query(`
      SELECT a.id, a.note, a.commentaire, a.date_avis, s.nom AS service
      FROM avis a
      JOIN rendezvous r ON r.id = a.rendezvous_id
      JOIN services s ON s.id = r.services_id
      WHERE r.barbier_id = ?
      ORDER BY a.date_avis DESC
    `, [barbierId]);

    let moyenne = null;
    if (avis.length > 0) {
      const total = avis.reduce((somme, a) => somme + a.note, 0);
      moyenne = (total / avis.length).toFixed(1);
    }

    res.json({ avis, moyenne });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
