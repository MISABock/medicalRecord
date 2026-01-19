import React from "react";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-CH");
  } catch {
    return iso;
  }
}

export default function DocumentsGroupedView({
  groups,
  onOpenDoc,
  metaRightField,
}) {
  return (
    <div className="docsProviderGrid">
      {groups.map(([groupName, items]) => (
        <section key={groupName} className="docsGroup">
          <div className="docsGroupHeader">
            <div className="docsGroupName">{groupName}</div>
            <div className="docsGroupCount">{items.length} Dokumente</div>
          </div>

          <div className="docsList">
            {items.map((d) => (
              <div
                key={d.id}
                className="docsRow docsRowClickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpenDoc(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onOpenDoc(d);
                  }
                }}
              >
                <div className="docsRowMain">
                  <div className="docsRowTitle">{d.title}</div>
                  <div className="docsRowMeta">
                    <span>{formatDate(d.serviceDate)}</span>
                    <span className="dot">•</span>
                    <span>{d?.[metaRightField] || "Unbekannt"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
