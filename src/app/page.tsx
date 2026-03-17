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
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setRecentLoaded(true);
      }
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
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg
              className="w-4.5 h-4.5 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Content<span className="text-accent">Forge</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm max-w-xl">
          Enter a topic. Get a complete SEO brief, article outline, meta tags,
          and full draft — powered by Claude.
        </p>
        <p className="text-text-muted text-xs mt-1 mono">
          Powered by claude-haiku-4-5
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
        <div className="mt-8">
          <GeneratorResults
            content={currentContent}
            onDraftGenerated={handleDraftGenerated}
          />
        </div>
      )}

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="label">Recent Content</h2>
            <Link
              href="/history"
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentContent.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="group bg-bg-surface border border-border-default rounded-lg p-4 hover:border-border-hover transition-all duration-200"
              >
                <p className="text-sm text-text-primary font-medium mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {item.topic.length > 60
                    ? item.topic.slice(0, 60) + "..."
                    : item.topic}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={statusBadge[item.status] || "gray"}>
                    {item.status}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
