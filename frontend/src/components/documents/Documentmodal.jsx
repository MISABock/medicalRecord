import { useState, useEffect } from "react";
import { apiPost, apiPostForm, API_URL } from "../../api/client";

const DOC_TYPES = [
  "Blutbild",
  "Befund",
  "Rezept",
  "Bildgebung",
  "Bericht",
  "Sonstiges",
  "Arztzeugnis"
];

const MED_TYPES = [
  "Algifor 400 mg", "Algifor L 400 mg", "Amlodipin 5 mg", "Amlodipin 10 mg",
  "Amoxicillin 500 mg", "Amoxicillin 1000 mg", "Aspirin Cardio 100 mg",
  "Atorvastatin 20 mg", "Atorvastatin 40 mg", "Atorvastatin 80 mg",
  "Augmentin 625 mg", "Augmentin 1 g", "Beloc ZOK 25 mg", "Beloc ZOK 50 mg",
  "Beloc ZOK 100 mg", "Bilol 2.5 mg", "Bilol 5 mg", "Blopress 8 mg",
  "Blopress 16 mg", "Brufen 400 mg", "Brufen 600 mg", "Concor 2.5 mg",
  "Concor 5 mg", "Condrosulf 800 mg", "Crestor 10 mg", "Crestor 20 mg",
  "Dafalgan 500 mg", "Dafalgan 1 g", "Dafalgan Kindersaft", "Dafalgan Zäpfchen 250 mg",
  "Diclofenac 50 mg", "Diclofenac 75 mg", "Eliquis 2.5 mg", "Eliquis 5 mg",
  "Eltroxin 0.05 mg", "Eltroxin 0.1 mg", "Exforge 5/80 mg", "Exforge 10/160 mg",
  "Flector Pflaster", "Fluimucil 600 mg", "Glucophage 500 mg", "Glucophage 1000 mg",
  "Iberogast Tinktur", "Ibuprofen 400 mg", "Ibuprofen 600 mg", "Irfen 400 mg",
  "Irfen 600 mg", "Itinerol B6", "Jardiance 10 mg", "Jardiance 25 mg",
  "Lexotanil 3 mg", "Loperamid 2 mg", "Loratadin 10 mg", "Lyrica 75 mg",
  "Lyrica 150 mg", "Mefenacid 500 mg", "Metamizol 500 mg", "Metformin 500 mg",
  "Metformin 1000 mg", "Motilium 10 mg", "Novalgin 500 mg", "Novalgin Tropfen",
  "Olfen 50 mg", "Olfen Lactab 75 mg", "Olynth Nasenspray", "Pantozol 20 mg",
  "Pantozol 40 mg", "Paracetamol 500 mg", "Pradaxa 110 mg", "Pradaxa 150 mg",
  "Pretuval C", "Quetiapin 25 mg", "Quetiapin 100 mg", "Seresta 15 mg",
  "Sertralin 50 mg", "Sertralin 100 mg", "Simvastatin 20 mg", "Simvastatin 40 mg",
  "Solmucol 600 mg", "Sortis 20 mg", "Sortis 40 mg", "Stilnox 10 mg",
  "Symbicort 160/4.5 mcg", "Tamsulosin 0.4 mg", "Temesta 1 mg", "Temesta 2.5 mg",
  "Torasemid 5 mg", "Torasemid 10 mg", "Tramadol 50 mg", "Tramadol 100 mg",
  "Triatec 2.5 mg", "Triatec 5 mg", "Valium 5 mg", "Valium 10 mg",
  "Valsartan 80 mg", "Valsartan 160 mg", "Voltaren 50 mg", "Voltaren Dolo 25 mg",
  "Xanax 0.25 mg", "Xanax 0.5 mg", "Xarelto 10 mg", "Xarelto 15 mg",
  "Xarelto 20 mg", "Zaldiar 37.5/325 mg", "Zolpidem 10 mg", "Zyrtec 10 mg"
];

