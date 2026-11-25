import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";

import Entete from "./composants/Entete.jsx";
import Connexion from "./pages/Connexion.jsx";
import Inscription from "./pages/Inscription.jsx";
import Barbiers from "./pages/Barbiers.jsx";
import Creneaux from "./pages/Creneaux.jsx";
import MesRendezVous from "./pages/MesRendezVous.jsx";
import Horaire from "./pages/Horaire.jsx";
import Disponibilites from "./pages/Disponibilites.jsx";
import Evaluations from "./pages/Evaluations.jsx";
import AdminBarbiers from "./pages/AdminBarbiers.jsx";
import AdminServices from "./pages/AdminServices.jsx";

export default function App() {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  // au demarrage on demande au serveur si quelqu'un est deja connecte
  useEffect(() => {
    api.get("/moi")
      .then((u) => setUtilisateur(u))
      .catch(() => setUtilisateur(null))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) {
    return <div className="chargeur plein" />;
  }

  // bloque l'acces a une page si le role est pas le bon
  function Protegee({ role, children }) {
    if (!utilisateur) return <Navigate to="/connexion" />;
    if (utilisateur.role !== role) return <Navigate to="/" />;
    return children;
  }

  // envoie chaque utilisateur vers sa page selon son role
  function Depart() {
    if (!utilisateur) return <Navigate to="/connexion" />;
    if (utilisateur.role === "client") return <Navigate to="/barbiers" />;
    if (utilisateur.role === "barbier") return <Navigate to="/horaire" />;
    return <Navigate to="/admin/barbiers" />;
  }

  return (
    <>
      <Entete utilisateur={utilisateur} setUtilisateur={setUtilisateur} />
      <main>
        <Routes>
          <Route path="/" element={<Depart />} />
          <Route path="/connexion" element={<Connexion setUtilisateur={setUtilisateur} />} />
          <Route path="/inscription" element={<Inscription setUtilisateur={setUtilisateur} />} />

          {/* client */}
          <Route path="/barbiers" element={<Protegee role="client"><Barbiers /></Protegee>} />
          <Route path="/barbier/:id" element={<Protegee role="client"><Creneaux /></Protegee>} />
          <Route path="/mes-rendezvous" element={<Protegee role="client"><MesRendezVous /></Protegee>} />

          {/* barbier */}
          <Route path="/horaire" element={<Protegee role="barbier"><Horaire /></Protegee>} />
          <Route path="/disponibilites" element={<Protegee role="barbier"><Disponibilites /></Protegee>} />
          <Route path="/evaluations" element={<Protegee role="barbier"><Evaluations /></Protegee>} />

          {/* admin */}
          <Route path="/admin/barbiers" element={<Protegee role="admin"><AdminBarbiers /></Protegee>} />
          <Route path="/admin/services" element={<Protegee role="admin"><AdminServices /></Protegee>} />

          <Route path="*" element={
            <div className="page centre introuvable">
              <p className="surtitre">Erreur 404</p>
              <h1>Page introuvable</h1>
              <p className="gris">La page demandée n'existe pas ou a été déplacée.</p>
            </div>
          } />
        </Routes>
      </main>
      <footer className="pied">
        <p>© {new Date().getFullYear()} BarberBook · Salon de barbier</p>
      </footer>
    </>
  );
}
