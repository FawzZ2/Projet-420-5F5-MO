import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Creneaux() {
  const { id } = useParams();   // id du barbier dans l'url
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [serviceChoisi, setServiceChoisi] = useState("");
  const [creneaux, setCreneaux] = useState([]);
  const [erreur, setErreur] = useState("");

  // charger les services une seule fois
  useEffect(() => {
    api.get("/client/services").then(setServices).catch((err) => setErreur(err.message));
  }, []);

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

  return (
    <div className="page">
      <h1>Reserver un rendez-vous</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="bloc">
        <label>Service</label>
        <select value={serviceChoisi} onChange={(e) => setServiceChoisi(e.target.value)}>
          <option value="">Choisir un service...</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.nom} - {s.duree_min} min - {s.prix} $</option>
          ))}
        </select>
      </div>

      {!serviceChoisi && <p className="vide">Choisissez un service pour voir les creneaux.</p>}
      {serviceChoisi && creneaux.length === 0 && <p className="vide">Aucun creneau libre pour ce service.</p>}

      <div className="grille">
        {creneaux.map((c) => (
          <div className="bloc centre" key={c.id}>
            <p className="date">{c.debut.substring(0, 16)}</p>
            <button onClick={() => reserver(c.id)}>Reserver</button>
          </div>
        ))}
      </div>
    </div>
  );
}
