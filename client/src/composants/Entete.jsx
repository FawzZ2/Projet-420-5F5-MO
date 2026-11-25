import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";
import { initiales } from "../format";
import { IconeCiseaux, IconeSortie } from "./Icones.jsx";

export function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-icone"><IconeCiseaux taille={18} /></span>
      <span className="logo-texte">Barber<span>Book</span></span>
    </Link>
  );
}

const ROLES = { client: "Client", barbier: "Barbier", admin: "Administrateur" };

export default function Entete({ utilisateur, setUtilisateur }) {
  const navigate = useNavigate();

  async function seDeconnecter() {
    await api.post("/deconnexion");
    setUtilisateur(null);
    navigate("/connexion");
  }

  return (
    <header className="entete">
      <div className="entete-interieur">
        <Logo />

        {utilisateur && (
          <>
            <nav>
              {utilisateur.role === "client" && (
                <>
                  <NavLink to="/barbiers">Barbiers</NavLink>
                  <NavLink to="/mes-rendezvous">Mes rendez-vous</NavLink>
                </>
              )}
              {utilisateur.role === "barbier" && (
                <>
                  <NavLink to="/horaire">Mon horaire</NavLink>
                  <NavLink to="/disponibilites">Mes disponibilités</NavLink>
                  <NavLink to="/evaluations">Mes évaluations</NavLink>
                </>
              )}
              {utilisateur.role === "admin" && (
                <>
                  <NavLink to="/admin/barbiers">Barbiers</NavLink>
                  <NavLink to="/admin/services">Services</NavLink>
                </>
              )}
            </nav>

            <div className="droite">
              <span className="avatar petit">{initiales(utilisateur.nom)}</span>
              <span className="nom">
                {utilisateur.nom}
                <small>{ROLES[utilisateur.role]}</small>
              </span>
              <button className="icone-bouton clair" onClick={seDeconnecter} title="Déconnexion" aria-label="Déconnexion">
                <IconeSortie />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
