import { versDate } from "../format";

// petit bloc "26 / NOV." affiche a gauche d'un rendez-vous
export default function BadgeDate({ date, attenue }) {
  const d = versDate(date);
  const mois = d.toLocaleDateString("fr-CA", { month: "short" }).replace(".", "");
  return (
    <div className={"badge-date" + (attenue ? " attenue" : "")}>
      <span className="badge-jour">{d.getDate()}</span>
      <span className="badge-mois">{mois}</span>
    </div>
  );
}
