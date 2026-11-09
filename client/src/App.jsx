import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";
import Connexion from "./pages/Connexion.jsx";
import Inscription from "./pages/Inscription.jsx";
import Accueil from "./pages/Accueil.jsx";

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

  return (
    <Routes>
      <Route
        path="/"
        element={utilisateur
          ? <Accueil utilisateur={utilisateur} setUtilisateur={setUtilisateur} />
          : <Navigate to="/connexion" />}
      />
      <Route path="/connexion" element={<Connexion setUtilisateur={setUtilisateur} />} />
      <Route path="/inscription" element={<Inscription setUtilisateur={setUtilisateur} />} />
    </Routes>
  );
}
