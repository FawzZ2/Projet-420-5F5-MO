import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { initiales } from "../format";
import { ResumeAvis, ListeAvis } from "./Avis.jsx";
import { IconeFermer } from "./Icones.jsx";

// fenetre (modale) qui montre les commentaires des clients sur un barbier
export default function FenetreAvis({ barbierId, onFermer }) {
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/client/barbiers/" + barbierId + "/avis")
      .then(setData)
      .catch((err) => setErreur(err.message));
  }, [barbierId]);

  // fermer avec la touche Echap
  useEffect(() => {
    function touche(e) {
      if (e.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", touche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", touche);
      document.body.style.overflow = "";
    };
  }, [onFermer]);

  return (
    <div className="voile" onClick={onFermer}>
      <div className="fenetre" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="fenetre-tete">
          {data && (
            <div className="fenetre-titre">
              <span className="avatar">{initiales(data.barbier.nom)}</span>
              <div>
                <p className="surtitre">Avis des clients</p>
                <h2>{data.barbier.nom}</h2>
              </div>
            </div>
          )}
          <button className="icone-bouton" onClick={onFermer} aria-label="Fermer"><IconeFermer /></button>
        </div>

        <div className="fenetre-corps">
          {erreur && <p className="erreur">{erreur}</p>}
          {!data && !erreur && <div className="chargeur" />}
          {data && (
            <>
              {data.avis.length > 0 && <ResumeAvis moyenne={data.moyenne} avis={data.avis} />}
              <ListeAvis avis={data.avis} />
            </>
          )}
        </div>

        {data && (
          <div className="fenetre-pied">
            <Link className="bouton" to={"/barbier/" + barbierId}>Réserver avec {data.barbier.nom.split(" ")[0]}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
