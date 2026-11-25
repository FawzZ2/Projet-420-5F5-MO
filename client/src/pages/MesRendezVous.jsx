import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatJourLong, formatHeure, formatPrix } from "../format";
import BadgeDate from "../composants/BadgeDate.jsx";
import { Etoiles } from "../composants/Avis.jsx";

export default function MesRendezVous() {
  const [rendezvous, setRendezvous] = useState([]);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState({});             // la note choisie pour chaque rendez-vous
  const [commentaires, setCommentaires] = useState({}); // le commentaire pour chaque rendez-vous

  function charger() {
    api.get("/client/rendezvous").then(setRendezvous).catch((err) => setErreur(err.message));
  }

  useEffect(charger, []);

  async function annuler(id) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    setErreur("");
    setMessage("");
    try {
      await api.post("/client/annuler/" + id);
      setMessage("Rendez-vous annulé.");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function evaluer(id) {
    setErreur("");
    setMessage("");
    if (!notes[id]) {
      setErreur("Choisissez une note avant d'évaluer.");
      return;
    }
    try {
      await api.post("/client/evaluer/" + id, { note: notes[id], commentaire: commentaires[id] });
      setMessage("Merci pour votre évaluation !");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  // on separe les rendez-vous a venir et passes
  const maintenant = new Date();
  const aVenir = rendezvous.filter((r) => r.statut === "confirme" && new Date(r.debut) > maintenant);
  const passes = rendezvous.filter((r) => r.statut === "annule" || new Date(r.debut) <= maintenant);

  return (
    <div className="page">
      <div className="entete-page avec-action">
        <div>
          <p className="surtitre">Espace client</p>
          <h1>Mes rendez-vous</h1>
        </div>
        <Link className="bouton" to="/barbiers">Nouveau rendez-vous</Link>
      </div>
      {erreur && <p className="erreur">{erreur}</p>}
      {message && <p className="succes">{message}</p>}

      <h2 className="titre-section">À venir <span className="compteur">{aVenir.length}</span></h2>
      {aVenir.length === 0 && <p className="vide">Aucun rendez-vous à venir.</p>}
      {aVenir.map((r) => (
        <div className="ligne-bloc" key={r.id}>
          <BadgeDate date={r.debut} />
          <div className="ligne-infos">
            <p className="date">{formatJourLong(r.debut)} · {formatHeure(r.debut)}</p>
            <p className="gris">{r.service} avec {r.barbier} · {formatPrix(r.prix)}</p>
          </div>
          <button className="secondaire danger" onClick={() => annuler(r.id)}>Annuler</button>
        </div>
      ))}

      <h2 className="titre-section">Historique <span className="compteur">{passes.length}</span></h2>
      {passes.length === 0 && <p className="vide">Aucun rendez-vous passé.</p>}
      {passes.map((r) => {
        // on peut evaluer seulement un rendez-vous fini, pas annule, et pas deja evalue
        const peutEvaluer = r.statut !== "annule" && !r.ma_note && new Date(r.fin) <= maintenant;

        return (
          <div className={"ligne-bloc" + (peutEvaluer ? " avec-formulaire" : "")} key={r.id}>
            <BadgeDate date={r.debut} attenue />
            <div className="ligne-infos">
              <p className="date">
                {formatJourLong(r.debut)} · {formatHeure(r.debut)}
                {r.statut === "annule" && <span className="etiquette">Annulé</span>}
              </p>
              <p className="gris">{r.service} avec {r.barbier}</p>
            </div>

            {r.ma_note && (
              <span className="note-ligne"><span className="gris">Votre note</span> <Etoiles note={r.ma_note} taille={15} /></span>
            )}

            {peutEvaluer && (
              <div className="evaluer">
                <select value={notes[r.id] || ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}>
                  <option value="">Note</option>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n}/5</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Partagez votre expérience (optionnel)"
                  value={commentaires[r.id] || ""}
                  onChange={(e) => setCommentaires({ ...commentaires, [r.id]: e.target.value })}
                />
                <button onClick={() => evaluer(r.id)}>Évaluer</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
