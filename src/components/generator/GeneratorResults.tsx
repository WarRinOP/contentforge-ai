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

export default function GeneratorResults({
  content,
  onDraftGenerated,
}: GeneratorResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [content.id]);

  return (
    <div
      ref={containerRef}
      className="animate-fade-in-up space-y-6 scroll-mt-24"
    >
      {/* Brief Panel — Full Width */}
      <BriefPanel content={content} />

      {/* Two Column — Outline + Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-6">
        {content.outline && <OutlinePanel outline={content.outline} />}
        <MetaPanel content={content} />
      </div>

      {/* Draft Panel — Full Width */}
      <DraftPanel content={content} onDraftGenerated={onDraftGenerated} />
    </div>
  );
}
