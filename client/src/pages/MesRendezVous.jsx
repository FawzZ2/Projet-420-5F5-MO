import { useState, useEffect } from "react";
import { api } from "../api";

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
      setMessage("Rendez-vous annule.");
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function evaluer(id) {
    setErreur("");
    setMessage("");
    if (!notes[id]) {
      setErreur("Choisissez une note avant d'evaluer.");
      return;
    }
    try {
      await api.post("/client/evaluer/" + id, { note: notes[id], commentaire: commentaires[id] });
      setMessage("Merci pour votre evaluation !");
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
      <h1>Mes rendez-vous</h1>
      {erreur && <p className="erreur">{erreur}</p>}
      {message && <p className="succes">{message}</p>}

      <h2>A venir</h2>
      {aVenir.length === 0 && <p className="vide">Aucun rendez-vous a venir.</p>}
      {aVenir.map((r) => (
        <div className="ligne-bloc" key={r.id}>
          <div>
            <p className="date">{r.debut.substring(0, 16)}</p>
            <p>{r.service} avec {r.barbier} - {r.prix} $</p>
          </div>
          <button className="secondaire" onClick={() => annuler(r.id)}>Annuler</button>
        </div>
      ))}

      <h2>Historique</h2>
      {passes.length === 0 && <p className="vide">Aucun rendez-vous passe.</p>}
      {passes.map((r) => {
        // on peut evaluer seulement un rendez-vous fini, pas annule, et pas deja evalue
        const peutEvaluer = r.statut !== "annule" && !r.ma_note && new Date(r.fin) <= maintenant;

        return (
          <div className="ligne-bloc" key={r.id}>
            <div>
              <p className="date">
                {r.debut.substring(0, 16)}
                {r.statut === "annule" && <span className="etiquette">Annule</span>}
              </p>
              <p>{r.service} avec {r.barbier}</p>
            </div>

            {peutEvaluer && (
              <div className="actions">
                <select value={notes[r.id] || ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}>
                  <option value="">Note</option>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Commentaire (optionnel)"
                  value={commentaires[r.id] || ""}
                  onChange={(e) => setCommentaires({ ...commentaires, [r.id]: e.target.value })}
                />
                <button onClick={() => evaluer(r.id)}>Evaluer</button>
              </div>
            )}

            {r.ma_note && <span className="note">Votre note : {r.ma_note} / 5</span>}
          </div>
        );
      })}
    </div>
  );
}
