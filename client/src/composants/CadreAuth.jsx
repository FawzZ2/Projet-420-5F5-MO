import { IconeCheck } from "./Icones.jsx";

// mise en page des pages connexion / inscription : visuel a gauche, formulaire a droite
export default function CadreAuth({ children }) {
  return (
    <div className="auth">
      <aside className="auth-visuel">
        <p className="surtitre">Salon de barbier</p>
        <h2>L'art de la coupe, réservé en quelques clics.</h2>
        <ul className="auth-points">
          <li><IconeCheck taille={16} /> Choisissez votre barbier</li>
          <li><IconeCheck taille={16} /> Lisez les avis des clients</li>
          <li><IconeCheck taille={16} /> Réservez un créneau en temps réel</li>
        </ul>
      </aside>
      <div className="auth-formulaire">
        <div className="carte">{children}</div>
      </div>
    </div>
  );
}
