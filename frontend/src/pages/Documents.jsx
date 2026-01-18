import { useEffect, useMemo, useState } from "react";
import "./Documents.css";
import { apiGet, apiPost, apiPostForm } from "../api/client";


const DOC_TYPES = [
  "Blutbild",
  "Befund",
  "Rezept",
  "Bildgebung",
  "Bericht",
  "Sonstiges",
];


function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function Documents() {
  const [view, setView] = useState("provider");
  const [docs, setDocs] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [provider, setProvider] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);

  const [file, setFile] = useState(null);


  const openDoc = (doc) => {
    setSelectedDoc(doc);
    setIsOpenModalOpen(true);
  };

  const closeOpenModal = () => {
    setIsOpenModalOpen(false);
    setSelectedDoc(null);
  };


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

  const providers = useMemo(() => {
    const set = new Set(docs.map((d) => d.provider).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [docs]);

  const docTypes = useMemo(() => {
    const set = new Set(docs.map((d) => d.docType).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [docs]);


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



  const timeline = useMemo(() => {
    return [...docs].sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
  }, [docs]);

  const openModal = () => {
    setTitle("");
    setServiceDate("");
    setProvider("");
    setDocType(DOC_TYPES[0]);
    setFile(null);
    setIsModalOpen(true);
  };


  const closeModal = () => setIsModalOpen(false);

const saveDoc = async (e) => {
  e.preventDefault();

  if (!title.trim() || !serviceDate || !provider.trim()) {
    return;
  }

  if (!file) {
    alert("Bitte eine Datei auswaehlen.");
    return;
  }

  try {
    const form = new FormData();
    form.append("upload", file);

    const uploaded = await apiPostForm("/documents/files", form);

    const payload = {
      title: title.trim(),
      service_date: serviceDate,
      provider: provider.trim(),
      doc_type: docType,
      file_id: uploaded.id,
    };

    const created = await apiPost("/documents", payload);

    setDocs((prev) => [
      {
        id: created.id,
        title: created.title,
        serviceDate: created.service_date,
        provider: created.provider,
        docType: created.doc_type,
        fileId: created.file_id,
      },
      ...prev,
    ]);

    setIsModalOpen(false);
  } catch (err) {
    console.error(err);
    alert("Fehler beim Speichern des Dokuments.");
  }
};

const openSelectedFile = async () => {
  if (!selectedDoc?.id) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8000/documents/${selectedDoc.id}/file`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
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
              className={view === "provider" ? "active" : ""}
              onClick={() => setView("provider")}
              type="button"
            >
              Provider
            </button>
            <button
              className={view === "timeline" ? "active" : ""}
              onClick={() => setView("timeline")}
              type="button"
            >
              Timeline
            </button>
            <button
              className={view === "doctype" ? "active" : ""}
              onClick={() => setView("doctype")}
              type="button"
            >
              Dokumenttyp
            </button>
          </div>

          <button className="docsPrimary" onClick={openModal} type="button">
            Neuer Bericht
          </button>
        </div>
      </header>

      {view === "provider" ? (
        <div className="docsProviderGrid">
          {groupedByProvider.map(([prov, items]) => (
            <section key={prov} className="docsGroup">
              <div className="docsGroupHeader">
                <div className="docsGroupName">{prov}</div>
                <div className="docsGroupCount">{items.length} Dokumente</div>
              </div>

              <div className="docsList">
                {items.map((d) => (
                  <div key={d.id} className="docsRow">
                    <div className="docsRowMain">
                      <div className="docsRowTitle">{d.title}</div>
                      <div className="docsRowMeta">
                        <span>{formatDate(d.serviceDate)}</span>
                        <span className="dot">•</span>
                        <span>{d.docType}</span>
                      </div>
                    </div>
                    <button className="docsOpen" type="button" onClick={() => openDoc(d)}>
                      Öffnen
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : view === "doctype" ? (
        <div className="docsProviderGrid">
          {groupedByDocType.map(([type, items]) => (
            <section key={type} className="docsGroup">
              <div className="docsGroupHeader">
                <div className="docsGroupName">{type}</div>
                <div className="docsGroupCount">{items.length} Dokumente</div>
              </div>

              <div className="docsList">
                {items.map((d) => (
                  <div key={d.id} className="docsRow">
                    <div className="docsRowMain">
                      <div className="docsRowTitle">{d.title}</div>
                      <div className="docsRowMeta">
                        <span>{formatDate(d.serviceDate)}</span>
                        <span className="dot">•</span>
                        <span>{d.provider}</span>
                      </div>
                    </div>
                    <button className="docsOpen" type="button" onClick={() => openDoc(d)}>
                      Öffnen
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="docsTimeline">
          {timeline.map((d) => (
            <div key={d.id} className="timeItem">
              <div className="timeLeft">
                <div className="timeDot" />
                <div className="timeLine" />
              </div>

              <div className="timeCard">
                <div className="timeCardTop">
                  <div className="timeTitle">{d.title}</div>
                  <div className="timeDate">{formatDate(d.serviceDate)}</div>
                </div>
                <div className="timeMeta">
                  <span>{d.provider}</span>
                  <span className="dot">•</span>
                  <span>{d.docType}</span>
                </div>
                <div className="timeActions">
                  <button className="docsOpen" type="button" onClick={() => openDoc(d)}>
                    Öffnen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="docsModalBackdrop" onMouseDown={closeModal}>
          <div className="docsModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="docsModalHeader">
              <div className="docsModalTitle">Neuen Bericht erfassen</div>
              <button className="docsModalClose" onClick={closeModal} type="button">
                ✕
              </button>
            </div>

            <form className="docsModalForm" onSubmit={saveDoc}>
              <div className="docsHint">
                Trage die Felder ein
              </div>

              <label className="docsLabel">
                Titel
                <input
                  className="docsInput"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. MRI Knie"
                  required
                />
              </label>

              <label className="docsLabel">
                Datum der Untersuchung
                <input
                  className="docsInput"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  required
                />
              </label>

              <label className="docsLabel">
                Arzt / Einrichtung
                <input
                  className="docsInput"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="z.B. USZ Zürich"
                  list="providers"
                  required
                />
                <datalist id="providers">
                  {providers.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </label>

              <label className="docsLabel">
                Dokumenttyp
                <select
                  className="docsSelect"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="docsLabel">
                Datei
                <input
                  className="docsInput"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>

              <div className="docsModalActions">
                <button className="docsSecondary" type="button" onClick={closeModal}>
                  Abbrechen
                </button>
                <button className="docsPrimary" type="submit">
                  Speichern
                </button>
              </div>

              <div className="docsFileNote">
                Drücke auf Speichern
              </div> 
            </form>
          </div>
        </div>
      ) : null}
       {isOpenModalOpen && selectedDoc ? (
        <div className="docsModalBackdrop" onMouseDown={closeOpenModal}>
          <div className="docsModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="docsModalHeader">
              <div className="docsModalTitle">Dokument</div>
              <button
                className="docsModalClose"
                onClick={closeOpenModal}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="docsModalForm">
              <div className="docsHint">
                Ansicht der Dokumente
              </div>

              <div className="docsLabel">
                Titel
                <div className="docsInput docsInputReadOnly">
                  {selectedDoc.title}
                </div>
              </div>

              <div className="docsLabel">
                Datum der Untersuchung
                <div className="docsInput docsInputReadOnly">
                  {formatDate(selectedDoc.serviceDate)}
                </div>
              </div>

              <div className="docsLabel">
                Arzt / Einrichtung
                <div className="docsInput docsInputReadOnly">
                  {selectedDoc.provider}
                </div>
              </div>

              <div className="docsLabel">
                Dokumenttyp
                <div className="docsInput docsInputReadOnly">
                  {selectedDoc.docType}
                </div>
              </div>
              
              <div className="docsLabel">
                Datei
                {selectedDoc.fileId ? (
                  <button className="docsOpen" type="button" onClick={openSelectedFile}>
                    Datei öffnen
                  </button>
                ) : (
                  <div className="docsInput">Keine Datei vorhanden</div>
                )}
              </div>

              <div className="docsModalActions">
                <button
                  className="docsPrimary"
                  type="button"
                  onClick={closeOpenModal}
                >
                  Schliessen
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
