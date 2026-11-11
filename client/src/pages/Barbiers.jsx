import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Barbiers() {
  const [barbiers, setBarbiers] = useState([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/client/barbiers")
      .then(setBarbiers)
      .catch((err) => setErreur(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Choisissez votre barbier</h1>
      {erreur && <p className="erreur">{erreur}</p>}
      {barbiers.length === 0 && !erreur && <p className="vide">Aucun barbier pour le moment.</p>}

      <div className="grille">
        {barbiers.map((b) => (
          <div className="bloc" key={b.id}>
            <h2>{b.nom}</h2>
            {b.nb_avis > 0
              ? <p className="note">{b.note_moyenne} / 5 <span className="gris">({b.nb_avis} avis)</span></p>
              : <p className="gris">Pas encore d'avis</p>}
            <Link className="bouton" to={"/barbier/" + b.id}>Voir les disponibilites</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