export default function DocumentModal({
  isOpen,
  onClose,
  doc = null,
  providers = [],
  onSave,
  mode = "edit"
}) {
  // Felder für neues/bearbeitetes Dokument
  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [medication, setMedication] = useState("");
  const [file, setFile] = useState(null);
  const [providerChoice, setProviderChoice] = useState("");
  const [providerCustom, setProviderCustom] = useState("");
  
  // Für das Medikamenten-Dropdown
  const [searchTerm, setSearchTerm] = useState("");
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);

  // Gefilterte Medikamente
  const filteredMeds = MED_TYPES.filter(med => 
    med.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialisiere Felder wenn Modal geöffnet wird
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "new") {
      // Neues Dokument
      setTitle("");
      setServiceDate("");
      setDocType(DOC_TYPES[0]);
      setMedication("");
      setFile(null);
      setProviderCustom("");
      
      if (providers.length > 0) {
        setProviderChoice(providers[0]);
      } else {
        setProviderChoice("__custom__");
      }
    } else if (mode === "edit" && doc) {
      // Dokument bearbeiten
      setTitle(doc.title || "");
      setServiceDate((doc.serviceDate || "").slice(0, 10));
      setDocType(doc.docType || DOC_TYPES[0]);
      setMedication(doc.medication || "");

      if (providers.includes(doc.provider)) {
        setProviderChoice(doc.provider);
        setProviderCustom("");
      } else {
        setProviderChoice("__custom__");
        setProviderCustom(doc.provider || "");
      }
    } else if (mode === "medication" && doc) {
      // Nur Medikament bearbeiten
      setMedication(doc.medication || "");
    }
  }, [isOpen, mode, doc, providers]);

  // Schließe Dropdown bei Click außerhalb
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMedDropdownOpen && !e.target.closest('.medication-dropdown-wrapper')) {
        setIsMedDropdownOpen(false);
        setSearchTerm("");
      }
    };

    if (isMedDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMedDropdownOpen]);

  const handleSave = async (e) => {
    e?.preventDefault();

    const providerValue =
      providerChoice === "__custom__"
        ? providerCustom.trim()
        : (providerChoice || "").trim();

    // Validierung für "new" und "edit" Modi
    if (mode === "new" || mode === "edit") {
      if (!title.trim() || !serviceDate || !providerValue || !docType) {
        alert("Bitte alle Pflichtfelder ausfuellen.");
        return;
      }
    }

    // Validierung für "medication" Modus
    if (mode === "medication") {
      if (!medication.trim()) {
        alert("Bitte Medikament eingeben.");
        return;
      }
    }

    try {
      if (mode === "new") {
        // Neues Dokument erstellen
        if (!file) {
          alert("Bitte eine Datei auswaehlen.");
          return;
        }

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

        const mapped = {
          id: created.id,
          title: created.title,
          serviceDate: created.service_date,
          provider: created.provider,
          medication: created.medication,
          docType: created.doc_type,
          fileId: created.file_id,
        };

        onSave(mapped, "new");
        onClose();

      } else if (mode === "edit" && doc?.id) {
        // Dokument bearbeiten
        const payload = {
          title: title.trim(),
          service_date: serviceDate,
          provider: providerValue,
          doc_type: docType,
          medication: docType === "Rezept" ? medication.trim() : null,
        };

        const updated = await apiPost(`/documents/${doc.id}/update`, payload);

        const mapped = {
          id: updated.id,
          title: updated.title,
          serviceDate: updated.service_date,
          provider: updated.provider,
          docType: updated.doc_type,
          medication: updated.medication,
          fileId: updated.file_id,
        };

        onSave(mapped, "edit");
        alert("Gespeichert.");

      } else if (mode === "medication" && doc?.id) {
        // Nur Medikament bearbeiten
        const payload = {
          title: doc.title,
          service_date: (doc.serviceDate || "").slice(0, 10),
          provider: doc.provider,
          doc_type: doc.docType,
          medication: medication.trim(),
        };

        const updated = await apiPost(`/documents/${doc.id}/update`, payload);

        const mapped = {
          id: updated.id,
          title: updated.title,
          serviceDate: updated.service_date,
          provider: updated.provider,
          docType: updated.doc_type,
          medication: updated.medication,
          fileId: updated.file_id,
        };

        onSave(mapped, "medication");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    }
  };

  const handleDelete = async () => {
    if (!doc?.id) return;

    const ok = window.confirm(
      "Willst du dieses Dokument wirklich löschen? Die Datei wird ebenfalls entfernt."
    );

    if (!ok) return;

    try {
      await apiPost(`/documents/${doc.id}/delete`);
      onSave(doc, "delete");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen des Dokuments.");
    }
  };

  const openFile = async () => {
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

  if (!isOpen) return null;

  // Modal-Titel basierend auf Modus
  const modalTitle =
    mode === "new"
      ? "Neuen Bericht erfassen"
      : mode === "medication"
      ? "Medikament bearbeiten"
      : "Dokument bearbeiten";

  return (
    <div className="docsModalBackdrop" onMouseDown={onClose}>
      <div className="docsModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="docsModalHeader">
          <div className="docsModalTitle">{modalTitle}</div>
          <button className="docsModalClose" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {mode === "medication" ? (
          // Nur Medikament bearbeiten
          <div className="docsModalForm">
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

            <div className="docsModalActions">
              <button className="docsSecondary" type="button" onClick={onClose}>
                Abbrechen
              </button>
              <button className="docsPrimary" type="button" onClick={handleSave}>
                Speichern
              </button>
            </div>
          </div>
        ) : (
          // Neues Dokument oder Bearbeiten
          <form className="docsModalForm" onSubmit={handleSave}>
            <div className="docsHint">
              {mode === "new" ? "Trage die Felder ein" : "Bearbeite die Felder und speichere."}
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

              {providerChoice === "__custom__" && (
                <input
                  className="docsInput"
                  value={providerCustom}
                  onChange={(e) => setProviderCustom(e.target.value)}
                  placeholder="z.B. USZ Zuerich"
                  required
                />
              )}
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

            {docType === "Rezept" && (
              <div className="docsLabel medication-dropdown-wrapper" style={{ position: 'relative' }}>
                <div>Medikament</div>
                
                {/* Das Dropdown-Feld */}
                <div 
                  className="docsSelect" 
                  onClick={() => setIsMedDropdownOpen(!isMedDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  {medication || "Medikament wählen..."}
                </div>

                {/* Das Dropdown-Menü mit Suchfeld */}
                {isMedDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #e9edf5',
                    borderRadius: '12px',
                    zIndex: 10,
                    marginTop: '4px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}>
                    <input
                      type="text"
                      placeholder="Suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: 'none',
                        borderBottom: '1px solid #e9edf5',
                        outline: 'none',
                        borderRadius: '12px 12px 0 0'
                      }}
                      autoFocus
                    />
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredMeds.map((med) => (
                        <div
                          key={med}
                          style={{ 
                            padding: '10px 14px', 
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          onClick={() => {
                            setMedication(med);
                            setIsMedDropdownOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          {med}
                        </div>
                      ))}
                      {filteredMeds.length === 0 && (
                        <div style={{ padding: '10px', color: '#64748b' }}>
                          Kein Treffer
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="docsLabel">
              <div>Datei</div>
              {mode === "new" ? (
                <input
                  className="docsInput"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              ) : doc?.fileId ? (
                <button className="docsOpen" type="button" onClick={openFile}>
                  Datei öffnen
                </button>
              ) : (
                <div className="docsInput">Keine Datei vorhanden</div>
              )}
            </div>

            {mode === "edit" ? (
              <div className="docsModalActions docsModalActionsBetween">
                <button className="docsDanger" type="button" onClick={handleDelete}>
                  Löschen
                </button>

                <div className="docsModalActionsRight">
                  <button className="docsSecondary" type="button" onClick={onClose}>
                    Abbrechen
                  </button>
                  <button className="docsPrimary" type="submit">
                    Speichern
                  </button>
                </div>
              </div>
            ) : (
              <div className="docsModalActions">
                <button className="docsSecondary" type="button" onClick={onClose}>
                  Abbrechen
                </button>
                <button className="docsPrimary" type="submit">
                  Speichern
                </button>
              </div>
            )}

            {mode === "new" && (
              <div className="docsFileNote">Drücke auf Speichern</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}