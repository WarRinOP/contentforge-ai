"use client";

import React, { useEffect, useRef } from "react";
import BriefPanel from "./BriefPanel";
import OutlinePanel from "./OutlinePanel";
import MetaPanel from "./MetaPanel";
import DraftPanel from "./DraftPanel";

interface ContentRecord {
  id: string;
  topic: string;
  target_keyword: string | null;
  secondary_keywords: string[] | null;
  search_intent: string | null;
  recommended_word_count: number | null;
  outline: { level: string; heading: string; points: string[] }[] | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  full_draft: string | null;
  word_count: number | null;
  status: string;
}

interface GeneratorResultsProps {
  content: ContentRecord;
  onDraftGenerated: (updated: Record<string, unknown>) => void;
}

export default function GeneratorResults({ content, onDraftGenerated }: GeneratorResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [content.id]);

  return (
    <div ref={containerRef} className="animate-fade-in-up" style={{ scrollMarginTop: "80px" }}>
      {/* Brief — full width */}
      <div style={{ marginBottom: "24px" }}>
        <BriefPanel content={content} />
      </div>

      {/* Outline + Meta — side by side on lg, stacked on mobile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
        gap: "24px",
        marginBottom: "24px",
      }}>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          {content.outline && <OutlinePanel outline={content.outline} />}
        </div>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <MetaPanel content={content} />
        </div>
      </div>

      {/* Draft — full width */}
      <DraftPanel content={content} onDraftGenerated={onDraftGenerated} />
    </div>
  );
}
