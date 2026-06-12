import React, { useMemo, useState } from "react";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function DocumentsMedicationView({ docs, onOpenFile, onEditMedication }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  const groups = useMemo(() => {
    const map = new Map();

    for (const d of docs) {
      if (typeof d.medication !== "string") continue;

      const m = d.medication.trim();
      if (!m) continue;

      if (!map.has(m)) map.set(m, []);
      map.get(m).push(d);
    }

    for (const arr of map.values()) {
      arr.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
    }

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [docs]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(([name]) => name.toLowerCase().includes(q));
  }, [groups, query]);

  const selectedName = useMemo(() => {
    if (selected) return selected;
    return filteredGroups.length > 0 ? filteredGroups[0][0] : "";
  }, [filteredGroups, selected]);

  const selectedDocs = useMemo(() => {
    if (!selectedName) return [];
    const hit = groups.find(([name]) => name === selectedName);
    return hit ? hit[1] : [];
  }, [groups, selectedName]);

  if (groups.length === 0) {
    return <div className="docsEmpty">Keine Rezepte mit Medikamenten vorhanden.</div>;
  }

  return (
    <div className="medView">
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
            const latestDate = items[0]?.serviceDate;
            return (
              <button
                key={name}
                type="button"
                className={`medItem${active ? ' medItemActive' : ''}`}
                onClick={() => setSelected(name)}
              >
                <div className="medItemRow">
                  <div className="medItemName">{name}</div>
                  <span className="medItemBadge">{items.length}</span>
                </div>
                <div className="medItemMeta">Zuletzt: {formatDate(latestDate)}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="medRight">
        <div className="medHeader">
          <div>
            <div className="medHeaderTitle">{selectedName}</div>
            <div className="medHeaderMeta">
              {selectedDocs.length} {selectedDocs.length === 1 ? 'Rezept' : 'Rezepte'}
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
                {onEditMedication && (
                  <button
                    type="button"
                    className="medAction medActionSecondary"
                    onClick={() => onEditMedication(d)}
                  >
                    Bearbeiten
                  </button>
                )}
                <button
                  type="button"
                  className="medAction"
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
    </div>
  );
}
