const express = require("express");
const db = require("../db");
const { aRole } = require("../middleware/auth");

const router = express.Router();

// toutes les routes de ce fichier sont seulement pour les clients
router.use(aRole("client"));

// liste des barbiers avec leur note moyenne
// la note est calculee a partir de la table avis, on la stocke pas
router.get("/barbiers", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.nom,
             ROUND(AVG(a.note), 1) AS note_moyenne,
             COUNT(a.id) AS nb_avis
      FROM utilisateurs u
      LEFT JOIN rendezvous r ON r.barbier_id = u.id
      LEFT JOIN avis a ON a.rendezvous_id = r.id
      WHERE u.role = 'barbier' AND u.actif = 1
      GROUP BY u.id, u.nom
      ORDER BY u.nom
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// liste des services du salon
router.get("/services", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM services ORDER BY nom");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// creneaux libres d'un barbier pour un service
// exemple : /api/client/creneaux?barbier=2&service=1
// on retourne seulement les plages libres, futures et assez longues pour le service
router.get("/creneaux", async (req, res) => {
  const { barbier, service } = req.query;

  if (!barbier || !service) {
    return res.status(400).json({ erreur: "Il faut un barbier et un service." });
  }

  try {
    const [rows] = await db.query(`
      SELECT d.id, d.debut, d.fin
      FROM disponibilites d
      WHERE d.barbier_id = ?
        AND d.est_reserve = 0
        AND d.debut > NOW()
        AND TIMESTAMPDIFF(MINUTE, d.debut, d.fin) >= (SELECT duree_min FROM services WHERE id = ?)
      ORDER BY d.debut
    `, [barbier, service]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// reserver un rendez-vous
// deux clients peuvent cliquer sur le meme creneau en meme temps
// donc on fait une transaction et on bloque la ligne avec FOR UPDATE
// le 2e client attend, puis voit que la plage est deja prise
router.post("/reserver", async (req, res) => {
  const { disponibilite_id, service_id } = req.body;
  const clientId = req.session.utilisateur.id;

  if (!disponibilite_id || !service_id) {
    return res.status(400).json({ erreur: "Il faut un creneau et un service." });
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    const [plages] = await connexion.query(
      "SELECT id, barbier_id, est_reserve FROM disponibilites WHERE id = ? FOR UPDATE",
      [disponibilite_id]
    );

    if (plages.length === 0 || plages[0].est_reserve === 1) {
      await connexion.rollback();
      return res.status(409).json({ erreur: "Ce creneau vient d'etre reserve. Choisissez-en un autre." });
    }

    const plage = plages[0];

    await connexion.query(
      "INSERT INTO rendezvous (client_id, barbier_id, services_id, disponibilites_id) VALUES (?, ?, ?, ?)",
      [clientId, plage.barbier_id, service_id, plage.id]
    );

    await connexion.query("UPDATE disponibilites SET est_reserve = 1 WHERE id = ?", [plage.id]);

    await connexion.commit();
    res.json({ ok: true });
  } catch (err) {
    await connexion.rollback();
    res.status(500).json({ erreur: err.message });
  } finally {
    connexion.release();
  }
});

// les rendez-vous du client connecte
// on filtre par client_id pour qu'un client voit jamais ceux des autres
router.get("/rendezvous", async (req, res) => {
  const clientId = req.session.utilisateur.id;

  try {
    const [rows] = await db.query(`
      SELECT r.id, r.statut, d.debut, d.fin,
             u.nom AS barbier, s.nom AS service, s.prix
      FROM rendezvous r
      JOIN disponibilites d ON d.id = r.disponibilites_id
      JOIN utilisateurs u ON u.id = r.barbier_id
      JOIN services s ON s.id = r.services_id
      WHERE r.client_id = ?
      ORDER BY d.debut DESC
    `, [clientId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// annuler un rendez-vous
// on supprime pas la ligne, on met le statut a annule pour garder l'historique
// et on remet la plage disponible pour les autres clients
router.post("/annuler/:id", async (req, res) => {
  const clientId = req.session.utilisateur.id;

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    // on verifie que le rendez-vous appartient bien a ce client
    const [rows] = await connexion.query(
      "SELECT id, disponibilites_id FROM rendezvous WHERE id = ? AND client_id = ? AND statut = 'confirme'",
      [req.params.id, clientId]
    );

    if (rows.length === 0) {
      await connexion.rollback();
      return res.status(404).json({ erreur: "Rendez-vous introuvable." });
    }

    await connexion.query("UPDATE rendezvous SET statut = 'annule' WHERE id = ?", [rows[0].id]);
    await connexion.query("UPDATE disponibilites SET est_reserve = 0 WHERE id = ?", [rows[0].disponibilites_id]);

    await connexion.commit();
    res.json({ ok: true });
  } catch (err) {
    await connexion.rollback();
    res.status(500).json({ erreur: err.message });
  } finally {
    connexion.release();
  }
});

module.exports = router;