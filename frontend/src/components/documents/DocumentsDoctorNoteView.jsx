import React, { useMemo, useState } from "react";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function DocumentsDoctorNoteView({ docs, onOpenFile }) {
  const [query, setQuery] = useState("");

  const doctorNotes = useMemo(() => {
    const arr = [];

    for (const d of docs) {
      // Annahme: Arztzeugnis ist an einem Feld erkennbar.
      // Passe diese Bedingung an dein Datenmodell an.
      // Beispiele: d.type === "DOCTOR_NOTE" oder d.category === "DoctorNote" oder d.isDoctorNote === true
      const isDoctorNote =
        d?.type === "DOCTOR_NOTE" ||
        d?.category === "DOCTOR_NOTE" ||
        d?.documentType === "DOCTOR_NOTE" ||
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

    return doctorNotes.filter((d) => {
      const date = formatDate(d.serviceDate).toLowerCase();
      const provider = (d.provider || "").toLowerCase();
      const title = (d.title || "").toLowerCase();
      const note = (d.note || "").toLowerCase();

      return (
        date.includes(q) ||
        provider.includes(q) ||
        title.includes(q) ||
        note.includes(q)
      );
    });
  }, [doctorNotes, query]);

  if (doctorNotes.length === 0) {
    return (
      <div className="docsEmpty">Keine Arztzeugnisse vorhanden.</div>
    );
  }

  return (
    <div className="docNoteView">
      <div className="docNoteTop">
        <div className="docNoteSearchWrap">
          <input
            className="docNoteSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Arztzeugnisse suchen"
          />
          <div className="docNoteCount">{filtered.length} Arztzeugnisse</div>
        </div>
      </div>

      <div className="docNoteList">
        {filtered.map((d) => (
          <div key={d.id} className="docNoteRow">
            <div className="docNoteMain">
              <div className="docNoteMetaLine">
                <span>{formatDate(d.serviceDate)}</span>
                <span className="docSep"> - </span>
                <span>{d.provider || "Unbekannt"}</span>
              </div>

              {d.title ? <div className="docNoteTitle">{d.title}</div> : null}
              {d.note ? <div className="docNoteText">{d.note}</div> : null}
            </div>

            <div className="docNoteActions">
              <button
                type="button"
                className="docNoteAction"
                onClick={() => onOpenFile(d)}
                disabled={!d.fileId}
                title={d.fileId ? "" : "Keine Datei vorhanden"}
              >
                Arztzeugnis öffnen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
