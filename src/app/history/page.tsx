"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import HistoryStats from "@/components/history/HistoryStats";
import FilterBar from "@/components/history/FilterBar";
import ContentTable from "@/components/history/ContentTable";

interface ContentRecord {
  id: string;
  topic: string;
  content_type: string | null;
  status: string;
  target_keyword: string | null;
  word_count: number | null;
  created_at: string;
}

function isWithinLastNDays(dateStr: string, days: number): boolean {
  const now = new Date();
  const date = new Date(dateStr);
  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

export default function HistoryPage() {
  const [allContent, setAllContent] = useState<ContentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [contentType, setContentType] = useState("");
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setAllContent(data);
      } catch {
        toast.error("Failed to load content history");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const filteredContent = useMemo(() => {
    return allContent.filter((item) => {
      if (search && !item.topic.toLowerCase().includes(search.toLowerCase())) return false;
      if (status && item.status !== status) return false;
      if (contentType && item.content_type !== contentType) return false;
      if (period === "week" && !isWithinLastNDays(item.created_at, 7)) return false;
      if (period === "month" && !isWithinLastNDays(item.created_at, 30)) return false;
      return true;
    });
  }, [allContent, search, status, contentType, period]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setContentType("");
    setPeriod("all");
  }, []);

  const hasActiveFilters = !!(search || status || contentType || period !== "all");

  const handleDelete = useCallback(async (id: string) => {
    const previous = allContent;
    setAllContent((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch("/api/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Content deleted");
    } catch {
      setAllContent(previous);
      toast.error("Failed to delete — please try again");
    }
  }, [allContent]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1.5">
            Content History
          </h1>
          <p className="text-text-secondary text-base">
            All your generated content pieces
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-primary text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors shrink-0"
        >
          + New Content
        </Link>
      </div>

      {/* Stats */}
      <HistoryStats content={allContent} isLoading={isLoading} />

      {/* Filters */}
      <FilterBar
        search={search} status={status} contentType={contentType} period={period}
        totalCount={allContent.length} filteredCount={filteredContent.length}
        onSearchChange={setSearch} onStatusChange={setStatus}
        onContentTypeChange={setContentType} onPeriodChange={setPeriod}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <ContentTable
        content={filteredContent} isLoading={isLoading}
        onDelete={handleDelete} hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
