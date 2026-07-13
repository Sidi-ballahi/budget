import type { Recurrence } from "./types";

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  ponctuel: "Ponctuelle",
  hebdomadaire: "Hebdomadaire",
  mensuel: "Mensuelle",
  annuel: "Annuelle",
};

// Next occurrence after `from`. Months are clamped to the last day of the
// target month (31 janv. + 1 mois = 28/29 fevr., pas le 3 mars).
export function advanceDate(from: Date, recurrence: Recurrence): Date {
  const d = new Date(from);
  switch (recurrence) {
    case "hebdomadaire":
      d.setDate(d.getDate() + 7);
      return d;
    case "mensuel":
    case "annuel": {
      const months = recurrence === "mensuel" ? 1 : 12;
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + months);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, lastDay));
      return d;
    }
    case "ponctuel":
      return d;
  }
}

// Monthly-equivalent cost of a recurring charge, for the "≈ X MRU / mois" header.
export function monthlyEquivalent(montant: number, recurrence: Recurrence): number {
  switch (recurrence) {
    case "hebdomadaire":
      return (montant * 52) / 12;
    case "mensuel":
      return montant;
    case "annuel":
      return montant / 12;
    case "ponctuel":
      return 0;
  }
}
