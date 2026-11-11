import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

// barre du haut
export default function Entete({ utilisateur, setUtilisateur }) {
  const navigate = useNavigate();

  async function seDeconnecter() {
    await api.post("/deconnexion");
    setUtilisateur(null);
    navigate("/connexion");
  }

  return (
    <header className="entete">
      <Link className="logo" to="/">BarberBook</Link>

      {utilisateur && (
        <>
          <nav>
            {utilisateur.role === "client" && (
              <>
                <Link to="/barbiers">Barbiers</Link>
                <Link to="/mes-rendezvous">Mes rendez-vous</Link>
              </>
            )}
          </nav>

          <div className="droite">
            <span className="nom">{utilisateur.nom}</span>
            <button className="lien" onClick={seDeconnecter}>Deconnexion</button>
          </div>
        </>
      )}
    </header>
  );
}
