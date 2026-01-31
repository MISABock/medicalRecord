import { useEffect, useMemo, useState } from "react";
import "./Documents.css";
import { apiGet, API_URL } from "../api/client";
import HomeNav from "../components/HomeNav";
import DocumentsGroupedView from "../components/documents/DocumentsGroupedView";
import DocumentsMedicationView from "../components/documents/DocumentsMedicationView";
import DocumentsDoctorNoteView from "../components/documents/DocumentsDoctorNoteView";
import DocumentModal from "../components/documents/DocumentModal";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function Documents() {
  const [view, setView] = useState("doctype");
  const [docs, setDocs] = useState([]);
  const [moreOpen, setMoreOpen] = useState(false);

  // Modal states
  const [modalMode, setModalMode] = useState(null); // "new" | "edit" | "medication" | null
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Dokumente laden
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet("/documents");

        const mapped = (data || []).map((d) => ({
          id: d.id,
          title: d.title,
          serviceDate: d.service_date,
          provider: d.provider,
          docType: d.doc_type,
          medication: d.medication,
          fileId: d.file_id,
        }));

        setDocs(mapped);
      } catch (err) {
        console.error(err);
        alert("Fehler beim Laden der Dokumente.");
      }
    };

    load();
  }, []);

  // Provider-Liste aus vorhandenen Dokumenten
  const providers = useMemo(() => {
    const set = new Set(docs.map((d) => d.provider).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [docs]);

  // Gruppierung nach Provider
  const groupedByProvider = useMemo(() => {
    const map = new Map();
    for (const d of docs) {
      const key = d.provider || "Unbekannt";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
      map.set(k, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [docs]);

  // Gruppierung nach Dokumenttyp
  const groupedByDocType = useMemo(() => {
    const map = new Map();

    for (const d of docs) {
      const key = d.docType || "Unbekannt";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
      map.set(k, arr);
    }

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [docs]);

  // Timeline (chronologisch sortiert)
  const timeline = useMemo(() => {
    return [...docs].sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
  }, [docs]);

  // Modal-Funktionen
  const openNewModal = () => {
    setSelectedDoc(null);
    setModalMode("new");
  };

  const openEditModal = (doc) => {
    setSelectedDoc(doc);
    setModalMode("edit");
  };

  const openMedicationModal = (doc) => {
    setSelectedDoc(doc);
    setModalMode("medication");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedDoc(null);
  };

  const handleModalSave = (updatedDoc, action) => {
    if (action === "new") {
      setDocs((prev) => [updatedDoc, ...prev]);
    } else if (action === "edit" || action === "medication") {
      setDocs((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    } else if (action === "delete") {
      setDocs((prev) => prev.filter((d) => d.id !== updatedDoc.id));
    }
  };

  // Datei öffnen (für Medication/DoctorNote Views)
  const openFileForDoc = async (doc) => {
    if (!doc?.id) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/documents/${doc.id}/file`, {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Download fehlgeschlagen");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Oeffnen der Datei.");
    }
  };

  return (
    <div className="docsPage">
      <HomeNav />
      <header className="docsTop">
        <div>
          <h1 className="docsTitle">Dokumente</h1>
          <p className="docsSubtitle">
            Gruppiert nach Spital/Praxis oder als Timeline. Upload kommt als nächstes.
          </p>
        </div>

        <div className="docsActions">
          <div className="docsSegment">
            <button
              className={view === "doctype" ? "active" : ""}
              onClick={() => {
                setView("doctype");
                setMoreOpen(false);
              }}
              type="button"
            >
              Dokumenttyp
            </button>

            <button
              className={view === "timeline" ? "active" : ""}
              onClick={() => {
                setView("timeline");
                setMoreOpen(false);
              }}
              type="button"
            >
              Timeline
            </button>

            <div className="docsMore">
              <button
                className={
                  view === "provider" || view === "medication" || view === "doctorNote"
                    ? "active"
                    : ""
                }
                onClick={() => setMoreOpen((v) => !v)}
                type="button"
              >
                Weitere
              </button>

              {moreOpen ? (
                <div className="docsMoreMenu" role="menu">
                  <button
                    type="button"
                    className={view === "provider" ? "active" : ""}
                    onClick={() => {
                      setView("provider");
                      setMoreOpen(false);
                    }}
                  >
                    Provider
                  </button>

                  <button
                    type="button"
                    className={view === "medication" ? "active" : ""}
                    onClick={() => {
                      setView("medication");
                      setMoreOpen(false);
                    }}
                  >
                    Medikamente
                  </button>

                  <button
                    type="button"
                    className={view === "doctorNote" ? "active" : ""}
                    onClick={() => {
                      setView("doctorNote");
                      setMoreOpen(false);
                    }}
                  >
                    Zeugnisse
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <button className="docsPrimary" onClick={openNewModal} type="button">
            Neuer Bericht
          </button>
        </div>
      </header>

      {view === "provider" ? (
        <DocumentsGroupedView
          groups={groupedByProvider}
          onOpenDoc={openEditModal}
          metaRightField="docType"
        />
      ) : view === "doctype" ? (
        <DocumentsGroupedView
          groups={groupedByDocType}
          onOpenDoc={openEditModal}
          metaRightField="provider"
        />
      ) : view === "medication" ? (
        <DocumentsMedicationView
          docs={docs}
          onOpenFile={openFileForDoc}
          onEditMedication={openMedicationModal}
        />
      ) : view === "doctorNote" ? (
        <DocumentsDoctorNoteView docs={docs} onOpenFile={openFileForDoc} />
      ) : (
        <div className="docsTimeline">
          {timeline.map((d) => (
            <div key={d.id} className="timeItem">
              <div className="timeLeft">
                <div className="timeDateLeft">{formatDate(d.serviceDate)}</div>
                <div className="timeDot" />
                <div className="timeLine" />
              </div>

              <div
                className="timeCard timeCardClickable"
                role="button"
                tabIndex={0}
                onClick={() => openEditModal(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openEditModal(d);
                  }
                }}
              >
                <div className="timeCardTop">
                  <div className="timeTitle">{d.title}</div>
                  <div className="timeDate">{formatDate(d.serviceDate)}</div>
                </div>

                <div className="timeMeta">
                  <span>{d.provider}</span>
                  <span className="dot">•</span>
                  <span>{d.docType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentModal
        isOpen={modalMode !== null}
        onClose={closeModal}
        doc={selectedDoc}
        providers={providers}
        onSave={handleModalSave}
        mode={modalMode}
      />
    </div>
  );
}