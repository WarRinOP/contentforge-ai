"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TopicInput from "@/components/generator/TopicInput";
import GeneratorResults from "@/components/generator/GeneratorResults";
import Badge from "@/components/ui/Badge";

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
  created_at: string;
}

const statusBadge: Record<string, "gray" | "blue" | "green"> = {
  brief: "gray",
  outlined: "blue",
  drafted: "green",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentRecord | null>(null);
  const [recentContent, setRecentContent] = useState<ContentRecord[]>([]);
  const [recentLoaded, setRecentLoaded] = useState(false);

  useEffect(() => {
    if (recentLoaded) return;
    let cancelled = false;
    async function loadRecent() {
      try {
        const res = await fetch("/api/content");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setRecentContent(data.slice(0, 3));
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setRecentLoaded(true); }
    }
    loadRecent();
    return () => { cancelled = true; };
  }, [recentLoaded]);

  const handleResult = (data: Record<string, unknown>) => {
    setCurrentContent(data as unknown as ContentRecord);
    setRecentLoaded(false);
  };

  const handleDraftGenerated = (updated: Record<string, unknown>) => {
    setCurrentContent(updated as unknown as ContentRecord);
    setRecentLoaded(false);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "clamp(40px, 7vw, 64px) 20px 32px",
        maxWidth: "640px",
        margin: "0 auto",
        width: "100%",
      }}>
        <h1 style={{
          fontSize: "clamp(26px, 6vw, 40px)",
          fontWeight: "800",
          lineHeight: 1.15,
          color: "#f0f4f8",
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}>
          AI-Powered SEO Content Generator
        </h1>
        <p style={{ fontSize: "clamp(14px, 3vw, 16px)", color: "#8b9eb0", lineHeight: 1.7, margin: "0 0 6px" }}>
          Enter a topic to get a complete SEO brief, outline, meta tags, and full draft.
        </p>
        <p style={{ fontSize: "12px", color: "#445566", fontFamily: "'JetBrains Mono', monospace" }}>
          claude-haiku-4-5
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: "720px", margin: "0 auto", width: "100%", padding: "0 16px" }}>
        <TopicInput
          onResult={handleResult}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </div>

      {/* Results */}
      {currentContent && (
        <div style={{ maxWidth: "1200px", margin: "40px auto 0", width: "100%", padding: "0 20px" }}>
          <GeneratorResults content={currentContent} onDraftGenerated={handleDraftGenerated} />
        </div>
      )}

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <div style={{ maxWidth: "720px", margin: "48px auto 0", width: "100%", padding: "0 16px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              Recent Content
            </h2>
            <Link href="/history" style={{ fontSize: "12px", color: "#10b981", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentContent.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "#0e1012",
                  border: "1px solid #1d2327",
                  borderRadius: "10px",
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                  gap: "12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a3540")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1d2327")}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#f0f4f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.topic.length > 70 ? item.topic.slice(0, 70) + "…" : item.topic}
                  </div>
                  <div style={{ fontSize: "12px", color: "#445566", marginTop: "3px" }}>
                    {item.status}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <Badge variant={statusBadge[item.status] || "gray"}>{item.status}</Badge>
                  <span style={{ fontSize: "12px", color: "#445566" }}>{timeAgo(item.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
