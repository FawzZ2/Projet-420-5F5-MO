import { useState, useEffect } from "react";
import { api } from "../api";
import { formatJourLong, formatHeure, formatPrix } from "../format";
import BadgeDate from "../composants/BadgeDate.jsx";

export default function Horaire() {
  const [rendezvous, setRendezvous] = useState([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/barbier/horaire").then(setRendezvous).catch((err) => setErreur(err.message));
  }, []);

  return (
    <div className="page">
      <div className="entete-page">
        <p className="surtitre">Espace barbier</p>
        <h1>Mon horaire</h1>
        <p className="gris">Vos prochains rendez-vous confirmés.</p>
      </div>
      {erreur && <p className="erreur">{erreur}</p>}
      {rendezvous.length === 0 && !erreur && <p className="vide">Aucun rendez-vous à venir.</p>}

      {rendezvous.map((r) => (
        <div className="ligne-bloc" key={r.id}>
          <BadgeDate date={r.debut} />
          <div className="ligne-infos">
            <p className="date">{formatJourLong(r.debut)} · {formatHeure(r.debut)}</p>
            <p className="gris">{r.service} ({r.duree_min} min) avec {r.client}</p>
          </div>
          <span className="prix">{formatPrix(r.prix)}</span>
        </div>
      ))}
    </div>
  );
}
