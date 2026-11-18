import { useState, useEffect } from "react";
import { api } from "../api";

export default function AdminBarbiers() {
  const [barbiers, setBarbiers] = useState([]);
  const [nom, setNom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  // le barbier en train d'etre modifie (null si aucun)
  const [enModif, setEnModif] = useState(null);
  const [modifNom, setModifNom] = useState("");
  const [modifCourriel, setModifCourriel] = useState("");

  function charger() {
    api.get("/admin/barbiers").then(setBarbiers).catch((err) => setErreur(err.message));
  }

  useEffect(charger, []);

  async function ajouter(e) {
    e.preventDefault();
    setErreur("");
    try {
      await api.post("/admin/barbiers", { nom, courriel, password });
      setNom("");
      setCourriel("");
      setPassword("");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  function commencerModif(b) {
    setEnModif(b.id);
    setModifNom(b.nom);
    setModifCourriel(b.courriel);
  }

  async function enregistrer(id) {
    setErreur("");
    try {
      await api.put("/admin/barbiers/" + id, { nom: modifNom, courriel: modifCourriel });
      setEnModif(null);
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  // retirer ou reactiver selon l'etat du barbier
  async function changerEtat(b) {
    if (b.actif && !confirm("Retirer " + b.nom + " du salon ?")) return;
    setErreur("");
    try {
      await api.post("/admin/barbiers/" + b.id + (b.actif ? "/retirer" : "/reactiver"));
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Gestion des barbiers</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="bloc">
        <h2>Ajouter un barbier</h2>
        <form className="formulaire-ligne" onSubmit={ajouter}>
          <div>
            <label>Nom</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div>
            <label>Courriel</label>
            <input type="email" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />
          </div>
          <div>
            <label>Mot de passe</label>
            <input type="password" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Ajouter</button>
        </form>
      </div>

      <h2>Equipe du salon</h2>
      {barbiers.map((b) => (
        <div className={"ligne-bloc" + (b.actif ? "" : " inactif")} key={b.id}>
          {enModif === b.id ? (
            <>
              <div className="actions">
                <input type="text" value={modifNom} onChange={(e) => setModifNom(e.target.value)} />
                <input type="email" value={modifCourriel} onChange={(e) => setModifCourriel(e.target.value)} />
              </div>
              <div className="actions">
                <button onClick={() => enregistrer(b.id)}>Enregistrer</button>
                <button className="secondaire" onClick={() => setEnModif(null)}>Annuler</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="date">{b.nom} {!b.actif && <span className="etiquette">Retire</span>}</p>
                <p className="gris">{b.courriel}</p>
              </div>
              <div className="actions">
                {b.actif === 1 && <button className="secondaire" onClick={() => commencerModif(b)}>Modifier</button>}
                <button className="secondaire" onClick={() => changerEtat(b)}>
                  {b.actif ? "Retirer" : "Reactiver"}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
