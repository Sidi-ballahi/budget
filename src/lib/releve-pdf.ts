import { jsPDF } from "jspdf";
import type { Account, Category, Transaction } from "./types";
import { transactionEffect, type ReleveMensuel } from "./finance";
import { fmtNum } from "./present";

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const ROW_H = 8;

function money(n: number, devise: string): string {
  return `${fmtNum(n)} ${devise}`;
}

function signedMoney(n: number, devise: string): string {
  return `${n < 0 ? "-" : "+"}${fmtNum(n)} ${devise}`;
}

function txLabel(tx: Transaction): string {
  if (tx.libelle) return tx.libelle;
  return tx.type === "revenu" ? "Revenu" : tx.type === "transfert" ? "Transfert" : "Dépense";
}

function catLabel(tx: Transaction, categories: Category[]): string {
  if (tx.type === "transfert") return "Transfert";
  return categories.find((c) => c.id === tx.categorieId)?.nom ?? "Autres";
}

// Builds the monthly bank-style statement. Kept UI-free so it also runs in
// Node for tests; callers download it with doc.save(...).
export function buildRelevePdf(
  account: Account,
  releve: ReleveMensuel,
  categories: Category[],
  year: number,
  month: number
): jsPDF {
  const doc = new jsPDF();
  const period = `${MONTHS_FR[month]} ${year}`;

  // Header band
  doc.setFillColor(24, 22, 18);
  doc.rect(0, 0, PAGE_W, 34, "F");
  doc.setTextColor(235, 200, 120);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Dépenses", MARGIN, 15);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("Relevé de compte mensuel", MARGIN, 23);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(period, PAGE_W - MARGIN, 15, { align: "right" });
  doc.text(`Compte : ${account.nom} (${account.type === "cash" ? "espèces" : "banque"})`, PAGE_W - MARGIN, 23, { align: "right" });

  // Summary
  let y = 46;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  const summary: [string, string][] = [
    ["Solde d'ouverture", money(releve.soldeOuverture, account.devise)],
    ["Entrées", `+${money(releve.entrees, account.devise)}`],
    ["Sorties", `-${money(releve.sorties, account.devise)}`],
    ["Solde de clôture", money(releve.soldeCloture, account.devise)],
  ];
  for (const [label, value] of summary) {
    const isLast = label === "Solde de clôture";
    doc.setFont("helvetica", isLast ? "bold" : "normal");
    doc.text(label, MARGIN, y);
    doc.text(value, PAGE_W - MARGIN, y, { align: "right" });
    y += 7;
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y - 3, PAGE_W - MARGIN, y - 3);
  y += 6;

  // Table header
  const cols = { date: MARGIN, libelle: MARGIN + 22, cat: MARGIN + 92, montant: PAGE_W - MARGIN - 34, solde: PAGE_W - MARGIN };
  function tableHead() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("Date", cols.date, y);
    doc.text("Libellé", cols.libelle, y);
    doc.text("Catégorie", cols.cat, y);
    doc.text("Montant", cols.montant, y, { align: "right" });
    doc.text("Solde", cols.solde, y, { align: "right" });
    y += 3;
    doc.setDrawColor(180, 180, 180);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 6;
  }
  tableHead();

  // Rows, oldest first, with running balance
  const rows = [...releve.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let solde = releve.soldeOuverture;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (rows.length === 0) {
    doc.setTextColor(130, 130, 130);
    doc.text("Aucune transaction sur ce compte ce mois-ci.", MARGIN, y);
    y += ROW_H;
  }
  for (const tx of rows) {
    if (y > PAGE_H - 30) {
      doc.addPage();
      y = 20;
      tableHead();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }
    const effect = transactionEffect(tx, account.id);
    solde += effect;
    const d = new Date(tx.date);
    doc.setTextColor(60, 60, 60);
    doc.text(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, cols.date, y);
    doc.text(doc.splitTextToSize(txLabel(tx), 66)[0], cols.libelle, y);
    doc.text(doc.splitTextToSize(catLabel(tx, categories), 38)[0], cols.cat, y);
    if (effect >= 0) doc.setTextColor(30, 120, 60);
    else doc.setTextColor(60, 60, 60);
    doc.text(signedMoney(effect, account.devise), cols.montant, y, { align: "right" });
    doc.setTextColor(30, 30, 30);
    doc.text(money(solde, account.devise), cols.solde, y, { align: "right" });
    y += 2.5;
    doc.setDrawColor(235, 235, 235);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5.5;
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  const now = new Date();
  const generated = `Généré le ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(generated, MARGIN, PAGE_H - 10);
    doc.text(`Page ${i} / ${pages}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
  }

  return doc;
}

export function relevePdfFilename(account: Account, year: number, month: number): string {
  const slug = account.nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `releve-${slug}-${year}-${String(month + 1).padStart(2, "0")}.pdf`;
}

export function downloadRelevePdf(
  account: Account,
  releve: ReleveMensuel,
  categories: Category[],
  year: number,
  month: number
): void {
  const doc = buildRelevePdf(account, releve, categories, year, month);
  doc.save(relevePdfFilename(account, year, month));
}
