import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";

import Entete from "./composants/Entete.jsx";
import Connexion from "./pages/Connexion.jsx";
import Inscription from "./pages/Inscription.jsx";
import Barbiers from "./pages/Barbiers.jsx";
import Creneaux from "./pages/Creneaux.jsx";
import MesRendezVous from "./pages/MesRendezVous.jsx";

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
    return <p className="centre">Chargement...</p>;
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
    return <p className="centre">Espace {utilisateur.role} en construction.</p>;
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

          <Route path="*" element={<p className="centre">Page introuvable.</p>} />
        </Routes>
      </main>
    </>
  );
}
