import { useState, useEffect } from "react";
import { api } from "../api";
import { formatJourLong, formatHeure } from "../format";

// ordre d'affichage : lundi en premier (0 = dimanche, comme getDay() en JavaScript)
const JOURS = [
  { jour: 1, nom: "Lundi" },
  { jour: 2, nom: "Mardi" },
  { jour: 3, nom: "Mercredi" },
  { jour: 4, nom: "Jeudi" },
  { jour: 5, nom: "Vendredi" },
  { jour: 6, nom: "Samedi" },
  { jour: 0, nom: "Dimanche" }
];

// une semaine vide : il travaille nulle part, 9 h a 17 h par defaut quand on coche
function semaineVide() {
  const s = {};
  JOURS.forEach((j) => { s[j.jour] = { travaille: false, debut: "09:00", fin: "17:00" }; });
  return s;
}

function aujourdhui() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

export default function Disponibilites() {
  const [plages, setPlages] = useState([]);
  const [semaine, setSemaine] = useState(semaineVide());
  const [duree, setDuree] = useState(60);
  const [dateFermee, setDateFermee] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  function chargerPlages() {
    api.get("/barbier/disponibilites").then(setPlages).catch((err) => setErreur(err.message));
  }

  function chargerSemaine() {
    api.get("/barbier/semaine")
      .then((data) => {
        const s = semaineVide();
        data.jours.forEach((j) => { s[j.jour] = { travaille: true, debut: j.debut, fin: j.fin }; });
        setSemaine(s);
        setDuree(data.duree_creneau);
      })
      .catch((err) => setErreur(err.message));
  }

  useEffect(() => {
    chargerSemaine();
    chargerPlages();
  }, []);

  function changerJour(jour, champ, valeur) {
    setSemaine({ ...semaine, [jour]: { ...semaine[jour], [champ]: valeur } });
  }

  async function enregistrerSemaine(e) {
    e.preventDefault();
    setErreur("");
    setMessage("");
    const jours = JOURS
      .filter((j) => semaine[j.jour].travaille)
      .map((j) => ({ jour: j.jour, debut: semaine[j.jour].debut, fin: semaine[j.jour].fin }));
    try {
      await api.put("/barbier/semaine", { duree_creneau: duree, jours });
      setMessage("Horaire enregistré. Vos créneaux des 4 prochaines semaines sont ouverts.");
      chargerPlages();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function fermerJournee(e) {
    e.preventDefault();
    setErreur("");
    setMessage("");
    try {
      const r = await api.post("/barbier/disponibilites/fermer", { date: dateFermee });
      let texte = "Journée fermée : " + r.retirees + " créneau(x) retiré(s).";
      if (r.reservees > 0) {
        texte += " Attention : " + r.reservees + " rendez-vous déjà réservé(s) ce jour-là restent dans votre horaire.";
      }
      setMessage(texte);
      setDateFermee("");
      chargerPlages();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function ajouterPlage(e) {
    e.preventDefault();
    setErreur("");
    setMessage("");
    try {
      await api.post("/barbier/disponibilites", { debut, fin });
      setDebut("");
      setFin("");
      setMessage("Plage ajoutée.");
      chargerPlages();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function retirer(id) {
    if (!confirm("Retirer ce créneau ?")) return;
    setErreur("");
    setMessage("");
    try {
      await api.post("/barbier/disponibilites/" + id + "/retirer");
      chargerPlages();
    } catch (err) {
      setErreur(err.message);
    }
  }

  // on regroupe les plages par journee pour l'affichage
  const parJour = {};
  plages.forEach((p) => {
    const jour = p.debut.substring(0, 10);
    if (!parJour[jour]) parJour[jour] = [];
    parJour[jour].push(p);
  });

  return (
    <div className="page">
      <div className="entete-page">
        <p className="surtitre">Espace barbier</p>
        <h1>Mes disponibilités</h1>
        <p className="gris">Choisissez les jours et les heures où vous travaillez. Les créneaux sont créés automatiquement.</p>
      </div>
      {erreur && <p className="erreur">{erreur}</p>}
      {message && <p className="succes">{message}</p>}

      <div className="bloc">
        <h2>Mon horaire de la semaine</h2>
        <form onSubmit={enregistrerSemaine}>
          <div className="semaine">
            {JOURS.map((j) => {
              const ligne = semaine[j.jour];
              return (
                <div className={"semaine-ligne" + (ligne.travaille ? "" : " repos")} key={j.jour}>
                  <label className="semaine-jour">
                    <input
                      type="checkbox"
                      checked={ligne.travaille}
                      onChange={(e) => changerJour(j.jour, "travaille", e.target.checked)}
                    />
                    {j.nom}
                  </label>
                  {ligne.travaille ? (
                    <>
                      <input type="time" value={ligne.debut} onChange={(e) => changerJour(j.jour, "debut", e.target.value)} required />
                      <input type="time" value={ligne.fin} onChange={(e) => changerJour(j.jour, "fin", e.target.value)} required />
                    </>
                  ) : (
                    <span className="gris semaine-repos">Congé</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="formulaire-ligne">
            <div>
              <label>Durée d'un créneau</label>
              <select value={duree} onChange={(e) => setDuree(Number(e.target.value))}>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1 h 30</option>
              </select>
            </div>
            <button type="submit">Enregistrer mon horaire</button>
          </div>
          <p className="gris aide">
            Un créneau correspond à un rendez-vous. Choisissez une durée assez longue pour vos services
            (ex. 45 minutes pour une coupe et barbe). Enregistrer l'horaire recrée vos créneaux libres :
            les rendez-vous déjà réservés ne bougent pas.
          </p>
        </form>
      </div>

      <div className="deux-blocs">
        <div className="bloc">
          <h2>Fermer une journée</h2>
          <p className="gris">Congé, rendez-vous personnel... Tous vos créneaux libres de cette journée sont retirés.</p>
          <form className="formulaire-ligne" onSubmit={fermerJournee}>
            <div>
              <label>Date</label>
              <input type="date" min={aujourdhui()} value={dateFermee} onChange={(e) => setDateFermee(e.target.value)} required />
            </div>
            <button type="submit" className="secondaire">Fermer</button>
          </form>
        </div>

        <div className="bloc">
          <h2>Ajouter une plage en extra</h2>
          <p className="gris">Pour une journée en dehors de votre horaire habituel.</p>
          <form className="formulaire-ligne" onSubmit={ajouterPlage}>
            <div>
              <label>Début</label>
              <input type="datetime-local" value={debut} onChange={(e) => setDebut(e.target.value)} required />
            </div>
            <div>
              <label>Fin</label>
              <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
            </div>
            <button type="submit">Ajouter</button>
          </form>
        </div>
      </div>

      <h2 className="titre-section">Mes créneaux <span className="compteur">{plages.length}</span></h2>
      {plages.length === 0 && <p className="vide">Aucun créneau. Cochez au moins une journée dans votre horaire de la semaine.</p>}
      {Object.keys(parJour).map((jour) => {
        const liste = parJour[jour];
        const nbReservees = liste.filter((p) => p.est_reserve).length;
        return (
          <div className="jour" key={jour}>
            <h3>
              {formatJourLong(jour + " 00:00:00")}
              <span className="gris"> · {liste.length - nbReservees} libre(s), {nbReservees} réservé(s)</span>
            </h3>
            <div className="creneaux">
              {liste.map((p) => p.est_reserve ? (
                <span className="plage reservee" key={p.id} title="Un client a réservé ce créneau">
                  {formatHeure(p.debut)} · Réservé
                </span>
              ) : (
                <span className="plage" key={p.id}>
                  {formatHeure(p.debut)} à {formatHeure(p.fin)}
                  <button type="button" title="Retirer ce créneau" onClick={() => retirer(p.id)}>×</button>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
