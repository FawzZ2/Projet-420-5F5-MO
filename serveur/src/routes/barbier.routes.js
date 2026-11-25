const express = require("express");
const db = require("../db");
const { aRole } = require("../middleware/auth");
const { genererPlages } = require("../plages");

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
    // on complete d'abord les creneaux des 4 prochaines semaines selon son horaire
    await genererPlages(barbierId);

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

// horaire de la semaine du barbier
// ex : { duree_creneau: 60, jours: [{ jour: 2, debut: "09:00", fin: "17:00" }, ...] }
router.get("/semaine", async (req, res) => {
  const barbierId = req.session.utilisateur.id;

  try {
    const [rows] = await db.query(`
      SELECT jour, TIME_FORMAT(heure_debut, '%H:%i') AS debut, TIME_FORMAT(heure_fin, '%H:%i') AS fin, duree_creneau
      FROM horaires WHERE barbier_id = ? ORDER BY jour
    `, [barbierId]);

    res.json({
      duree_creneau: rows.length > 0 ? rows[0].duree_creneau : 60,
      jours: rows.map((r) => ({ jour: r.jour, debut: r.debut, fin: r.fin }))
    });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// enregistrer l'horaire de la semaine
// on remplace l'ancien horaire, on enleve les creneaux libres qui venaient de l'ancien
// et on recree ceux des 4 prochaines semaines. Les creneaux deja reserves restent.
router.put("/semaine", async (req, res) => {
  const barbierId = req.session.utilisateur.id;
  const jours = Array.isArray(req.body.jours) ? req.body.jours : [];
  const duree = parseInt(req.body.duree_creneau, 10);
  const formatHeure = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

  if (!(duree >= 15 && duree <= 240)) {
    return res.status(400).json({ erreur: "La duree d'un creneau doit etre entre 15 et 240 minutes." });
  }
  const dejaVus = [];
  for (const j of jours) {
    const jour = parseInt(j.jour, 10);
    if (!(jour >= 0 && jour <= 6) || dejaVus.includes(jour)) {
      return res.status(400).json({ erreur: "Journee invalide." });
    }
    dejaVus.push(jour);
    if (!formatHeure.test(j.debut || "") || !formatHeure.test(j.fin || "")) {
      return res.status(400).json({ erreur: "Les heures doivent etre au format HH:MM." });
    }
    if (j.fin <= j.debut) {
      return res.status(400).json({ erreur: "L'heure de fin doit etre apres l'heure de debut." });
    }
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    await connexion.query("DELETE FROM horaires WHERE barbier_id = ?", [barbierId]);
    for (const j of jours) {
      await connexion.query(
        "INSERT INTO horaires (barbier_id, jour, heure_debut, heure_fin, duree_creneau) VALUES (?, ?, ?, ?, ?)",
        [barbierId, j.jour, j.debut, j.fin, duree]
      );
    }

    // on enleve les creneaux automatiques encore libres (les rendez-vous annules qui pointent dessus d'abord)
    await connexion.query(`
      DELETE r FROM rendezvous r
      JOIN disponibilites d ON d.id = r.disponibilites_id
      WHERE d.barbier_id = ? AND d.auto = 1 AND d.est_reserve = 0 AND d.debut > NOW() AND r.statut = 'annule'
    `, [barbierId]);
    await connexion.query(
      "DELETE FROM disponibilites WHERE barbier_id = ? AND auto = 1 AND est_reserve = 0 AND debut > NOW()",
      [barbierId]
    );
    // on remet le compteur a zero pour que tout soit recree avec le nouvel horaire
    await connexion.query("UPDATE utilisateurs SET plages_jusqua = NULL WHERE id = ?", [barbierId]);

    await connexion.commit();
  } catch (err) {
    await connexion.rollback();
    connexion.release();
    return res.status(500).json({ erreur: err.message });
  }
  connexion.release();

  try {
    await genererPlages(barbierId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// fermer une journee (conge, rendez-vous perso...) : on enleve toutes ses plages libres ce jour-la
// les rendez-vous deja reserves restent
router.post("/disponibilites/fermer", async (req, res) => {
  const barbierId = req.session.utilisateur.id;
  const { date } = req.body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    return res.status(400).json({ erreur: "Choisissez une date." });
  }
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  if (new Date(date + "T00:00") < aujourdhui) {
    return res.status(400).json({ erreur: "On peut pas fermer une journee deja passee." });
  }

  try {
    await db.query(`
      DELETE r FROM rendezvous r
      JOIN disponibilites d ON d.id = r.disponibilites_id
      WHERE d.barbier_id = ? AND DATE(d.debut) = ? AND d.est_reserve = 0 AND r.statut = 'annule'
    `, [barbierId, date]);
    const [resultat] = await db.query(
      "DELETE FROM disponibilites WHERE barbier_id = ? AND DATE(debut) = ? AND est_reserve = 0",
      [barbierId, date]
    );
    const [reservees] = await db.query(
      "SELECT COUNT(*) AS nb FROM disponibilites WHERE barbier_id = ? AND DATE(debut) = ? AND est_reserve = 1",
      [barbierId, date]
    );
    res.json({ retirees: resultat.affectedRows, reservees: reservees[0].nb });
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

    // si un client avait reserve puis annule, son rendez-vous annule pointe encore sur la plage
    // on l'enleve avant, sinon la cle etrangere bloque le DELETE
    await db.query("DELETE FROM rendezvous WHERE disponibilites_id = ? AND statut = 'annule'", [req.params.id]);
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
