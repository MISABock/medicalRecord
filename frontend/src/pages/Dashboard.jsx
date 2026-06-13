import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import HomeNav from "../components/HomeNav";
import { apiGet, API_URL } from "../api/client";

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


export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [statPopup, setStatPopup] = useState(null);
  const [detailDoc, setDetailDoc] = useState(null);
  const [fileViewerUrl, setFileViewerUrl] = useState(null);
  const [fileViewerType, setFileViewerType] = useState(null);
  const [fileViewerTitle, setFileViewerTitle] = useState(null);

  const openFile = async (doc) => {
    if (!doc?.id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/documents/${doc.id}/file`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setFileViewerUrl(url);
      setFileViewerType(blob.type);
      setFileViewerTitle(doc.title || "Dokument");
    } catch (err) {
      alert("Fehler beim Öffnen der Datei.");
    }
  };

  const closeViewer = () => {
    if (fileViewerUrl) window.URL.revokeObjectURL(fileViewerUrl);
    setFileViewerUrl(null);
    setFileViewerType(null);
    setFileViewerTitle(null);
  };

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

  const { total, byType, recent, medications, providers } = useMemo(() => {
    const byType = {};
    for (const d of docs) {
      byType[d.docType] = (byType[d.docType] || 0) + 1;
    }
    const recent = [...docs]
      .filter((d) => d.docType !== "Rezept")
      .sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1))
      .slice(0, 5);

    const medMap = new Map();
    for (const d of docs) {
      if (!d.medication) continue;
      const m = d.medication.trim();
      if (!m) continue;
      if (!medMap.has(m)) medMap.set(m, { count: 0, lastDate: null, docs: [] });
      const entry = medMap.get(m);
      entry.count += 1;
      entry.docs.push(d);
      if (!entry.lastDate || d.serviceDate > entry.lastDate) entry.lastDate = d.serviceDate;
    }
    const medications = Array.from(medMap.entries())
      .map(([name, { count, lastDate, docs: medDocs }]) => ({ name, count, lastDate, docs: medDocs }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const providers = Array.from(new Set(docs.map((d) => d.provider).filter(Boolean))).sort();
    return { total: docs.length, byType, recent, medications, providers };
  }, [docs]);

  const STAT_CARDS = [
    { label: "Blutbilder",          docType: "Blutbild",    value: byType["Blutbild"]    || 0, accent: "#15803d", bg: "#dcfce7" },
    { label: "Medikamente/Rezepte", docType: "Rezept",      value: byType["Rezept"]      || 0, accent: "#b45309", bg: "#fef3c7" },
    { label: "Bildgebungen",        docType: "Bildgebung",  value: byType["Bildgebung"]  || 0, accent: "#6d28d9", bg: "#ede9fe" },
    { label: "Bericht",             docType: "Bericht",     value: byType["Bericht"]     || 0, accent: "#1d4ed8", bg: "#dbeafe" },
    { label: "Arztzeugnis",         docType: "Arztzeugnis", value: byType["Arztzeugnis"] || 0, accent: "#0f766e", bg: "#ccfbf1" },
  ];

  return (
    <div className="dashPage">
      <HomeNav />

      <main className="dashMain">

        {/* Stat cards */}
        <div className="dashStatsRow">
          {STAT_CARDS.map((s) => (
            <button
              key={s.label}
              type="button"
              className="dashStatCard"
              style={{ borderTop: `3px solid ${s.accent}`, cursor: s.value > 0 ? "pointer" : "default" }}
              onClick={() => { if (s.value > 0) { setDetailDoc(null); setStatPopup(s); } }}
            >
              <div className="dashStatValue" style={{ color: s.accent }}>
                {s.value}
              </div>
              <div className="dashStatLabel">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Stat popup */}
        {statPopup && (
          <div className="dashPopupOverlay" onClick={() => { setStatPopup(null); setDetailDoc(null); }}>
            <div className="dashPopup" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="dashPopupHeader" style={{ borderBottom: `3px solid ${statPopup.accent}` }}>
                <span className="dashPopupTitle" style={{ color: statPopup.accent }}>
                  {statPopup.label}
                  <span className="dashPopupCount">{statPopup.value}</span>
                </span>
                <button className="dashPopupClose" onClick={() => { setStatPopup(null); setDetailDoc(null); }}>✕</button>
              </div>

              {/* Body */}
              {detailDoc ? (
                <div className="dashPopupDetail">
                  <button className="dashPopupBack" onClick={() => setDetailDoc(null)}>← Zurück</button>
                  <div className="dashPopupDetailTitle">{detailDoc.title || "Unbekannt"}</div>
                  <div className="dashPopupDetailRows">
                    {detailDoc.serviceDate && (
                      <div className="dashPopupDetailRow">
                        <span className="dashPopupDetailKey">Datum</span>
                        <span className="dashPopupDetailVal">{formatDate(detailDoc.serviceDate)}</span>
                      </div>
                    )}
                    {detailDoc.provider && (
                      <div className="dashPopupDetailRow">
                        <span className="dashPopupDetailKey">Arzt / Praxis</span>
                        <span className="dashPopupDetailVal">{detailDoc.provider}</span>
                      </div>
                    )}
                    {detailDoc.docType && (
                      <div className="dashPopupDetailRow">
                        <span className="dashPopupDetailKey">Typ</span>
                        <span className="dashPopupDetailVal">
                          <span className="dashRecentBadge"
                            style={{ background: colorFor(detailDoc.docType).bg, color: colorFor(detailDoc.docType).accent }}>
                            {detailDoc.docType}
                          </span>
                        </span>
                      </div>
                    )}
                    {detailDoc.medication && (
                      <div className="dashPopupDetailRow">
                        <span className="dashPopupDetailKey">Medikament</span>
                        <span className="dashPopupDetailVal">{detailDoc.medication}</span>
                      </div>
                    )}
                  </div>
                  {detailDoc.fileId && (
                    <button
                      className="dashPopupOpenBtn"
                      style={{ background: statPopup.accent }}
                      onClick={() => openFile(detailDoc)}
                    >
                      Bericht öffnen →
                    </button>
                  )}
                </div>
              ) : (
                <div className="dashPopupList">
                  {(statPopup.medDocs ?? docs.filter((d) => d.docType === statPopup.docType))
                    .slice().sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1))
                    .map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="dashPopupListRow"
                        onClick={() => setDetailDoc(d)}
                      >
                        <div className="dashPopupListTitle">{d.title || "Unbekannt"}</div>
                        <div className="dashPopupListMeta">
                          <span>{formatDate(d.serviceDate)}</span>
                          {d.provider && <span className="dashPopupListProvider">{d.provider}</span>}
                        </div>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* Two-column content */}
        <div className="dashContentGrid">

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
                      <button
                        key={d.id}
                        type="button"
                        className="dashRecentRow"
                        style={{ width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
                        onClick={() => {
                          setStatPopup({ label: d.docType || "Sonstiges", docType: d.docType, accent: c.accent, bg: c.bg, value: byType[d.docType] || 1 });
                          setDetailDoc(d);
                        }}
                      >
                        <div className="dashRecentMain">
                          <div className="dashRecentTitle">{d.title || "Unbekannt"}</div>
                          <div className="dashRecentMeta">
                            <span className="dashRecentBadge" style={{ background: c.bg, color: c.accent }}>
                              {d.docType || "Sonstiges"}
                            </span>
                            {d.provider && (
                              <span className="dashRecentProvider">{d.provider}</span>
                            )}
                          </div>
                        </div>
                        <div className="dashRecentDate">{formatDate(d.serviceDate)}</div>
                      </button>
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
                    <button
                      key={m.name}
                      type="button"
                      className="dashRecentRow"
                      style={{ width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
                      onClick={() => {
                        const medPopup = { label: m.name, docType: "Rezept", accent: "#b45309", bg: "#fef3c7", value: m.count, medDocs: m.docs };
                        if (m.count === 1) {
                          setStatPopup(medPopup);
                          setDetailDoc(m.docs[0]);
                        } else {
                          setStatPopup(medPopup);
                          setDetailDoc(null);
                        }
                      }}
                    >
                      <div className="dashRecentMain">
                        <div className="dashRecentTitle">{m.name}</div>
                        <div className="dashRecentMeta">
                          <span className="dashMedCount">
                            {m.count} {m.count === 1 ? "Rezept" : "Rezepte"}
                          </span>
                        </div>
                      </div>
                      <div className="dashRecentDate">{formatDate(m.lastDate)}</div>
                    </button>
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

      {/* Inline file viewer */}
      {fileViewerUrl && (
        <div className="fileViewerOverlay" onClick={closeViewer}>
          <div className="fileViewerBox" onClick={(e) => e.stopPropagation()}>
            <div className="fileViewerHeader">
              <span className="fileViewerTitle">{fileViewerTitle}</span>
              <div className="fileViewerActions">
                <a className="fileViewerNewTab" href={fileViewerUrl} target="_blank" rel="noreferrer">
                  In neuem Tab öffnen
                </a>
                <button className="fileViewerClose" onClick={closeViewer}>✕</button>
              </div>
            </div>
            {fileViewerType?.startsWith("image/") ? (
              <img src={fileViewerUrl} alt={fileViewerTitle} className="fileViewerImg" />
            ) : (
              <iframe src={fileViewerUrl} title={fileViewerTitle} className="fileViewerFrame" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
