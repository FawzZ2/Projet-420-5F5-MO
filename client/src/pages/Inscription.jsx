import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import CadreAuth from "../composants/CadreAuth.jsx";

export default function Inscription({ setUtilisateur }) {
  const [nom, setNom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  async function creerCompte(e) {
    e.preventDefault();
    setErreur("");
    try {
      const u = await api.post("/inscription", { nom, courriel, password });
      setUtilisateur(u);
      navigate("/");
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <CadreAuth>
      <h1>Créer un compte</h1>
      <p className="sous-titre">Quelques secondes suffisent pour réserver votre première coupe.</p>
      {erreur && <p className="erreur">{erreur}</p>}

      <form onSubmit={creerCompte}>
        <label>Nom complet</label>
        <input type="text" placeholder="Prénom Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />

        <label>Courriel</label>
        <input type="email" placeholder="vous@exemple.com" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />

        <label>Mot de passe <span className="gris">(8 caractères min.)</span></label>
        <input type="password" placeholder="••••••••" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Créer mon compte</button>
      </form>

      <p className="petit">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
    </CadreAuth>
  );
}
