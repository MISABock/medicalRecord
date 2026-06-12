import { useMemo, useState } from "react";
import { API_URL } from "../../api/client";

const DOC_COLORS = {
  Rezept: { accent: "#b45309", bg: "#fef3c7" },
};
function colorFor() { return DOC_COLORS.Rezept; }

function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString("de-CH"); } catch { return iso; }
}

export default function DocumentsMedicationView({ docs, onOpenDoc, onSave }) {
  const [query, setQuery]               = useState("");
  const [selected, setSelected]         = useState("");
  const [fileViewerUrl, setFileViewerUrl]     = useState(null);
  const [fileViewerType, setFileViewerType]   = useState(null);
  const [fileViewerTitle, setFileViewerTitle] = useState(null);

  const groups = useMemo(() => {
    const map = new Map();
    for (const d of docs) {
      if (typeof d.medication !== "string") continue;
      const m = d.medication.trim();
      if (!m) continue;
      if (!map.has(m)) map.set(m, []);
      map.get(m).push(d);
    }
    for (const arr of map.values()) arr.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [docs]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? groups.filter(([name]) => name.toLowerCase().includes(q)) : groups;
  }, [groups, query]);

  const selectedName = useMemo(() => {
    if (selected && groups.some(([n]) => n === selected)) return selected;
    return filteredGroups.length > 0 ? filteredGroups[0][0] : "";
  }, [filteredGroups, selected, groups]);

  const selectedDocs = useMemo(() => {
    const hit = groups.find(([name]) => name === selectedName);
    return hit ? hit[1] : [];
  }, [groups, selectedName]);

  const openFileInline = async (d) => {
    if (!d?.id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/documents/${d.id}/file`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setFileViewerUrl(window.URL.createObjectURL(blob));
      setFileViewerType(blob.type);
      setFileViewerTitle(d.title || "Dokument");
    } catch {
      alert("Fehler beim Öffnen der Datei.");
    }
  };

  const closeViewer = () => {
    if (fileViewerUrl) window.URL.revokeObjectURL(fileViewerUrl);
    setFileViewerUrl(null);
    setFileViewerType(null);
    setFileViewerTitle(null);
  };

  const handleDelete = async (d) => {
    if (!window.confirm("Dieses Rezept wirklich löschen?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/documents/${d.id}/delete`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      onSave(d, "delete");
    } catch {
      alert("Fehler beim Löschen.");
    }
  };

  if (groups.length === 0) {
    return <div className="docsEmpty">Keine Rezepte mit Medikamenten vorhanden.</div>;
  }

  const c = colorFor();

  return (
    <>
      <div className="medView">
        {/* Left: medication list */}
        <div className="medLeft">
          <div className="medSearchWrap">
            <input
              className="medSearch"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Medikament suchen"
            />
            <div className="medCount">{filteredGroups.length} Medikamente</div>
          </div>

          <div className="medList">
            {filteredGroups.map(([name, items]) => {
              const active = name === selectedName;
              return (
                <button
                  key={name}
                  type="button"
                  className={`medItem${active ? " medItemActive" : ""}`}
                  onClick={() => setSelected(name)}
                >
                  <div className="medItemRow">
                    <div className="medItemName">{name}</div>
                    <span className="medItemBadge">{items.length}</span>
                  </div>
                  <div className="medItemMeta">Zuletzt: {formatDate(items[0]?.serviceDate)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: prescriptions for selected medication */}
        <div className="medRight">
          <div className="medHeader">
            <div>
              <div className="medHeaderTitle">{selectedName}</div>
              <div className="medHeaderMeta">
                {selectedDocs.length} {selectedDocs.length === 1 ? "Rezept" : "Rezepte"}
              </div>
            </div>
          </div>

          <div className="medDocs">
            {selectedDocs.map((d) => (
              <div key={d.id} className="medDocRow">
                <div className="medDocMain">
                  <div className="medDocTitle">{d.title}</div>
                  <div className="medDocMetaLine">
                    <span>{formatDate(d.serviceDate)}</span>
                    <span className="medSep">·</span>
                    <span>{d.provider || "Unbekannt"}</span>
                  </div>
                </div>

                <div className="medDocActions">
                  {d.fileId && (
                    <button
                      type="button"
                      className="medAction"
                      onClick={() => openFileInline(d)}
                    >
                      Öffnen
                    </button>
                  )}
                  <button
                    type="button"
                    className="medAction medActionSecondary"
                    onClick={() => onOpenDoc(d)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    className="medAction medActionDanger"
                    onClick={() => handleDelete(d)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </>
  );
}
