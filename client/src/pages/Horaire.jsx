import { useState, useEffect } from "react";
import { api } from "../api";

export default function Horaire() {
  const [rendezvous, setRendezvous] = useState([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/barbier/horaire").then(setRendezvous).catch((err) => setErreur(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Mon horaire</h1>
      {erreur && <p className="erreur">{erreur}</p>}
      {rendezvous.length === 0 && !erreur && <p className="vide">Aucun rendez-vous a venir.</p>}

      {rendezvous.map((r) => (
        <div className="ligne-bloc" key={r.id}>
          <div>
            <p className="date">{r.debut.substring(0, 16)}</p>
            <p>{r.service} ({r.duree_min} min) avec {r.client}</p>
          </div>
          <span className="prix">{r.prix} $</span>
        </div>
      ))}
    </div>
  );
}
