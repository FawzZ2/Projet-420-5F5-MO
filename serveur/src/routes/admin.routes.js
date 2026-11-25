const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const { aRole } = require("../middleware/auth");

const router = express.Router();

// toutes les routes de ce fichier sont seulement pour l'admin
router.use(aRole("admin"));

// ---------- BARBIERS ----------

router.get("/barbiers", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nom, courriel, actif
      FROM utilisateurs
      WHERE role = 'barbier'
      ORDER BY actif DESC, nom
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ajouter un barbier
// le role barbier peut seulement etre donne par l'admin, jamais par l'inscription
router.post("/barbiers", async (req, res) => {
  const { nom, courriel, password } = req.body;

  if (!nom || !courriel || !password) {
    return res.status(400).json({ erreur: "Tous les champs sont obligatoires." });
  }
  if (password.length < 8) {
    return res.status(400).json({ erreur: "Le mot de passe doit avoir 8 caracteres minimum." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO utilisateurs (nom, courriel, password, role) VALUES (?, ?, ?, 'barbier')",
      [nom, courriel, hash]
    );
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erreur: "Ce courriel est deja utilise." });
    }
    res.status(500).json({ erreur: err.message });
  }
});

// modifier le nom ou le courriel d'un barbier
router.put("/barbiers/:id", async (req, res) => {
  const { nom, courriel } = req.body;

  if (!nom || !courriel) {
    return res.status(400).json({ erreur: "Le nom et le courriel sont obligatoires." });
  }

  try {
    const [resultat] = await db.query(
      "UPDATE utilisateurs SET nom = ?, courriel = ? WHERE id = ? AND role = 'barbier'",
      [nom, courriel, req.params.id]
    );
    if (resultat.affectedRows === 0) {
      return res.status(404).json({ erreur: "Barbier introuvable." });
    }
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erreur: "Ce courriel est deja utilise." });
    }
    res.status(500).json({ erreur: err.message });
  }
});

// retirer un barbier
// on supprime pas la ligne : ses anciens rendez-vous et ses avis pointent dessus
// on le met inactif et on enleve ses plages libres
// s'il a encore des rendez-vous a venir, on refuse pour pas laisser des clients sans barbier
router.post("/barbiers/:id/retirer", async (req, res) => {
  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    const [aVenir] = await connexion.query(`
      SELECT r.id FROM rendezvous r
      JOIN disponibilites d ON d.id = r.disponibilites_id
      WHERE r.barbier_id = ? AND r.statut = 'confirme' AND d.debut > NOW()
    `, [req.params.id]);

    if (aVenir.length > 0) {
      await connexion.rollback();
      return res.status(409).json({
        erreur: "Ce barbier a encore " + aVenir.length + " rendez-vous a venir. Il faut les regler avant de le retirer."
      });
    }

    await connexion.query(
      "UPDATE utilisateurs SET actif = 0 WHERE id = ? AND role = 'barbier'",
      [req.params.id]
    );
    // meme chose que quand le barbier retire une plage : on enleve d'abord les rendez-vous annules
    // qui pointent sur ces plages, sinon la cle etrangere bloque le DELETE
    await connexion.query(`
      DELETE r FROM rendezvous r
      JOIN disponibilites d ON d.id = r.disponibilites_id
      WHERE d.barbier_id = ? AND d.est_reserve = 0 AND d.debut > NOW() AND r.statut = 'annule'
    `, [req.params.id]);
    await connexion.query(
      "DELETE FROM disponibilites WHERE barbier_id = ? AND est_reserve = 0 AND debut > NOW()",
      [req.params.id]
    );

    await connexion.commit();
    res.json({ ok: true });
  } catch (err) {
    await connexion.rollback();
    res.status(500).json({ erreur: err.message });
  } finally {
    connexion.release();
  }
});

// remettre un barbier retire
router.post("/barbiers/:id/reactiver", async (req, res) => {
  try {
    // plages_jusqua a NULL : ses creneaux seront recrees a partir de son horaire
    await db.query("UPDATE utilisateurs SET actif = 1, plages_jusqua = NULL WHERE id = ? AND role = 'barbier'", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---------- SERVICES ----------

// verifie les champs d'un service, retourne un message d'erreur ou null
function validerService(nom, duree_min, prix) {
  if (!nom) return "Le nom est obligatoire.";
  if (!(parseInt(duree_min, 10) > 0)) return "La duree doit etre plus grande que 0.";
  if (!(parseFloat(prix) >= 0)) return "Le prix n'est pas valide.";
  return null;
}

router.get("/services", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM services ORDER BY nom");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.post("/services", async (req, res) => {
  const { nom, duree_min, prix } = req.body;
  const erreur = validerService(nom, duree_min, prix);
  if (erreur) return res.status(400).json({ erreur });

  try {
    await db.query("INSERT INTO services (nom, duree_min, prix) VALUES (?, ?, ?)", [nom, duree_min, prix]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

router.put("/services/:id", async (req, res) => {
  const { nom, duree_min, prix } = req.body;
  const erreur = validerService(nom, duree_min, prix);
  if (erreur) return res.status(400).json({ erreur });

  try {
    const [resultat] = await db.query(
      "UPDATE services SET nom = ?, duree_min = ?, prix = ? WHERE id = ?",
      [nom, duree_min, prix, req.params.id]
    );
    if (resultat.affectedRows === 0) {
      return res.status(404).json({ erreur: "Service introuvable." });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// retirer un service
// impossible s'il a deja servi dans un rendez-vous, parce que l'historique pointe dessus
router.post("/services/:id/retirer", async (req, res) => {
  try {
    await db.query("DELETE FROM services WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({ erreur: "Ce service a deja ete utilise dans des rendez-vous, on peut pas le supprimer." });
    }
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
