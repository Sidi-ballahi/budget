"use client";

import { X } from "lucide-react";
import { colors } from "@/lib/theme";
import { catById, accById, fmtNum, shortDate } from "@/lib/present";
import type { Account, Category, Transaction } from "@/lib/types";

export function TransactionDetailSheet({
  tx,
  categories,
  accounts,
  onClose,
}: {
  tx: Transaction;
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
}) {
  const cat = tx.categorieId ? catById(categories, tx.categorieId) : null;
  const acc = accById(accounts, tx.compteId);
  const destAcc = tx.compteDestinationId ? accById(accounts, tx.compteDestinationId) : undefined;
  const typeLabel = { depense: "Dépense", revenu: "Revenu", transfert: "Transfert" }[tx.type];

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(2px)", zIndex: 20, animation: "backdropIn 0.22s ease" }} />
      <div
        className="glass-sheet"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "88%",
          overflow: "auto",
          animation: "sheetUp 0.32s cubic-bezier(0.32,0.72,0,1)",
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Détail de l&apos;opération</div>
          <div
            onClick={onClose}
            className="tap glass"
            style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        {tx.justificatif && (
          <img
            src={tx.justificatif}
            alt="Justificatif"
            style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 16, marginBottom: 18, background: colors.white4 }}
          />
        )}

        <div className="glass" style={{ borderRadius: 18, padding: 18, marginBottom: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <Row label="Type" value={typeLabel} />
          <Row label="Montant" value={`${fmtNum(tx.montant)} MRU`} big />
          <Row label="Compte" value={acc?.nom ?? "—"} />
          {destAcc && <Row label="Vers" value={destAcc.nom} />}
          {cat && <Row label="Catégorie" value={cat.nom} />}
          <Row label="Libellé" value={tx.libelle || "—"} />
          <Row label="Date" value={shortDate(tx.date)} />
        </div>

        {tx.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tx.tags.map((t) => (
              <span key={t} style={{ background: colors.white8, color: colors.textSecondary, borderRadius: 100, padding: "5px 12px", fontSize: 12 }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ fontSize: 13, color: colors.textMuted }}>{label}</div>
      <div style={{ fontSize: big ? 15 : 13, fontWeight: 700, color: colors.textPrimary }}>{value}</div>
    </div>
  );
}
