import { useState, useEffect } from "react";
import { api } from "../api";

export default function Evaluations() {
  const [avis, setAvis] = useState([]);
  const [moyenne, setMoyenne] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/barbier/evaluations")
      .then((data) => {
        setAvis(data.avis);
        setMoyenne(data.moyenne);
      })
      .catch((err) => setErreur(err.message));
  }, []);

  return (
    <div className="page">
      <h1>Mes evaluations</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      {moyenne
        ? <p className="note grande">{moyenne} / 5 <span className="gris">sur {avis.length} avis</span></p>
        : !erreur && <p className="vide">Pas encore d'evaluation.</p>}

      {avis.map((a) => (
        <div className="bloc" key={a.id}>
          <p className="note">{a.note} / 5 <span className="gris">{a.service} - {a.date_avis.substring(0, 10)}</span></p>
          {a.commentaire && <p>{a.commentaire}</p>}
        </div>
      ))}
    </div>
  );
}
