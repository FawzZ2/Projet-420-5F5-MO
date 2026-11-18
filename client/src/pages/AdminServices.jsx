import { useState, useEffect } from "react";
import { api } from "../api";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [nom, setNom] = useState("");
  const [duree, setDuree] = useState("");
  const [prix, setPrix] = useState("");
  const [erreur, setErreur] = useState("");

  // le service en train d'etre modifie (null si aucun)
  const [enModif, setEnModif] = useState(null);
  const [modif, setModif] = useState({ nom: "", duree_min: "", prix: "" });

  function charger() {
    api.get("/admin/services").then(setServices).catch((err) => setErreur(err.message));
  }

  useEffect(charger, []);

  async function ajouter(e) {
    e.preventDefault();
    setErreur("");
    try {
      await api.post("/admin/services", { nom, duree_min: duree, prix });
      setNom("");
      setDuree("");
      setPrix("");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  function commencerModif(s) {
    setEnModif(s.id);
    setModif({ nom: s.nom, duree_min: s.duree_min, prix: s.prix });
  }

  async function enregistrer(id) {
    setErreur("");
    try {
      await api.put("/admin/services/" + id, modif);
      setEnModif(null);
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function retirer(s) {
    if (!confirm("Retirer le service " + s.nom + " ?")) return;
    setErreur("");
    try {
      await api.post("/admin/services/" + s.id + "/retirer");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Gestion des services</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="bloc">
        <h2>Ajouter un service</h2>
        <form className="formulaire-ligne" onSubmit={ajouter}>
          <div>
            <label>Nom</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div>
            <label>Duree (min)</label>
            <input type="number" min="5" step="5" value={duree} onChange={(e) => setDuree(e.target.value)} required />
          </div>
          <div>
            <label>Prix ($)</label>
            <input type="number" min="0" step="0.01" value={prix} onChange={(e) => setPrix(e.target.value)} required />
          </div>
          <button type="submit">Ajouter</button>
        </form>
      </div>

      <h2>Services du salon</h2>
      {services.length === 0 && <p className="vide">Aucun service. Les clients ne peuvent pas reserver.</p>}
      {services.map((s) => (
        <div className="ligne-bloc" key={s.id}>
          {enModif === s.id ? (
            <>
              <div className="actions">
                <input type="text" value={modif.nom} onChange={(e) => setModif({ ...modif, nom: e.target.value })} />
                <input type="number" min="5" step="5" value={modif.duree_min} onChange={(e) => setModif({ ...modif, duree_min: e.target.value })} />
                <input type="number" min="0" step="0.01" value={modif.prix} onChange={(e) => setModif({ ...modif, prix: e.target.value })} />
              </div>
              <div className="actions">
                <button onClick={() => enregistrer(s.id)}>Enregistrer</button>
                <button className="secondaire" onClick={() => setEnModif(null)}>Annuler</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="date">{s.nom}</p>
                <p className="gris">{s.duree_min} minutes - {s.prix} $</p>
              </div>
              <div className="actions">
                <button className="secondaire" onClick={() => commencerModif(s)}>Modifier</button>
                <button className="secondaire" onClick={() => retirer(s)}>Retirer</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
