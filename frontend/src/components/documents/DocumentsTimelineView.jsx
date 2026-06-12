import { useMemo, useState } from "react";

// ── Layout ────────────────────────────────────────────────────
const CHART_W    = 1000;
const PAD_L      = 116;
const PAD_R      = 52;
const PAD_TOP    = 10;
const LANE_H     = 46;
const PAD_BOT    = 40;
const DOT_R      = 7;
const SVG_FONT   = "ui-sans-serif, system-ui, -apple-system, sans-serif";

const LANE_ORDER = ["Blutbild", "Bericht", "Rezept", "Bildgebung", "Arztzeugnis", "Sonstiges"];
const NUM_LANES  = LANE_ORDER.length;
const CHART_H    = PAD_TOP + NUM_LANES * LANE_H + PAD_BOT;
const X_AXIS_Y   = PAD_TOP + NUM_LANES * LANE_H;

function laneIdx(type) {
  const i = LANE_ORDER.indexOf(type);
  return i >= 0 ? i : NUM_LANES - 1;
}
function laneCenter(idx) {
  return PAD_TOP + idx * LANE_H + LANE_H / 2;
}
// ─────────────────────────────────────────────────────────────

const DOC_COLORS = {
  Blutbild:    { accent: "#15803d", bg: "#dcfce7" },
  Bericht:     { accent: "#1d4ed8", bg: "#dbeafe" },
  Rezept:      { accent: "#b45309", bg: "#fef3c7" },
  Bildgebung:  { accent: "#6d28d9", bg: "#ede9fe" },
  Arztzeugnis: { accent: "#0f766e", bg: "#ccfbf1" },
  Sonstiges:   { accent: "#475569", bg: "#f1f5f9" },
};

function colorFor(type) {
  return DOC_COLORS[type] ?? DOC_COLORS.Sonstiges;
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString("de-CH"); } catch { return iso; }
}

const MONTHS_DE    = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const MONTHS_SHORT = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

