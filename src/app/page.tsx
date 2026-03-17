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
    <div className="page-container">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
          AI-Powered SEO Content Generator
        </h1>
        <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
          Enter a topic to get a complete SEO brief, article outline, meta tags,
          and full draft — powered by Claude.
        </p>
        <p className="text-text-muted text-sm mt-2 mono">
          claude-haiku-4-5
        </p>
      </div>

      {/* Topic Input */}
      <TopicInput
        onResult={handleResult}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
      />

      {/* Generator Results */}
      {currentContent && (
        <div className="mt-10">
          <GeneratorResults content={currentContent} onDraftGenerated={handleDraftGenerated} />
        </div>
      )}

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <div className="mt-14 pb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Recent Content</h2>
            <Link href="/history" className="text-sm text-text-muted hover:text-accent transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentContent.map((item) => (
              <Link key={item.id} href={`/content/${item.id}`}
                className="group bg-bg-surface border border-border-default rounded-xl p-5 hover:border-border-hover transition-all duration-200">
                <p className="text-sm text-text-primary font-medium mb-3 line-clamp-2 group-hover:text-accent transition-colors leading-relaxed">
                  {item.topic.length > 65 ? item.topic.slice(0, 65) + "..." : item.topic}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={statusBadge[item.status] || "gray"}>{item.status}</Badge>
                  <span className="text-xs text-text-muted">{timeAgo(item.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
