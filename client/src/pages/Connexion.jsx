import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import CadreAuth from "../composants/CadreAuth.jsx";

export default function Connexion({ setUtilisateur }) {
  const [courriel, setCourriel] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  async function seConnecter(e) {
    e.preventDefault();
    setErreur("");
    try {
      const u = await api.post("/connexion", { courriel, password });
      setUtilisateur(u);
      navigate("/");
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <CadreAuth>
      <h1>Bon retour</h1>
      <p className="sous-titre">Connectez-vous pour gérer vos rendez-vous.</p>
      {erreur && <p className="erreur">{erreur}</p>}

      <form onSubmit={seConnecter}>
        <label>Courriel</label>
        <input type="email" placeholder="vous@exemple.com" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />

        <label>Mot de passe</label>
        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Se connecter</button>
      </form>

      <p className="petit">Pas de compte ? <Link to="/inscription">Créer un compte</Link></p>
    </CadreAuth>
  );
}
