import { useState, useEffect } from "react";
import { api } from "../api";

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
      <h1>Mes disponibilites</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="bloc">
        <h2>Ouvrir une plage</h2>
        <form className="formulaire-ligne" onSubmit={ouvrir}>
          <div>
            <label>Debut</label>
            <input type="datetime-local" value={debut} onChange={(e) => setDebut(e.target.value)} required />
          </div>
          <div>
            <label>Fin</label>
            <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
          </div>
          <button type="submit">Ouvrir</button>
        </form>
      </div>

      <h2>Mes plages</h2>
      {plages.length === 0 && <p className="vide">Aucune plage ouverte. Les clients ne peuvent pas reserver avec vous.</p>}
      {plages.map((p) => (
        <div className="ligne-bloc" key={p.id}>
          <div>
            <p className="date">{p.debut.substring(0, 16)} a {p.fin.substring(11, 16)}</p>
            {p.est_reserve
              ? <span className="etiquette orange">Reservee</span>
              : <span className="gris">Libre</span>}
          </div>
          {!p.est_reserve && <button className="secondaire" onClick={() => retirer(p.id)}>Retirer</button>}
        </div>
      ))}
    </div>
  );
}
