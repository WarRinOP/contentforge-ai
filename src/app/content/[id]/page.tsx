"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BriefPanel from "@/components/generator/BriefPanel";
import OutlinePanel from "@/components/generator/OutlinePanel";
import MetaPanel from "@/components/generator/MetaPanel";
import DraftPanel from "@/components/generator/DraftPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface ContentRecord {
  id: string;
  topic: string;
  target_audience: string | null;
  content_type: string | null;
  tone: string | null;
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

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [content, setContent] = useState<ContentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/content/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Content not found");
          } else {
            setError("Failed to load content");
          }
          return;
        }
        const data = await res.json();
        setContent(data);
      } catch {
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id]);

  const handleDraftGenerated = (updated: Record<string, unknown>) => {
    setContent(updated as unknown as ContentRecord);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.push("/history");
      } else {
        setError("Failed to delete content");
      }
    } catch {
      setError("Failed to delete content");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (format: "md" | "txt") => {
    window.open(`/api/export?id=${id}&format=${format}`, "_blank");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-shimmer rounded" />
          <div className="h-4 w-96 animate-shimmer rounded" />
          <div className="h-64 animate-shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="page-container">
        <div className="bg-bg-surface border border-border-default rounded-xl p-12 text-center">
          <p className="text-text-secondary mb-4">{error || "Content not found"}</p>
          <Link
            href="/history"
            className="text-accent hover:text-accent-hover text-sm font-medium"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/history"
          className="text-text-muted hover:text-text-secondary text-xs transition-colors inline-flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to History
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-text-primary mb-1.5">
              {content.topic}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={statusBadge[content.status] || "gray"}>
                {content.status}
              </Badge>
              {content.content_type && (
                <Badge variant="gray">{content.content_type}</Badge>
              )}
              {content.word_count && (
                <span className="text-xs text-text-muted mono">
                  {content.word_count.toLocaleString()} words
                </span>
              )}
            </div>
          </div>

          {content.status === "drafted" && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload("md")}
              >
                .md
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload("txt")}
              >
                .txt
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Panels */}
      <div className="space-y-6">
        <BriefPanel content={content} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {content.outline && <OutlinePanel outline={content.outline} />}
          <MetaPanel content={content} />
        </div>

        <DraftPanel
          content={content}
          onDraftGenerated={handleDraftGenerated}
        />
      </div>

      {/* Delete Section */}
      <div className="mt-12 pt-6 border-t border-border-default">
        {showDeleteConfirm ? (
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete this content? This cannot be undone.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                loadingText="Deleting..."
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete this content
          </Button>
        )}
      </div>
    </div>
  );
}
