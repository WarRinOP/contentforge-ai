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

const statusPillActive: Record<string, string> = {
  brief: "bg-text-muted/15 text-text-secondary border-text-muted/30",
  outlined: "bg-info/10 text-info border-info/30",
  drafted: "bg-success/10 text-success border-success/30",
  "": "bg-accent/10 text-accent border-accent/30",
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

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 mb-5">
      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by topic..."
          className="w-full bg-bg-surface2 border border-border-default rounded-lg pl-11 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => onStatusChange(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                status === f.value
                  ? statusPillActive[f.value] || "bg-accent/10 text-accent border-accent/30"
                  : "bg-bg-surface2 text-text-muted border-border-default hover:border-border-hover hover:text-text-secondary"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border-default hidden sm:block" />

        {/* Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label">Type:</span>
          {TYPE_FILTERS.map((f) => (
            <button key={f.value} onClick={() => onContentTypeChange(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                contentType === f.value
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-bg-surface2 text-text-muted border-border-default hover:border-border-hover hover:text-text-secondary"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border-default hidden sm:block" />

        {/* Date */}
        <div className="flex items-center gap-2">
          <span className="label">Period:</span>
          {DATE_FILTERS.map((f) => (
            <button key={f.value} onClick={() => onPeriodChange(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                period === f.value
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-bg-surface2 text-text-muted border-border-default hover:border-border-hover hover:text-text-secondary"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Count + Clear */}
        <div className="ml-auto flex items-center gap-3">
          {hasActiveFilters && (
            <button onClick={onClearFilters} className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer">
              Clear filters
            </button>
          )}
          <span className="text-sm text-text-muted">
            {filteredCount === totalCount ? `${totalCount} pieces` : `${filteredCount} of ${totalCount}`}
          </span>
        </div>
      </div>
    </div>
  );
}
