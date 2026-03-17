"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Badge from "@/components/ui/Badge";
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

  const cardStyle: React.CSSProperties = {
    background: "#0e1012",
    border: "1px solid #1d2327",
    borderRadius: "12px",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1d2327",
  };

  if (!hasDraft) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#f0f4f8" }}>Full Article Draft</span>
        </div>
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", margin: "0 auto 12px",
            borderRadius: "10px", background: "#161a1d", border: "1px solid #1d2327",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#445566" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p style={{ fontSize: "14px", color: "#8b9eb0", marginBottom: "4px" }}>
            Generate a complete article from your outline
          </p>
          <p style={{ fontSize: "11px", color: "#445566", fontFamily: "'JetBrains Mono', monospace", marginBottom: "20px" }}>
            ~{content.recommended_word_count?.toLocaleString() || "1,500"} words · takes 20–30 seconds
          </p>

          <div style={{ maxWidth: "280px", margin: "0 auto" }}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                width: "100%",
                padding: "10px 20px",
                background: isGenerating ? "#161a1d" : "#161a1d",
                border: "1px solid #2a3540",
                color: isGenerating ? "#445566" : "#f0f4f8",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "8px",
                cursor: isGenerating ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.borderColor = "#10b981"; }}
              onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.borderColor = "#2a3540"; }}
            >
              {isGenerating ? (
                <>
                  <span style={{
                    width: "12px", height: "12px",
                    border: "2px solid rgba(16,185,129,0.2)",
                    borderTop: "2px solid #10b981",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                    flexShrink: 0,
                  }} />
                  Writing article with Claude...
                </>
              ) : (
                "Generate Full Draft →"
              )}
            </button>
          </div>

          {isGenerating && (
            <p style={{ fontSize: "11px", color: "#445566", marginTop: "10px" }}>
              This takes 20–30 seconds. Please wait...
            </p>
          )}

          {/* Error state with Try Again */}
          {error && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "8px" }}>
                ⚠ Failed to generate draft
              </p>
              <button
                onClick={() => { setError(""); handleGenerate(); }}
                style={{
                  background: "none", border: "none",
                  fontSize: "13px", color: "#10b981",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Try again →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#f0f4f8" }}>Full Article Draft</span>
        <Badge variant="green">{content.word_count?.toLocaleString() || 0} words</Badge>
      </div>

      {/* Markdown render */}
      <div style={{ maxHeight: "500px", overflowY: "auto", overflowX: "hidden", padding: "20px" }}>
        <div className="prose-draft">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.full_draft || ""}
          </ReactMarkdown>
        </div>
      </div>

      {/* Action buttons — wraps on mobile */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        borderTop: "1px solid #1d2327",
      }}>
        <CopyButton textToCopy={content.full_draft || ""} label="Copy draft" />
        <button
          onClick={() => handleDownload("md")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "6px 12px", background: "transparent",
            border: "1px solid #1d2327", borderRadius: "6px",
            color: "#8b9eb0", fontSize: "12px", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a3540"; e.currentTarget.style.color = "#f0f4f8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1d2327"; e.currentTarget.style.color = "#8b9eb0"; }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          .md
        </button>
        <button
          onClick={() => handleDownload("txt")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "6px 12px", background: "transparent",
            border: "1px solid #1d2327", borderRadius: "6px",
            color: "#8b9eb0", fontSize: "12px", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a3540"; e.currentTarget.style.color = "#f0f4f8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1d2327"; e.currentTarget.style.color = "#8b9eb0"; }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          .txt
        </button>
      </div>
    </div>
  );
}
