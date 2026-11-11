import { useState, useEffect } from "react";
import { api } from "../api";

export default function MesRendezVous() {
  const [rendezvous, setRendezvous] = useState([]);
  const [erreur, setErreur] = useState("");

  function charger() {
    api.get("/client/rendezvous").then(setRendezvous).catch((err) => setErreur(err.message));
  }

  useEffect(charger, []);

  async function annuler(id) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    setErreur("");
    try {
      await api.post("/client/annuler/" + id);
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  // on separe les rendez-vous a venir et passes
  const maintenant = new Date();
  const aVenir = rendezvous.filter((r) => r.statut === "confirme" && new Date(r.debut) > maintenant);
  const passes = rendezvous.filter((r) => r.statut !== "confirme" || new Date(r.debut) <= maintenant);

  return (
    <div className="page">
      <h1>Mes rendez-vous</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <h2>A venir</h2>
      {aVenir.length === 0 && <p className="vide">Aucun rendez-vous a venir.</p>}
      {aVenir.map((r) => (
        <div className="ligne-bloc" key={r.id}>
          <div>
            <p className="date">{r.debut.substring(0, 16)}</p>
            <p>{r.service} avec {r.barbier} - {r.prix} $</p>
          </div>
          <button className="secondaire" onClick={() => annuler(r.id)}>Annuler</button>
        </div>
      ))}

      <h2>Historique</h2>
      {passes.length === 0 && <p className="vide">Aucun rendez-vous passe.</p>}
      {passes.map((r) => (
        <div className="ligne-bloc" key={r.id}>
          <div>
            <p className="date">
              {r.debut.substring(0, 16)}
              {r.statut === "annule" && <span className="etiquette">Annule</span>}
            </p>
            <p>{r.service} avec {r.barbier}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
