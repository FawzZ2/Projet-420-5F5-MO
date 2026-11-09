// tous les appels au serveur passent par ici
// credentials: "include" envoie le cookie de session, sinon le serveur sait pas qui est connecte

const URL_API = "http://localhost:3000/api";

async function appel(chemin, options = {}) {
  const reponse = await fetch(URL_API + chemin, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await reponse.json();

  if (!reponse.ok) {
    throw new Error(data.erreur || "Une erreur est survenue.");
  }
  return data;
}

export const api = {
  get: (chemin) => appel(chemin),
  post: (chemin, body) => appel(chemin, { method: "POST", body: JSON.stringify(body || {}) })
};
