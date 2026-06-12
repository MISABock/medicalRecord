import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import HomeNav from "../components/HomeNav";
import { apiGet } from "../api/client";

const DOC_COLORS = {
  Blutbild:    { accent: "#15803d", bg: "#dcfce7" },
  Bericht:      { accent: "#1d4ed8", bg: "#dbeafe" },
  Rezept:      { accent: "#b45309", bg: "#fef3c7" },
  Bildgebung:  { accent: "#6d28d9", bg: "#ede9fe" },
  Arztzeugnis: { accent: "#0f766e", bg: "#ccfbf1" },
  Sonstiges:   { accent: "#475569", bg: "#f1f5f9" },
};

function colorFor(type) {
  return DOC_COLORS[type] ?? DOC_COLORS.Sonstiges;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

const NAV_CARDS = [
  { label: "Dokumente",  text: "Alle Berichte, Berichte und PDFs.",               path: "/documents",                  accent: "#1d4ed8", bg: "#dbeafe" },
  { label: "Timeline",   text: "Chronologische Sicht auf deine Untersuchungen.", path: "/documents?view=timeline",    accent: "#7c3aed", bg: "#ede9fe" },
  { label: "Rezepte",    text: "Alle Medikamente und Verschreibungen.",           path: "/documents?view=medication",  accent: "#b45309", bg: "#fef3c7" },
  { label: "Zeugnisse",  text: "Arztzeugnisse und Atteste auf einen Blick.",     path: "/documents?view=doctorNote",  accent: "#0f766e", bg: "#ccfbf1" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    apiGet("/documents")
      .then((data) => {
        setDocs(
          (data || []).map((d) => ({
            id: d.id,
            title: d.title,
            serviceDate: d.service_date,
            provider: d.provider,
            docType: d.doc_type,
            medication: d.medication,
            fileId: d.file_id,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const { total, byType, recent, medications } = useMemo(() => {
    const byType = {};
    for (const d of docs) {
      byType[d.docType] = (byType[d.docType] || 0) + 1;
    }
    const recent = [...docs]
      .sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1))
      .slice(0, 6);

    const medMap = new Map();
    for (const d of docs) {
      if (!d.medication) continue;
      const m = d.medication.trim();
      if (!m) continue;
      if (!medMap.has(m)) medMap.set(m, { count: 0, lastDate: null });
      const entry = medMap.get(m);
      entry.count += 1;
      if (!entry.lastDate || d.serviceDate > entry.lastDate) entry.lastDate = d.serviceDate;
    }
    const medications = Array.from(medMap.entries())
      .map(([name, { count, lastDate }]) => ({ name, count, lastDate }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { total: docs.length, byType, recent, medications };
  }, [docs]);

  const STAT_CARDS = [
    { label: "Blutbilder",         value: byType["Blutbild"]   || 0, accent: "#15803d", bg: "#dcfce7" },
    { label: "Medikamente/Rezepte",value: byType["Rezept"]     || 0, accent: "#b45309", bg: "#fef3c7" },
    { label: "Bildgebungen",       value: byType["Bildgebung"] || 0, accent: "#6d28d9", bg: "#ede9fe" },
    { label: "Bericht",            value: byType["Bericht"]     || 0, accent: "#1d4ed8", bg: "#dbeafe" },
    { label: "Arztzeugnis",        value: byType["Arztzeugnis"]     || 0, accent: "#af3c3c", bg: "#dbeafe" },
  ];

  return (
    <div className="dashPage">
      <HomeNav />

      <main className="dashMain">

        {/* Stat cards */}
        <div className="dashStatsRow">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="dashStatCard"
              style={{ borderTop: `3px solid ${s.accent}` }}
            >
              <div className="dashStatValue" style={{ color: s.accent }}>
                {s.value}
              </div>
              <div className="dashStatLabel">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Three-column content */}
        <div className="dashContentGrid">

          {/* Schnellzugriff */}
          <div>
            <div className="dashSectionTitle">Schnellzugriff</div>
            <div className="dashNavGrid">
              {NAV_CARDS.map((c) => (
                <button
                  key={c.path}
                  className="dashCard"
                  onClick={() => navigate(c.path)}
                  style={{ borderTop: `3px solid ${c.accent}` }}
                >
                  <div className="dashCardBadge" style={{ background: c.bg, color: c.accent }}>
                    {c.label}
                  </div>
                  <div className="dashCardText">{c.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Letzte Dokumente */}
          <div>
            <div className="dashSectionTitle">Letzte Dokumente</div>
            <div className="dashRecentPanel">
              {recent.length === 0 ? (
                <div className="dashRecentEmpty">Noch keine Dokumente vorhanden.</div>
              ) : (
                <>
                  {recent.map((d) => {
                    const c = colorFor(d.docType);
                    return (
                      <div key={d.id} className="dashRecentRow">
                        <div className="dashRecentMain">
                          <div className="dashRecentTitle">{d.title || "Unbekannt"}</div>
                          <div className="dashRecentMeta">
                            <span
                              className="dashRecentBadge"
                              style={{ background: c.bg, color: c.accent }}
                            >
                              {d.docType || "Sonstiges"}
                            </span>
                            {d.provider && (
                              <span className="dashRecentProvider">{d.provider}</span>
                            )}
                          </div>
                        </div>
                        <div className="dashRecentDate">{formatDate(d.serviceDate)}</div>
                      </div>
                    );
                  })}
                  <button
                    className="dashRecentAllBtn"
                    onClick={() => navigate("/documents")}
                  >
                    Alle Dokumente anzeigen →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Medikamente */}
          <div>
            <div className="dashSectionTitle">Medikamente</div>
            <div className="dashRecentPanel">
              {medications.length === 0 ? (
                <div className="dashRecentEmpty">Keine Medikamente erfasst.</div>
              ) : (
                <>
                  {medications.map((m) => (
                    <div key={m.name} className="dashRecentRow">
                      <div className="dashRecentMain">
                        <div className="dashRecentTitle">{m.name}</div>
                        <div className="dashRecentMeta">
                          <span className="dashMedCount">
                            {m.count} {m.count === 1 ? "Rezept" : "Rezepte"}
                          </span>
                        </div>
                      </div>
                      <div className="dashRecentDate">{formatDate(m.lastDate)}</div>
                    </div>
                  ))}
                  <button
                    className="dashRecentAllBtn"
                    onClick={() => navigate("/documents?view=medication")}
                  >
                    Alle Medikamente →
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
