import React from "react";

const GROUP_COLORS = {
  Blutbild:    { accent: '#15803d', bg: '#dcfce7' },
  Bericht:      { accent: '#1d4ed8', bg: '#dbeafe' },
  Rezept:      { accent: '#b45309', bg: '#fef3c7' },
  Bildgebung:  { accent: '#6d28d9', bg: '#ede9fe' },
  Sonstiges:   { accent: '#475569', bg: '#f1f5f9' },
  Arztzeugnis: { accent: '#0f766e', bg: '#ccfbf1' },
};

function groupColor(name) {
  return GROUP_COLORS[name] ?? { accent: '#7c3aed', bg: '#f4f7ff' };
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function DocumentsGroupedView({ groups, onOpenDoc, metaRightField }) {
  return (
    <div className="docsProviderGrid">
      {groups.map(([groupName, items]) => {
        const gc = groupColor(groupName);
        return (
          <section
            key={groupName}
            className="docsGroup"
            style={{ borderTop: `3px solid ${gc.accent}` }}
          >
            <div className="docsGroupHeader">
              <div className="docsGroupName">{groupName}</div>
              <span
                className="docsGroupBadge"
                style={{ background: gc.bg, color: gc.accent }}
              >
                {items.length}
              </span>
            </div>

            <div className="docsList">
              {items.map((d) => {
                const docColor = GROUP_COLORS[d.docType] ?? { accent: '#475569', bg: '#f1f5f9' };
                return (
                  <div
                    key={d.id}
                    className="docsRow docsRowClickable"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDoc(d)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onOpenDoc(d);
                    }}
                  >
                    <div className="docsRowMain">
                      <div className="docsRowTitle">{d.title}</div>
                      <div className="docsRowMeta">
                        {metaRightField === "docType" ? (
                          <span
                            className="docsRowBadge"
                            style={{ background: docColor.bg, color: docColor.accent }}
                          >
                            {d.docType || "Unbekannt"}
                          </span>
                        ) : (
                          <span>{d.provider || "Unbekannt"}</span>
                        )}
                      </div>
                    </div>
                    <div className="docsRowRight">
                      <span className="docsRowDate">{formatDate(d.serviceDate)}</span>
                      <span className="docsRowChevron">›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
