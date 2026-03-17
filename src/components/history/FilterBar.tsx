"use client";

import React, { useState, useEffect, useCallback } from "react";

const STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "brief", label: "Brief" },
  { value: "outlined", label: "Outlined" },
  { value: "drafted", label: "Drafted" },
];

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "Blog Post", label: "Blog Post" },
  { value: "How-To Guide", label: "How-To" },
  { value: "Product Review", label: "Review" },
  { value: "Listicle", label: "Listicle" },
  { value: "Opinion Piece", label: "Opinion" },
];

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
];

const STATUS_ACTIVE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "": { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  brief: { bg: "rgba(69,85,102,0.15)", color: "#8b9eb0", border: "rgba(69,85,102,0.3)" },
  outlined: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  drafted: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
};

interface FilterBarProps {
  search: string;
  status: string;
  contentType: string;
  period: string;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onContentTypeChange: (v: string) => void;
  onPeriodChange: (v: string) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  search, status, contentType, period,
  totalCount, filteredCount,
  onSearchChange, onStatusChange, onContentTypeChange, onPeriodChange, onClearFilters,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const debounced = useCallback((fn: () => void) => {
    const t = setTimeout(fn, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const cancel = debounced(() => onSearchChange(localSearch));
    return cancel;
  }, [localSearch, debounced, onSearchChange]);

  const hasActiveFilters = search || status || contentType || period !== "all";

  const pillBase: React.CSSProperties = {
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: "500",
    borderRadius: "20px",
    border: "1px solid #1d2327",
    background: "#161a1d",
    color: "#445566",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };

  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: "rgba(16,185,129,0.1)",
    color: "#10b981",
    border: "1px solid rgba(16,185,129,0.3)",
  };

  return (
    <div style={{
      background: "#0e1012",
      border: "1px solid #1d2327",
      borderRadius: "12px",
      padding: "20px",
    }}>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#445566", flexShrink: 0 }}
          width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by topic..."
          style={{
            width: "100%",
            background: "#161a1d",
            border: "1px solid #1d2327",
            borderRadius: "8px",
            paddingLeft: "42px", paddingRight: "14px",
            paddingTop: "9px", paddingBottom: "9px",
            fontSize: "14px",
            color: "#f0f4f8",
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#10b981")}
          onBlur={(e) => (e.target.style.borderColor = "#1d2327")}
        />
      </div>

      {/* Filter pills — all wrap on mobile */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        {/* Status label */}
        <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", color: "#445566" }}>
          Status:
        </span>
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          const activeColors = STATUS_ACTIVE_COLORS[f.value] || STATUS_ACTIVE_COLORS[""];
          return (
            <button key={f.value} onClick={() => onStatusChange(f.value)}
              style={active ? { ...pillBase, background: activeColors.bg, color: activeColors.color, border: `1px solid ${activeColors.border}` } : pillBase}>
              {f.label}
            </button>
          );
        })}

        {/* Separator */}
        <span style={{ width: "1px", height: "16px", background: "#1d2327", display: "inline-block", margin: "0 4px" }} />

        {/* Type label */}
        <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", color: "#445566" }}>
          Type:
        </span>
        {TYPE_FILTERS.map((f) => (
          <button key={f.value} onClick={() => onContentTypeChange(f.value)}
            style={contentType === f.value ? pillActive : pillBase}>
            {f.label}
          </button>
        ))}

        {/* Separator */}
        <span style={{ width: "1px", height: "16px", background: "#1d2327", display: "inline-block", margin: "0 4px" }} />

        {/* Period label */}
        <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", color: "#445566" }}>
          Period:
        </span>
        {DATE_FILTERS.map((f) => (
          <button key={f.value} onClick={() => onPeriodChange(f.value)}
            style={period === f.value ? pillActive : pillBase}>
            {f.label}
          </button>
        ))}

        {/* Count + clear */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
          {hasActiveFilters && (
            <button onClick={onClearFilters} style={{
              background: "none", border: "none",
              fontSize: "12px", color: "#445566",
              cursor: "pointer", fontFamily: "inherit",
              transition: "color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#445566")}
            >
              Clear filters
            </button>
          )}
          <span style={{ fontSize: "13px", color: "#445566", fontFamily: "'JetBrains Mono', monospace" }}>
            {filteredCount === totalCount ? `${totalCount} pieces` : `${filteredCount} / ${totalCount}`}
          </span>
        </div>
      </div>
    </div>
  );
}
