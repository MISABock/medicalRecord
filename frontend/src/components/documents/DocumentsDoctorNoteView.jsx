import React, { useMemo, useState } from "react";

const ACCENT    = "#0f766e";
const ACCENT_BG = "#ccfbf1";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function DocumentsDoctorNoteView({ docs, onOpenFile }) {
  const [query, setQuery] = useState("");

  const doctorNotes = useMemo(() => {
    const arr = [];
    for (const d of docs) {
      const isDoctorNote =
        d?.type === "DOCTOR_NOTE" ||
        d?.category === "DOCTOR_NOTE" ||
        d?.docType === "Arztzeugnis" ||
        d?.kind === "DOCTOR_NOTE" ||
        d?.isDoctorNote === true;
      if (!isDoctorNote) continue;
      arr.push(d);
    }
    arr.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
    return arr;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctorNotes;
    return doctorNotes.filter((d) =>
      formatDate(d.serviceDate).toLowerCase().includes(q) ||
      (d.provider || "").toLowerCase().includes(q) ||
      (d.title || "").toLowerCase().includes(q) ||
      (d.note || "").toLowerCase().includes(q)
    );
  }, [doctorNotes, query]);

  return (
    <div className="docsGroup" style={{ borderTop: `3px solid ${ACCENT}` }}>
      <div className="docsGroupHeader">
        <div className="docsGroupName">Arztzeugnisse</div>
        <div className="docNoteHeadRight">
          <input
            className="docNoteSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
          />
          <span
            className="docsGroupBadge"
            style={{ background: ACCENT_BG, color: ACCENT }}
          >
            {filtered.length}
          </span>
        </div>
      </div>

      <div className="docsList">
        {doctorNotes.length === 0 && (
          <div className="docsEmpty">Keine Arztzeugnisse vorhanden.</div>
        )}
        {doctorNotes.length > 0 && filtered.length === 0 && (
          <div className="docsEmpty">Keine Treffer gefunden.</div>
        )}
        {filtered.map((d) => (
          <div key={d.id} className="docsRow">
            <div className="docsRowMain">
              <div className="docsRowTitle">{d.title || "Arztzeugnis"}</div>
              <div className="docsRowMeta">
                <span>{d.provider || "Unbekannt"}</span>
                {d.note && (
                  <>
                    <span className="dot"> · </span>
                    <span className="docNotePreview">{d.note}</span>
                  </>
                )}
              </div>
            </div>
            <div className="docsRowRight">
              <span className="docsRowDate">{formatDate(d.serviceDate)}</span>
              <button
                type="button"
                className="docsOpen"
                onClick={() => onOpenFile(d)}
                disabled={!d.fileId}
                title={d.fileId ? "" : "Keine Datei vorhanden"}
              >
                Öffnen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
