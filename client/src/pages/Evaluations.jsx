import { useState, useEffect } from "react";
import { api } from "../api";
import { ResumeAvis, ListeAvis } from "../composants/Avis.jsx";

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
      <div className="entete-page">
        <p className="surtitre">Espace barbier</p>
        <h1>Mes évaluations</h1>
      </div>
      {erreur && <p className="erreur">{erreur}</p>}

      {moyenne
        ? <div className="bloc"><ResumeAvis moyenne={moyenne} avis={avis} /></div>
        : !erreur && <p className="vide">Pas encore d'évaluation.</p>}

      {avis.length > 0 && (
        <div className="bloc">
          <h2>Commentaires</h2>
          <ListeAvis avis={avis} />
        </div>
      )}
    </div>
  );
}
