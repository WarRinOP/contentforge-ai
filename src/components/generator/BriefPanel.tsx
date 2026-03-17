"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CopyButton from "@/components/ui/CopyButton";

interface ContentRecord {
  target_keyword: string | null;
  secondary_keywords: string[] | null;
  search_intent: string | null;
  recommended_word_count: number | null;
}

interface BriefPanelProps {
  content: ContentRecord;
}

const intentColors: Record<string, "blue" | "green" | "orange" | "purple"> = {
  informational: "blue",
  commercial: "green",
  transactional: "orange",
  navigational: "purple",
};

export default function BriefPanel({ content }: BriefPanelProps) {
  return (
    <Card
      title="SEO Brief"
      headerAction={
        <Badge variant="gray" className="text-[10px]">
          claude-haiku-4-5
        </Badge>
      }
    >
      {/* Target Keyword */}
      <div className="mb-5">
        <span className="label block mb-1.5">Target Keyword</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-accent mono">
            {content.target_keyword || "—"}
          </span>
          {content.target_keyword && (
            <CopyButton
              textToCopy={content.target_keyword}
              label="keyword"
              variant="inline"
            />
          )}
        </div>
      </div>

      {/* Secondary Keywords */}
      {content.secondary_keywords && content.secondary_keywords.length > 0 && (
        <div className="mb-5">
          <span className="label block mb-2">Secondary Keywords</span>
          <div className="flex flex-wrap gap-1.5">
            {content.secondary_keywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-accent/8 text-accent/80 border border-accent/15"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Intent + Word Count */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-surface2 rounded-lg p-3 border border-border-default">
          <span className="label block mb-1">Search Intent</span>
          {content.search_intent ? (
            <Badge variant={intentColors[content.search_intent] || "gray"}>
              {content.search_intent}
            </Badge>
          ) : (
            <span className="text-text-muted text-sm">—</span>
          )}
        </div>
        <div className="bg-bg-surface2 rounded-lg p-3 border border-border-default">
          <span className="label block mb-1">Recommended Length</span>
          <div>
            <span className="metric-value text-xl">
              {content.recommended_word_count?.toLocaleString() || "—"}
            </span>
            <span className="text-text-muted text-xs ml-1">words</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
