"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";

interface ContentRecord {
  id: string;
  full_draft: string | null;
  word_count: number | null;
  recommended_word_count: number | null;
  status: string;
}

interface DraftPanelProps {
  content: ContentRecord;
  onDraftGenerated: (updated: Record<string, unknown>) => void;
}

export default function DraftPanel({ content, onDraftGenerated }: DraftPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const hasDraft = !!content.full_draft;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: content.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Draft generation failed");
      }
      const data = await res.json();
      onDraftGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (format: "md" | "txt") => {
    window.open(`/api/export?id=${content.id}&format=${format}`, "_blank");
  };

  if (!hasDraft) {
    return (
      <Card title="Full Article Draft">
        <div className="text-center py-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-bg-surface2 border border-border-default flex items-center justify-center">
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm mb-0.5">
            Generate a complete article from your outline
          </p>
          <p className="text-text-muted text-[11px] mb-5">
            ~{content.recommended_word_count?.toLocaleString() || "1,500"} words · takes 20-30 seconds
          </p>
          <div className="max-w-xs mx-auto">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              loading={isGenerating}
              loadingText="Writing article with Claude..."
              onClick={handleGenerate}
            >
              Generate Full Draft →
            </Button>
          </div>
          {isGenerating && (
            <p className="text-text-muted text-[11px] mt-2">This takes 20-30 seconds. Please wait...</p>
          )}
          {error && <p className="text-danger text-xs mt-2">{error}</p>}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Full Article Draft"
      headerAction={
        <Badge variant="green">{content.word_count?.toLocaleString() || 0} words</Badge>
      }
    >
      {/* Markdown Render */}
      <div className="max-h-[500px] overflow-y-auto overflow-x-hidden pr-1 mb-3">
        <div className="prose-draft">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.full_draft || ""}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-border-default">
        <CopyButton textToCopy={content.full_draft || ""} label="Copy draft" />
        <Button variant="ghost" size="sm" onClick={() => handleDownload("md")}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          .md
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDownload("txt")}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          .txt
        </Button>
      </div>
    </Card>
  );
}
