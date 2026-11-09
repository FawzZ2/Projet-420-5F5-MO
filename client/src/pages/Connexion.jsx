import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

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
    <div className="carte">
      <h1>Connexion</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <form onSubmit={seConnecter}>
        <label>Courriel</label>
        <input type="email" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />

        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Se connecter</button>
      </form>

      <p className="petit">Pas de compte ? <Link to="/inscription">Creer un compte</Link></p>
    </div>
  );
}
