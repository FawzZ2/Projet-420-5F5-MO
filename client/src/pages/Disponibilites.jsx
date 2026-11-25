import { useState, useEffect } from "react";
import { api } from "../api";
import { formatJourLong, formatHeure } from "../format";
import BadgeDate from "../composants/BadgeDate.jsx";

export default function Disponibilites() {
  const [plages, setPlages] = useState([]);
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [erreur, setErreur] = useState("");

  function charger() {
    api.get("/barbier/disponibilites").then(setPlages).catch((err) => setErreur(err.message));
  }

  useEffect(charger, []);

  async function ouvrir(e) {
    e.preventDefault();
    setErreur("");
    try {
      await api.post("/barbier/disponibilites", { debut, fin });
      setDebut("");
      setFin("");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function retirer(id) {
    if (!confirm("Retirer cette plage ?")) return;
    setErreur("");
    try {
      await api.post("/barbier/disponibilites/" + id + "/retirer");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <div className="page">
      <div className="entete-page">
        <p className="surtitre">Espace barbier</p>
        <h1>Mes disponibilités</h1>
        <p className="gris">Ouvrez des plages horaires pour que les clients puissent réserver.</p>
      </div>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="bloc">
        <h2>Ouvrir une plage</h2>
        <form className="formulaire-ligne" onSubmit={ouvrir}>
          <div>
            <label>Début</label>
            <input type="datetime-local" value={debut} onChange={(e) => setDebut(e.target.value)} required />
          </div>
          <div>
            <label>Fin</label>
            <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
          </div>
          <button type="submit">Ouvrir la plage</button>
        </form>
      </div>

      <h2 className="titre-section">Mes plages <span className="compteur">{plages.length}</span></h2>
      {plages.length === 0 && <p className="vide">Aucune plage ouverte. Les clients ne peuvent pas réserver avec vous.</p>}
      {plages.map((p) => (
        <div className="ligne-bloc" key={p.id}>
          <BadgeDate date={p.debut} />
          <div className="ligne-infos">
            <p className="date">{formatJourLong(p.debut)}</p>
            <p className="gris">{formatHeure(p.debut)} à {formatHeure(p.fin)}</p>
          </div>
          {p.est_reserve
            ? <span className="etiquette accent">Réservée</span>
            : <span className="etiquette vert">Libre</span>}
          {!p.est_reserve && <button className="secondaire danger" onClick={() => retirer(p.id)}>Retirer</button>}
        </div>
      ))}
    </div>
  );
}
