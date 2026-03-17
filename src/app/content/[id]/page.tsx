"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BriefPanel from "@/components/generator/BriefPanel";
import OutlinePanel from "@/components/generator/OutlinePanel";
import MetaPanel from "@/components/generator/MetaPanel";
import DraftPanel from "@/components/generator/DraftPanel";
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
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/content/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) { setFetchError(true); return; }
        const data = await res.json();
        setContent(data);
      } catch {
        setFetchError(true);
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
    setDeleteError("");
    try {
      const res = await fetch("/api/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.push("/history");
      } else {
        setDeleteError("Failed to delete content. Please try again.");
      }
    } catch {
      setDeleteError("Failed to delete content. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (format: "md" | "txt") => {
    window.open(`/api/export?id=${id}&format=${format}`, "_blank");
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="animate-shimmer" style={{ height: "20px", width: "200px", borderRadius: "6px" }} />
          <div className="animate-shimmer" style={{ height: "32px", width: "100%", maxWidth: "500px", borderRadius: "6px" }} />
          <div className="animate-shimmer" style={{ height: "200px", borderRadius: "12px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="animate-shimmer" style={{ height: "300px", borderRadius: "12px" }} />
            <div className="animate-shimmer" style={{ height: "300px", borderRadius: "12px" }} />
          </div>
        </div>
      </div>
    );
  }

  // 404 — Custom not found UI
  if (notFound) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{
          background: "#0e1012",
          border: "1px solid #1d2327",
          borderRadius: "12px",
          padding: "60px 24px",
          textAlign: "center",
        }}>
          <div style={{
            width: "56px", height: "56px", margin: "0 auto 20px",
            borderRadius: "12px", background: "#161a1d", border: "1px solid #1d2327",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#445566" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#f0f4f8", margin: "0 0 8px" }}>
            Content not found
          </h1>
          <p style={{ fontSize: "14px", color: "#445566", marginBottom: "24px" }}>
            This piece of content doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/history" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontSize: "14px", color: "#10b981", textDecoration: "none",
            fontWeight: "500",
          }}>
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  // Generic fetch error
  if (fetchError || !content) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{
          background: "#0e1012",
          border: "1px solid #1d2327",
          borderRadius: "12px",
          padding: "60px 24px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "14px", color: "#8b9eb0", marginBottom: "16px" }}>
            Failed to load content. Please try again.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px", background: "#10b981", color: "#070809",
                border: "none", borderRadius: "8px", fontSize: "13px",
                fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Retry
            </button>
            <Link href="/history" style={{
              padding: "8px 16px", border: "1px solid #1d2327", borderRadius: "8px",
              fontSize: "13px", color: "#8b9eb0", textDecoration: "none",
            }}>
              ← Back to History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Back link */}
      <Link href="/history" style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        fontSize: "13px", color: "#445566", textDecoration: "none",
        marginBottom: "20px", transition: "color 0.15s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#8b9eb0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#445566")}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to History
      </Link>

      {/* Header — stacks on mobile */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "32px",
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontSize: "clamp(18px, 4vw, 22px)",
            fontWeight: "700",
            color: "#f0f4f8",
            margin: "0 0 10px",
            lineHeight: 1.3,
          }}>
            {content.topic}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <Badge variant={statusBadge[content.status] || "gray"}>{content.status}</Badge>
            {content.content_type && <Badge variant="gray">{content.content_type}</Badge>}
            {content.word_count && (
              <span style={{ fontSize: "12px", color: "#445566", fontFamily: "'JetBrains Mono', monospace" }}>
                {content.word_count.toLocaleString()} words
              </span>
            )}
          </div>
        </div>

        {/* Export buttons — stack on mobile via flex-wrap */}
        {content.status === "drafted" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => handleDownload("md")}
              style={{
                padding: "8px 14px", background: "#161a1d",
                border: "1px solid #1d2327", borderRadius: "8px",
                color: "#8b9eb0", fontSize: "13px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a3540"; e.currentTarget.style.color = "#f0f4f8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1d2327"; e.currentTarget.style.color = "#8b9eb0"; }}
            >
              Download .md
            </button>
            <button
              onClick={() => handleDownload("txt")}
              style={{
                padding: "8px 14px", background: "#161a1d",
                border: "1px solid #1d2327", borderRadius: "8px",
                color: "#8b9eb0", fontSize: "13px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a3540"; e.currentTarget.style.color = "#f0f4f8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1d2327"; e.currentTarget.style.color = "#8b9eb0"; }}
            >
              Download .txt
            </button>
          </div>
        )}
      </div>

      {/* Panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <BriefPanel content={content} />

        {/* Two-column: stacks on mobile via auto-fit */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: "24px",
        }}>
          {content.outline && <OutlinePanel outline={content.outline} />}
          <MetaPanel content={content} />
        </div>

        <DraftPanel content={content} onDraftGenerated={handleDraftGenerated} />
      </div>

      {/* Delete Section */}
      <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #1d2327" }}>
        {showDeleteConfirm ? (
          <div style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}>
            <p style={{ fontSize: "14px", color: "#8b9eb0", margin: 0 }}>
              Delete this content permanently? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                style={{
                  padding: "7px 14px", background: "transparent",
                  border: "1px solid #1d2327", borderRadius: "8px",
                  color: "#8b9eb0", fontSize: "13px", cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "7px 14px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px",
                  color: "#ef4444", fontSize: "13px",
                  fontWeight: "500", cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
            {deleteError && (
              <p style={{ fontSize: "12px", color: "#ef4444", width: "100%", margin: 0 }}>{deleteError}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: "7px 14px", background: "transparent",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", color: "#ef4444",
              fontSize: "13px", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
          >
            Delete this content
          </button>
        )}
      </div>
    </div>
  );
}
