import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { formatJourLong, formatHeure, formatPrix, initiales } from "../format";
import { Etoiles, ListeAvis } from "../composants/Avis.jsx";
import { IconeRetour, IconeHorloge } from "../composants/Icones.jsx";

export default function Creneaux() {
  const { id } = useParams();   // id du barbier dans l'url
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [serviceChoisi, setServiceChoisi] = useState("");
  const [creneaux, setCreneaux] = useState([]);
  const [erreur, setErreur] = useState("");
  const [infoBarbier, setInfoBarbier] = useState(null); // nom + avis du barbier

  useEffect(() => {
    api.get("/client/services").then(setServices).catch((err) => setErreur(err.message));
  }, []);

  useEffect(() => {
    api.get("/client/barbiers/" + id + "/avis").then(setInfoBarbier).catch(() => setInfoBarbier(null));
  }, [id]);

  // recharger les creneaux chaque fois que le service change
  useEffect(() => {
    if (!serviceChoisi) {
      setCreneaux([]);
      return;
    }
    api.get("/client/creneaux?barbier=" + id + "&service=" + serviceChoisi)
      .then(setCreneaux)
      .catch((err) => setErreur(err.message));
  }, [id, serviceChoisi]);

  async function reserver(disponibiliteId) {
    setErreur("");
    try {
      await api.post("/client/reserver", { disponibilite_id: disponibiliteId, service_id: serviceChoisi });
      navigate("/mes-rendezvous");
    } catch (err) {
      // arrive si quelqu'un d'autre a pris le creneau entre temps
      setErreur(err.message);
      const nouveaux = await api.get("/client/creneaux?barbier=" + id + "&service=" + serviceChoisi);
      setCreneaux(nouveaux);
    }
  }

  // on regroupe les creneaux par journee pour l'affichage
  const parJour = {};
  creneaux.forEach((c) => {
    const jour = c.debut.substring(0, 10);
    if (!parJour[jour]) parJour[jour] = [];
    parJour[jour].push(c);
  });

  return (
    <div className="page large">
      <Link className="retour" to="/barbiers"><IconeRetour taille={16} /> Tous les barbiers</Link>

      <div className="deux-colonnes">
        <section>
          <div className="entete-page">
            <p className="surtitre">Étape 1 · Service</p>
            <h1>Réserver un rendez-vous{infoBarbier ? " avec " + infoBarbier.barbier.nom : ""}</h1>
          </div>
          {erreur && <p className="erreur">{erreur}</p>}

          <div className="choix-services">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                className={"choix-service" + (String(s.id) === String(serviceChoisi) ? " actif" : "")}
                onClick={() => setServiceChoisi(String(s.id))}
              >
                <span className="choix-nom">{s.nom}</span>
                <span className="choix-details">
                  <span><IconeHorloge taille={14} /> {s.duree_min} min</span>
                  <strong>{formatPrix(s.prix)}</strong>
                </span>
              </button>
            ))}
          </div>

          <p className="surtitre espace">Étape 2 · Créneau</p>
          {!serviceChoisi && <p className="vide">Choisissez un service pour voir les créneaux disponibles.</p>}
          {serviceChoisi && creneaux.length === 0 && <p className="vide">Aucun créneau libre pour ce service.</p>}

          {Object.keys(parJour).map((jour) => (
            <div className="jour" key={jour}>
              <h3>{formatJourLong(jour + " 00:00:00")}</h3>
              <div className="creneaux">
                {parJour[jour].map((c) => (
                  <button key={c.id} className="creneau" onClick={() => reserver(c.id)} title="Réserver ce créneau">
                    {formatHeure(c.debut)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="bloc panneau-avis">
          {infoBarbier ? (
            <>
              <div className="panneau-tete">
                <span className="avatar">{initiales(infoBarbier.barbier.nom)}</span>
                <div>
                  <h2>{infoBarbier.barbier.nom}</h2>
                  {infoBarbier.moyenne ? (
                    <p className="note-ligne">
                      <Etoiles note={infoBarbier.moyenne} taille={14} />
                      <strong>{infoBarbier.moyenne}</strong>
                      <span className="gris">({infoBarbier.avis.length} avis)</span>
                    </p>
                  ) : (
                    <p className="gris">Pas encore d'avis</p>
                  )}
                </div>
              </div>
              <h3 className="panneau-titre">Ce que disent les clients</h3>
              <ListeAvis avis={infoBarbier.avis} />
            </>
          ) : (
            <div className="chargeur" />
          )}
        </aside>
      </div>
    </div>
  );
}