function getMonth(dateStr)      { try { return MONTHS_DE[new Date(dateStr).getMonth()];    } catch { return ""; } }
function getMonthShort(dateStr) { try { return MONTHS_SHORT[new Date(dateStr).getMonth()]; } catch { return ""; } }

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export default function DocumentsTimelineView({ docs, onOpenDoc }) {
  const [hoveredId,   setHoveredId]   = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);

  const byYear = useMemo(() => {
    const map = new Map();
    for (const d of docs) {
      const year = (d.serviceDate || "").slice(0, 4) || "Unbekannt";
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(d);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [docs]);

  const chartData = useMemo(() => {
    const withTs = docs
      .filter((d) => d.serviceDate)
      .map((d) => ({ ...d, ts: new Date(d.serviceDate).getTime() }));

    if (withTs.length === 0) return null;

    const sorted = [...withTs].sort((a, b) => a.ts - b.ts);
    let minTs = sorted[0].ts;
    let maxTs = sorted[sorted.length - 1].ts;

    const SIX_MONTHS = 183 * 24 * 3600 * 1000;
    if (maxTs - minTs < SIX_MONTHS) {
      const mid = (minTs + maxTs) / 2;
      minTs = mid - SIX_MONTHS;
      maxTs = mid + SIX_MONTHS;
    } else {
      const span = maxTs - minTs;
      minTs -= span * 0.04;
      maxTs += span * 0.04;
    }

    const span  = maxTs - minTs;
    const axisW = CHART_W - PAD_L - PAD_R;
    const tsToX = (ts) => PAD_L + ((ts - minTs) / span) * axisW;

    // Year markers
    const yearMarkers = [];
    for (let y = new Date(minTs).getFullYear(); y <= new Date(maxTs).getFullYear(); y++) {
      const yStart = new Date(y, 0, 1).getTime();
      const yEnd   = new Date(y + 1, 0, 1).getTime();
      if (yEnd > minTs && yStart < maxTs) {
        const x = Math.max(PAD_L + 8, tsToX(yStart));
        if (x < CHART_W - PAD_R - 4) yearMarkers.push({ year: y, x });
      }
    }

    // Group same-lane + same-month docs into one dot
    const grouped = new Map();
    for (const d of sorted) {
      const date = new Date(d.ts);
      const key  = `${laneIdx(d.docType)}_${date.getFullYear()}_${date.getMonth()}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push({ ...d, x: tsToX(d.ts), lane: laneIdx(d.docType), cy: laneCenter(laneIdx(d.docType)) });
    }

    const items = Array.from(grouped.entries()).map(([key, group]) => {
      const avgX = group.reduce((s, d) => s + d.x, 0) / group.length;
      return { ...group[0], x: avgX, groupKey: key, count: group.length, docs: group };
    });

    return { items, yearMarkers };
  }, [docs]);

  if (docs.length === 0) {
    return <div className="docsEmpty">Keine Dokumente vorhanden.</div>;
  }

  return (
    <div className="vtlWrap">

      {chartData && (
        <div className="vtlChart">
          <div className="vtlChartLabel">Chronologie</div>
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            width="100%"
            height={CHART_H}
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            {/* Lane backgrounds */}
            {LANE_ORDER.map((_, i) => (
              <rect key={`bg-${i}`}
                x={PAD_L} y={PAD_TOP + i * LANE_H}
                width={CHART_W - PAD_L - PAD_R} height={LANE_H}
                fill={i % 2 === 0 ? "#f8fafc" : "#ffffff"}
              />
            ))}

            {/* Lane separators */}
            {LANE_ORDER.map((_, i) => i > 0 ? (
              <line key={`sep-${i}`}
                x1={PAD_L} y1={PAD_TOP + i * LANE_H}
                x2={CHART_W - PAD_R} y2={PAD_TOP + i * LANE_H}
                stroke="#e9edf5" strokeWidth="1" />
            ) : null)}

            {/* Y-axis line */}
            <line x1={PAD_L} y1={PAD_TOP} x2={PAD_L} y2={X_AXIS_Y}
              stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Y-axis labels */}
            {LANE_ORDER.map((type, i) => {
              const c  = colorFor(type);
              const cy = laneCenter(i);
              return (
                <g key={`yl-${i}`}>
                  <circle cx={PAD_L - 20} cy={cy} r={6} fill={c.accent} opacity={0.9} />
                  <text x={PAD_L - 30} y={cy + 4}
                    textAnchor="end" fontSize="11" fontWeight="700"
                    fill="#334155" fontFamily={SVG_FONT}>
                    {type}
                  </text>
                </g>
              );
            })}

            {/* Dashed year guides */}
            {chartData.yearMarkers.map(({ year, x }) => (
              <line key={`guide-${year}`}
                x1={x} y1={PAD_TOP} x2={x} y2={X_AXIS_Y}
                stroke="#e9edf5" strokeWidth="1" strokeDasharray="4 4" />
            ))}

            {/* X-axis + arrow */}
            <line x1={PAD_L} y1={X_AXIS_Y} x2={CHART_W - PAD_R} y2={X_AXIS_Y}
              stroke="#e2e8f0" strokeWidth="2" />
            <polygon
              points={`${CHART_W - PAD_R + 16},${X_AXIS_Y} ${CHART_W - PAD_R},${X_AXIS_Y - 5.5} ${CHART_W - PAD_R},${X_AXIS_Y + 5.5}`}
              fill="#cbd5e1" />

            {/* Year labels */}
            {chartData.yearMarkers.map(({ year, x }) => (
              <g key={`ym-${year}`}>
                <line x1={x} y1={X_AXIS_Y} x2={x} y2={X_AXIS_Y + 8}
                  stroke="#cbd5e1" strokeWidth="1.5" />
                <text x={x} y={X_AXIS_Y + 22}
                  textAnchor="middle" fontSize="12" fontWeight="700"
                  fill="#94a3b8" fontFamily={SVG_FONT}>
                  {year}
                </text>
              </g>
            ))}

            {/* Dots */}
            {chartData.items.map((item) => {
              const c          = colorFor(item.docType);
              const isHovered  = hoveredId === item.groupKey;
              const isMulti    = item.count > 1;

              // Single-doc hover callout dimensions
              const cW = 190;
              const cH = item.provider ? 54 : 40;
              const cX = Math.min(Math.max(item.x - cW / 2, PAD_L + 4), CHART_W - PAD_R - cW - 4);
              const showAbove = item.cy - DOT_R - cH - 10 >= PAD_TOP + 4;
              const cY = showAbove ? item.cy - DOT_R - cH - 10 : item.cy + DOT_R + 8;

              return (
                <g key={item.groupKey}
                  onClick={() => {
                    if (isMulti) setExpandedKey(k => k === item.groupKey ? null : item.groupKey);
                    else onOpenDoc(item.docs[0]);
                  }}
                  onMouseEnter={() => setHoveredId(item.groupKey)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Hover ring */}
                  {isHovered && (
                    <circle cx={item.x} cy={item.cy} r={DOT_R + 5} fill={c.bg} opacity={0.9} />
                  )}

                  {/* Dot — larger for multi so number fits */}
                  <circle cx={item.x} cy={item.cy} r={isMulti ? DOT_R + 3 : DOT_R}
                    fill={c.accent} opacity={isHovered ? 1 : 0.85} />

                  {/* Count label inside dot */}
                  {isMulti && (
                    <text x={item.x} y={item.cy + 4}
                      textAnchor="middle" fontSize="9" fontWeight="900"
                      fill="white" fontFamily={SVG_FONT} pointerEvents="none">
                      {item.count}
                    </text>
                  )}

                  {/* Month label */}
                  <text x={item.x} y={item.cy + DOT_R + 11}
                    textAnchor="middle" fontSize="9" fontWeight="600"
                    fill={c.accent} opacity={0.75}
                    fontFamily={SVG_FONT} pointerEvents="none">
                    {getMonthShort(item.serviceDate)}
                  </text>

                  {/* Single-doc hover callout */}
                  {isHovered && !isMulti && (
                    <g pointerEvents="none">
                      <rect x={cX} y={cY} width={cW} height={cH}
                        rx={8} ry={8} fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                      <text x={cX + cW / 2} y={cY + 16}
                        textAnchor="middle" fontSize="11" fontWeight="800"
                        fill="#0f172a" fontFamily={SVG_FONT}>
                        {truncate(item.title, 22)}
                      </text>
                      <text x={cX + cW / 2} y={cY + 31}
                        textAnchor="middle" fontSize="10" fontWeight="700"
                        fill={c.accent} fontFamily={SVG_FONT}>
                        {getMonth(item.serviceDate)} · {formatDate(item.serviceDate)}
                      </text>
                      {item.provider && (
                        <text x={cX + cW / 2} y={cY + 46}
                          textAnchor="middle" fontSize="9"
                          fill="#94a3b8" fontFamily={SVG_FONT}>
                          {truncate(item.provider, 26)}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}

            {/* Expanded multi-doc popup — rendered last to sit on top */}
            {expandedKey && (() => {
              const item = chartData.items.find((d) => d.groupKey === expandedKey);
              if (!item) return null;
              const c   = colorFor(item.docType);
              const ROW = 38;
              const pW  = 224;
              const pH  = 26 + item.docs.length * ROW + 6;
              const pX  = Math.min(Math.max(item.x - pW / 2, PAD_L + 4), CHART_W - PAD_R - pW - 4);
              const above = item.cy - DOT_R - pH - 10 >= PAD_TOP;
              const pY  = above ? item.cy - DOT_R - pH - 10 : item.cy + DOT_R + 10;

              return (
                <g key="popup">
                  {/* Backdrop to close */}
                  <rect x={0} y={0} width={CHART_W} height={CHART_H} fill="transparent"
                    onClick={(e) => { e.stopPropagation(); setExpandedKey(null); }} />

                  {/* Box */}
                  <rect x={pX} y={pY} width={pW} height={pH}
                    rx={10} ry={10} fill="white" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Header */}
                  <text x={pX + pW / 2} y={pY + 17}
                    textAnchor="middle" fontSize="10" fontWeight="700"
                    fill="#94a3b8" fontFamily={SVG_FONT}>
                    {item.count} Einträge · {getMonth(item.docs[0].serviceDate)}
                  </text>

                  {/* Doc rows */}
                  {item.docs.map((doc, idx) => {
                    const dc = colorFor(doc.docType);
                    const ry = pY + 22 + idx * ROW;
                    return (
                      <g key={doc.id}
                        onClick={(e) => { e.stopPropagation(); onOpenDoc(doc); setExpandedKey(null); }}
                        style={{ cursor: "pointer" }}
                      >
                        <rect x={pX + 6} y={ry + 2} width={pW - 12} height={ROW - 4}
                          rx={6} ry={6} fill={dc.bg} opacity={0.45} />
                        <circle cx={pX + 18} cy={ry + ROW / 2} r={4} fill={dc.accent} />
                        <text x={pX + 28} y={ry + 15}
                          fontSize="11" fontWeight="800" fill="#0f172a" fontFamily={SVG_FONT}>
                          {truncate(doc.title, 20)}
                        </text>
                        <text x={pX + 28} y={ry + 29}
                          fontSize="9" fill="#94a3b8" fontFamily={SVG_FONT}>
                          {formatDate(doc.serviceDate)}
                          {doc.provider ? ` · ${truncate(doc.provider, 18)}` : ""}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Vertical timeline list */}
      <div className="vtlBody">
        {byYear.map(([year, items]) => (
          <div key={year} className="vtlGroup">
            <div className="vtlYearMarker">
              <div className="vtlYearLine" />
              <div className="vtlYearLabel">{year}</div>
              <div className="vtlYearLine" />
            </div>

            {items.map((d, i) => {
              const c      = colorFor(d.docType);
              const isLast = i === items.length - 1;
              return (
                <div key={d.id} className="vtlItem">
                  <div className="vtlLeft">
                    <span className="vtlDate">{formatDate(d.serviceDate)}</span>
                  </div>
                  <div className="vtlConnector">
                    <div className="vtlDot"
                      style={{ background: c.accent, boxShadow: `0 0 0 3px ${c.bg}` }} />
                    {!isLast && <div className="vtlLine" />}
                  </div>
                  <div
                    className="vtlCard"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDoc(d)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpenDoc(d); }}
                  >
                    <span className="vtlBadge" style={{ background: c.bg, color: c.accent }}>
                      {d.docType || "Sonstiges"}
                    </span>
                    <div className="vtlTitle">{d.title}</div>
                    {d.provider && <div className="vtlProvider">{d.provider}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}
