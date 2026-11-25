// icones svg simples (trait), elles prennent la couleur du texte
function Icone({ children, taille = 18 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconeCiseaux = (p) => (
  <Icone {...p}>
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </Icone>
);

export const IconeCalendrier = (p) => (
  <Icone {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </Icone>
);

export const IconeHorloge = (p) => (
  <Icone {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></Icone>
);

export const IconeMessage = (p) => (
  <Icone {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icone>
);

export const IconeSortie = (p) => (
  <Icone {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icone>
);

export const IconeFermer = (p) => (
  <Icone {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icone>
);

export const IconeRetour = (p) => (
  <Icone {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icone>
);

export const IconeCheck = (p) => (
  <Icone {...p}><polyline points="20 6 9 17 4 12" /></Icone>
);
