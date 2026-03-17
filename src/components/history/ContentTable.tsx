"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface ContentRecord {
  id: string;
  topic: string;
  content_type: string | null;
  status: string;
  target_keyword: string | null;
  word_count: number | null;
  created_at: string;
}

interface ContentTableProps {
  content: ContentRecord[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const statusBadge: Record<string, "gray" | "blue" | "green"> = {
  brief: "gray",
  outlined: "blue",
  drafted: "green",
};

const typeBadge: Record<string, "gray" | "blue" | "orange" | "purple" | "emerald"> = {
  "Blog Post": "emerald",
  "How-To Guide": "blue",
  "Product Review": "orange",
  "Listicle": "purple",
  "Opinion Piece": "gray",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const PAGE_SIZE = 10;

export default function ContentTable({ content, isLoading, onDelete, hasActiveFilters, onClearFilters }: ContentTableProps) {
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const totalPages = Math.ceil(content.length / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, content.length);
  const pageRows = content.slice(startIdx, endIdx);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmId(null);
    if (pageRows.length === 1 && page > 1) setPage(page - 1);
  };

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border-default bg-bg-surface2/50">
                {["Topic", "Type", "Status", "Keyword", "Words", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-4 label">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-border-default">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-shimmer rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (content.length === 0 && !hasActiveFilters) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-xl p-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-bg-surface2 border border-border-default flex items-center justify-center">
          <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-text-secondary text-base font-medium mb-1.5">No content yet</p>
        <p className="text-text-muted text-sm mb-6">Generate your first piece of content to see it here</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-primary text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors">
          Start Creating →
        </Link>
      </div>
    );
  }

  if (content.length === 0 && hasActiveFilters) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-xl p-12 text-center">
        <p className="text-text-secondary text-base mb-2">No content matches your filters</p>
        <button onClick={onClearFilters} className="text-accent text-sm hover:text-accent-hover transition-colors cursor-pointer">
          Clear filters →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border-default bg-bg-surface2/50">
              <th className="text-left px-5 py-4 label w-[35%]">Topic</th>
              <th className="text-left px-5 py-4 label">Type</th>
              <th className="text-left px-5 py-4 label">Status</th>
              <th className="text-left px-5 py-4 label">Keyword</th>
              <th className="text-left px-5 py-4 label">Words</th>
              <th className="text-left px-5 py-4 label">Date</th>
              <th className="px-5 py-4 label w-24"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="border-b border-border-default hover:bg-bg-surface2/40 transition-colors duration-100 group">
                  <td className="px-5 py-4">
                    <Link href={`/content/${item.id}`}
                      className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1"
                      title={item.topic}>
                      {item.topic.length > 60 ? item.topic.slice(0, 60) + "…" : item.topic}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {item.content_type ? (
                      <Badge variant={typeBadge[item.content_type] || "gray"}>
                        {item.content_type === "How-To Guide" ? "How-To"
                          : item.content_type === "Product Review" ? "Review"
                          : item.content_type === "Opinion Piece" ? "Opinion"
                          : item.content_type}
                      </Badge>
                    ) : <span className="text-text-muted text-sm">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusBadge[item.status] || "gray"}>{item.status}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-text-muted mono" title={item.target_keyword || ""}>
                      {item.target_keyword
                        ? item.target_keyword.length > 32 ? item.target_keyword.slice(0, 32) + "…" : item.target_keyword
                        : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm mono text-text-secondary">
                      {item.word_count ? item.word_count.toLocaleString() : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-text-muted" title={fullDate(item.created_at)}>
                      {timeAgo(item.created_at)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/content/${item.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-default rounded-lg hover:border-border-hover hover:text-text-primary bg-bg-surface2 transition-all">
                        View
                      </Link>
                      <button onClick={() => setConfirmId(item.id)} disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer disabled:opacity-40" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                {confirmId === item.id && (
                  <tr className="bg-danger/5 border-b border-danger/20">
                    <td colSpan={7} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-text-secondary">
                          Delete <span className="font-medium text-text-primary">&quot;{item.topic.slice(0, 50)}{item.topic.length > 50 ? "…" : ""}&quot;</span>? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => setConfirmId(null)}
                            className="px-3 py-1.5 text-sm text-text-muted border border-border-default rounded-lg hover:border-border-hover transition-all cursor-pointer">
                            Cancel
                          </button>
                          <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}
                            className="px-3 py-1.5 text-sm font-medium text-danger border border-danger/30 rounded-lg bg-danger/10 hover:bg-danger/20 transition-all cursor-pointer disabled:opacity-50">
                            {deletingId === item.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border-default">
          <span className="text-sm text-text-muted">
            Showing {startIdx + 1}–{endIdx} of {content.length} pieces
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-muted hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              ← Previous
            </button>
            <span className="text-sm text-text-muted mono px-2">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-muted hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
