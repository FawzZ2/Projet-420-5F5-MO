import { formatJour, initiales } from "../format";

// etoiles de 0 a 5, avec remplissage partiel (ex: 4.5)
export function Etoiles({ note, taille = 16 }) {
  const n = Number(note) || 0;
  return (
    <span className="etoiles" style={{ fontSize: taille + "px" }} aria-label={n + " sur 5"}>
      {[1, 2, 3, 4, 5].map((i) => {
        const remplissage = Math.max(0, Math.min(1, n - i + 1));
        return (
          <span className="etoile" key={i}>
            ★<span className="etoile-pleine" style={{ width: remplissage * 100 + "%" }}>★</span>
          </span>
        );
      })}
    </span>
  );
}

// resume : moyenne + repartition des notes
export function ResumeAvis({ moyenne, avis }) {
  const total = avis.length;
  return (
    <div className="resume-avis">
      <div className="resume-score">
        <span className="resume-chiffre">{moyenne || "—"}</span>
        <Etoiles note={moyenne} taille={18} />
        <span className="gris">{total} avis</span>
      </div>
      <div className="resume-barres">
        {[5, 4, 3, 2, 1].map((n) => {
          const nb = avis.filter((a) => a.note === n).length;
          return (
            <div className="barre-ligne" key={n}>
              <span>{n}</span>
              <div className="barre"><div style={{ width: total ? (nb / total) * 100 + "%" : 0 }} /></div>
              <span className="gris">{nb}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// liste des commentaires
export function ListeAvis({ avis }) {
  if (avis.length === 0) {
    return <p className="vide">Aucun avis pour le moment.</p>;
  }
  return (
    <ul className="liste-avis">
      {avis.map((a) => (
        <li className="avis" key={a.id}>
          <div className="avis-tete">
            <span className="avatar petit">{a.client ? initiales(a.client) : "C"}</span>
            <div className="avis-qui">
              <p className="avis-auteur">{a.client || "Client"}</p>
              <p className="gris">{a.service} · {formatJour(a.date_avis)}</p>
            </div>
            <Etoiles note={a.note} taille={14} />
          </div>
          {a.commentaire
            ? <p className="avis-texte">{a.commentaire}</p>
            : <p className="avis-texte gris">Aucun commentaire écrit.</p>}
        </li>
      ))}
    </ul>
  );
}
