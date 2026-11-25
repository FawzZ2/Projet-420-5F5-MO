// petites fonctions d'affichage (dates, prix, initiales)
// le serveur envoie les dates sous la forme "2026-11-26 09:00:00"

export function versDate(texte) {
  return new Date(String(texte).replace(" ", "T"));
}

// "26 novembre 2026"
export function formatJour(texte) {
  return versDate(texte).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}

// "jeudi 26 novembre"
export function formatJourLong(texte) {
  const s = versDate(texte).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "9 h 00"
export function formatHeure(texte) {
  const h = String(texte).substring(11, 13);
  const m = String(texte).substring(14, 16);
  return parseInt(h, 10) + " h " + m;
}

// "30,00 $"
export function formatPrix(prix) {
  return Number(prix).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

// "Marc Tremblay" -> "MT"
export function initiales(nom) {
  return String(nom || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0].toUpperCase())
    .join("");
}
