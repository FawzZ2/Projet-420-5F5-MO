import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { initiales } from "../format";
import { Etoiles } from "../composants/Avis.jsx";
import { IconeMessage } from "../composants/Icones.jsx";
import FenetreAvis from "../composants/FenetreAvis.jsx";

export default function Barbiers() {
  const [barbiers, setBarbiers] = useState([]);
  const [erreur, setErreur] = useState("");
  const [avisOuvert, setAvisOuvert] = useState(null); // id du barbier dont on lit les avis

  useEffect(() => {
    api.get("/client/barbiers")
      .then(setBarbiers)
      .catch((err) => setErreur(err.message));
  }, []);

  return (
    <div className="page">
      <section className="banniere">
        <p className="surtitre">Réservation en ligne</p>
        <h1>Choisissez votre barbier</h1>
        <p>Consultez les avis de nos clients et réservez votre prochaine coupe en quelques clics.</p>
      </section>

      {erreur && <p className="erreur">{erreur}</p>}
      {barbiers.length === 0 && !erreur && <p className="vide">Aucun barbier pour le moment.</p>}

      <div className="grille">
        {barbiers.map((b) => (
          <article className="bloc carte-barbier" key={b.id}>
            <span className="avatar grand">{initiales(b.nom)}</span>
            <h2>{b.nom}</h2>
            {b.nb_avis > 0 ? (
              <p className="note-ligne">
                <Etoiles note={b.note_moyenne} />
                <strong>{b.note_moyenne}</strong>
                <span className="gris">({b.nb_avis} avis)</span>
              </p>
            ) : (
              <p className="gris">Pas encore d'avis</p>
            )}
            <div className="carte-actions">
              <button className="secondaire" onClick={() => setAvisOuvert(b.id)}>
                <IconeMessage taille={16} /> Voir les avis
              </button>
              <Link className="bouton" to={"/barbier/" + b.id}>Réserver</Link>
            </div>
          </article>
        ))}
      </div>

      {avisOuvert && <FenetreAvis barbierId={avisOuvert} onFermer={() => setAvisOuvert(null)} />}
    </div>
  );
}
