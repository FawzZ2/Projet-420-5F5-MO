import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

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
    <div className="carte">
      <h1>Creer un compte</h1>
      {erreur && <p className="erreur">{erreur}</p>}

      <form onSubmit={creerCompte}>
        <label>Nom</label>
        <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />

        <label>Courriel</label>
        <input type="email" value={courriel} onChange={(e) => setCourriel(e.target.value)} required />

        <label>Mot de passe (8 caracteres min)</label>
        <input type="password" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Creer mon compte</button>
      </form>

      <p className="petit">Deja un compte ? <Link to="/connexion">Se connecter</Link></p>
    </div>
  );
}
