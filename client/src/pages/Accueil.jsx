import { useNavigate } from "react-router-dom";
import { api } from "../api";

// page temporaire pour tester que la connexion marche
// on va la remplacer par les vraies pages de chaque role
export default function Accueil({ utilisateur, setUtilisateur }) {
  const navigate = useNavigate();

  async function seDeconnecter() {
    await api.post("/deconnexion");
    setUtilisateur(null);
    navigate("/connexion");
  }

  return (
    <div className="carte">
      <h1>Bienvenue {utilisateur.nom}</h1>
      <p>Vous etes connecte en tant que : <strong>{utilisateur.role}</strong></p>
      <button onClick={seDeconnecter}>Se deconnecter</button>
    </div>
  );
}
