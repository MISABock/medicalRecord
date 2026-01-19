import { useEffect, useMemo, useState } from "react";
import "./Documents.css";
import { apiGet, apiPost, apiPostForm } from "../api/client";
import HomeNav from "../components/HomeNav";


import DocumentsGroupedView from "../components/documents/DocumentsGroupedView";



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
  const [docType, setDocType] = useState(DOC_TYPES[0]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);

  const [file, setFile] = useState(null);

  const [providerChoice, setProviderChoice] = useState("");
  const [providerCustom, setProviderCustom] = useState("");



  const [editTitle, setEditTitle] = useState("");
  const [editServiceDate, setEditServiceDate] = useState("");
  const [editProviderChoice, setEditProviderChoice] = useState("");
  const [editProviderCustom, setEditProviderCustom] = useState("");
  const [editDocType, setEditDocType] = useState(DOC_TYPES[0]);

  const [editMedication, setEditMedication] = useState("");
  const [medication, setMedication] = useState("");




  const openDoc = (doc) => {
    setSelectedDoc(doc);

    setEditTitle(doc.title || "");
    setEditServiceDate((doc.serviceDate || "").slice(0, 10));
    setEditMedication(doc.medication || "");


    if (providers.includes(doc.provider)) {
      setEditProviderChoice(doc.provider);
      setEditProviderCustom("");
    } else {
      setEditProviderChoice("__custom__");
      setEditProviderCustom(doc.provider || "");
    }

    setEditDocType(doc.docType || DOC_TYPES[0]);

    setIsOpenModalOpen(true);
  };


  const closeOpenModal = () => {
    setIsOpenModalOpen(false);
    setSelectedDoc(null);
    setMedication("");

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
    setDocType(DOC_TYPES[0]);
    setFile(null);

    setProviderCustom("");

    if (providers.length > 0) {
      setProviderChoice(providers[0]);
    } else {
      setProviderChoice("__custom__");
    }

    setIsModalOpen(true);
  };

  const saveSelectedDocEdits = async () => {
  if (!selectedDoc?.id) return;

  const providerValue =
    editProviderChoice === "__custom__"
      ? editProviderCustom.trim()
      : (editProviderChoice || "").trim();

  if (!editTitle.trim() || !editServiceDate || !providerValue || !editDocType) {
    alert("Bitte alle Pflichtfelder ausfuellen.");
    return;
  }

  try {
    const payload = {
      title: editTitle.trim(),
      service_date: editServiceDate,
      provider: providerValue,
      doc_type: editDocType,
    };

    const updated = await apiPost(`/documents/${selectedDoc.id}/update`, payload);


    const mapped = {
      id: updated.id,
      title: updated.title,
      serviceDate: updated.service_date,
      provider: updated.provider,
      docType: updated.doc_type,
      fileId: updated.file_id,
      medication: editDocType === "Rezept" ? editMedication.trim() : null,
    };

    setDocs((prev) => prev.map((d) => (d.id === mapped.id ? mapped : d)));
    setSelectedDoc(mapped);
    alert("Gespeichert.");
  } catch (err) {
    console.error(err);
    alert("Fehler beim Speichern der Aenderungen.");
  }
};





  const closeModal = () => setIsModalOpen(false);

  
  const saveDoc = async (e) => {
    e.preventDefault();

    const providerValue =
      providerChoice === "__custom__"
        ? providerCustom.trim()
        : (providerChoice || "").trim();

    if (!title.trim() || !serviceDate || !providerValue) {
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
        provider: providerValue,
        medication: docType === "Rezept" ? medication.trim() : null,
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

const deleteSelectedDoc = async () => {
  if (!selectedDoc?.id) return;

  const ok = window.confirm(
    "Willst du dieses Dokument wirklich löschen? Die Datei wird ebenfalls entfernt."
  );

  if (!ok) return;

  try {
    await apiPost(`/documents/${selectedDoc.id}/delete`);

    setDocs((prev) => prev.filter((d) => d.id !== selectedDoc.id));

    closeOpenModal();
  } catch (err) {
    console.error(err);
    alert("Fehler beim Löschen des Dokuments.");
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
        <DocumentsGroupedView
          groups={groupedByProvider}
          onOpenDoc={openDoc}
          metaRightField="docType"
        />
      ) : view === "doctype" ? (
        <DocumentsGroupedView
          groups={groupedByDocType}
          onOpenDoc={openDoc}
          metaRightField="provider"
        />
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
                onClick={() => openDoc(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openDoc(d);
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

              <div className="docsLabel">
                <div>Arzt / Einrichtung</div>

                <select
                  className="docsSelect"
                  value={providerChoice}
                  onChange={(e) => setProviderChoice(e.target.value)}
                  required
                >
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="__custom__">Neu eingeben</option>
                </select>

                {providerChoice === "__custom__" ? (
                  <input
                    className="docsInput"
                    value={providerCustom}
                    onChange={(e) => setProviderCustom(e.target.value)}
                    placeholder="z.B. USZ Zuerich"
                    required
                  />
                ) : null}
              </div>


              <label className="docsLabel">
                Dokumenttyp
                <select
                  className="docsSelect"
                  value={docType}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDocType(v);
                    if (v !== "Rezept") setMedication("");
                  }}
                  required
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              {docType === "Rezept" ? (
                <label className="docsLabel">
                  Medikament
                  <input
                    className="docsInput"
                    value={medication}
                    onChange={(e) => setMedication(e.target.value)}
                    placeholder="z.B. Ibuprofen 400 mg"
                    required
                  />
                </label>
              ) : null}


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
                  <div className="docsModalTitle">Dokument bearbeiten</div>
                  <button className="docsModalClose" onClick={closeOpenModal} type="button">
                    ✕
                  </button>
                </div>

                <div className="docsModalForm">
                  <div className="docsHint">Bearbeite die Felder und speichere.</div>

                  <label className="docsLabel">
                    Titel
                    <input
                      className="docsInput"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                  </label>

                  <label className="docsLabel">
                    Datum der Untersuchung
                    <input
                      className="docsInput"
                      type="date"
                      value={editServiceDate}
                      onChange={(e) => setEditServiceDate(e.target.value)}
                      required
                    />
                  </label>

                  <div className="docsLabel">
                    <div>Arzt / Einrichtung</div>

                    <select
                      className="docsSelect"
                      value={editProviderChoice}
                      onChange={(e) => setEditProviderChoice(e.target.value)}
                      required
                    >
                      {providers.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      <option value="__custom__">Neu eingeben</option>
                    </select>

                    {editProviderChoice === "__custom__" ? (
                      <input
                        className="docsInput"
                        value={editProviderCustom}
                        onChange={(e) => setEditProviderCustom(e.target.value)}
                        placeholder="z.B. USZ Zuerich"
                        required
                      />
                    ) : null}
                  </div>
                  <label className="docsLabel">
                    Dokumenttyp
                    <select
                      className="docsSelect"
                      value={editDocType}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditDocType(v);

                        if (v !== "Rezept") {
                          setEditMedication("");
                        }
                      }}
                      required
                    >
                      {DOC_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  {editDocType === "Rezept" ? (
                    <label className="docsLabel">
                      Medikament
                      <input
                        className="docsInput"
                        value={editMedication}
                        onChange={(e) => setEditMedication(e.target.value)}
                        placeholder="z.B. Ibuprofen 400 mg"
                        required
                      />
                    </label>
                  ) : null}


                  <div className="docsLabel">
                    <div>Datei</div>
                    {selectedDoc.fileId ? (
                      <button className="docsOpen" type="button" onClick={openSelectedFile}>
                        Datei öffnen
                      </button>
                    ) : (
                      <div className="docsInput">Keine Datei vorhanden</div>
                    )}
                  </div>

                  <div className="docsModalActions docsModalActionsBetween">
                    <button className="docsDanger" type="button" onClick={deleteSelectedDoc}>
                      Löschen
                    </button>

                    <div className="docsModalActionsRight">
                      <button className="docsSecondary" type="button" onClick={closeOpenModal}>
                        Abbrechen
                      </button>
                      <button className="docsPrimary" type="button" onClick={saveSelectedDocEdits}>
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

    </div>
  );
}
