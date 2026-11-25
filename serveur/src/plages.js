const db = require("./db");

// on cree les creneaux des 4 prochaines semaines a partir de l'horaire du barbier
const JOURS_A_L_AVANCE = 28;

// Date -> "2026-11-25"
function texteJour(d) {
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

// Date -> "2026-11-25 09:00:00" (format de mysql)
function texteDateHeure(d) {
  const p = (n) => String(n).padStart(2, "0");
  return texteJour(d) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":00";
}

// "2026-11-25" ou "2026-11-25 09:00:00" -> Date (heure locale)
function versDate(texte) {
  return new Date(String(texte).replace(" ", "T"));
}

// une journee + "09:30" -> Date
function aHeure(jour, heure) {
  const d = new Date(jour);
  d.setHours(parseInt(heure.substring(0, 2), 10), parseInt(heure.substring(3, 5), 10), 0, 0);
  return d;
}

// cree les plages manquantes d'un barbier a partir de son horaire de la semaine
// on genere seulement les journees qui l'ont pas encore ete (colonne plages_jusqua)
// comme ca, si le barbier retire une plage ou ferme une journee, elle revient pas toute seule
async function genererPlages(barbierId) {
  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    // FOR UPDATE : si deux personnes ouvrent la page en meme temps, la 2e attend
    // sinon les creneaux seraient crees en double
    const [barbiers] = await connexion.query(
      "SELECT plages_jusqua FROM utilisateurs WHERE id = ? AND role = 'barbier' AND actif = 1 FOR UPDATE",
      [barbierId]
    );
    if (barbiers.length === 0) {
      await connexion.rollback();
      return;
    }

    const [horaires] = await connexion.query(`
      SELECT jour, TIME_FORMAT(heure_debut, '%H:%i') AS debut, TIME_FORMAT(heure_fin, '%H:%i') AS fin, duree_creneau
      FROM horaires WHERE barbier_id = ?
    `, [barbierId]);

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const limite = new Date(aujourdhui);
    limite.setDate(limite.getDate() + JOURS_A_L_AVANCE);

    // on commence au lendemain de la derniere journee deja generee
    const jour = new Date(aujourdhui);
    if (barbiers[0].plages_jusqua) {
      const suivant = versDate(barbiers[0].plages_jusqua);
      suivant.setDate(suivant.getDate() + 1);
      if (suivant > jour) jour.setTime(suivant.getTime());
    }

    // les plages deja la (ajoutees a la main ou reservees) pour pas creer un creneau par-dessus
    const [existantes] = await connexion.query(
      "SELECT debut, fin FROM disponibilites WHERE barbier_id = ? AND fin > NOW()",
      [barbierId]
    );
    const occupees = existantes.map((p) => ({ debut: versDate(p.debut), fin: versDate(p.fin) }));

    const maintenant = new Date();
    const nouvelles = [];

    for (; jour <= limite; jour.setDate(jour.getDate() + 1)) {
      const h = horaires.find((x) => x.jour === jour.getDay());
      if (!h) continue; // il travaille pas cette journee-la

      const finJournee = aHeure(jour, h.fin);
      let debut = aHeure(jour, h.debut);

      while (true) {
        const fin = new Date(debut.getTime() + h.duree_creneau * 60000);
        if (fin > finJournee) break;

        const chevauche = occupees.some((o) => o.debut < fin && o.fin > debut);
        if (debut > maintenant && !chevauche) {
          nouvelles.push([texteDateHeure(debut), texteDateHeure(fin), barbierId, 1]);
        }
        debut = fin;
      }
    }

    if (nouvelles.length > 0) {
      await connexion.query("INSERT INTO disponibilites (debut, fin, barbier_id, auto) VALUES ?", [nouvelles]);
    }
    await connexion.query("UPDATE utilisateurs SET plages_jusqua = ? WHERE id = ?", [texteJour(limite), barbierId]);

    await connexion.commit();
  } catch (err) {
    await connexion.rollback();
    throw err;
  } finally {
    connexion.release();
  }
}

module.exports = { genererPlages, JOURS_A_L_AVANCE };
