"use client";

import React from "react";

interface ContentRecord {
  id: string;
  status: string;
  created_at: string;
}

interface HistoryStatsProps {
  content: ContentRecord[];
  isLoading: boolean;
}

function isWithinLastNDays(dateStr: string, days: number): boolean {
  const now = new Date();
  const date = new Date(dateStr);
  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

export default function HistoryStats({ content, isLoading }: HistoryStatsProps) {
  const stats = [
    { label: "Total Pieces", value: content.length, color: "#f0f4f8" },
    { label: "Drafted", value: content.filter((c) => c.status === "drafted").length, color: "#10b981" },
    { label: "Outlined", value: content.filter((c) => c.status === "outlined").length, color: "#3b82f6" },
    { label: "This Week", value: content.filter((c) => isWithinLastNDays(c.created_at, 7)).length, color: "#f59e0b" },
  ];

  if (isLoading) {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "8px",
      }}>
        <style>{`@media (min-width: 768px) { .stats-grid-cf { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-shimmer" style={{
            background: "#0e1012",
            border: "1px solid #1d2327",
            borderRadius: "12px",
            height: "90px",
          }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`@media (min-width: 768px) { .stats-grid-cf { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
      <div className="stats-grid-cf" style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "8px",
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: "#0e1012",
            border: "1px solid #1d2327",
            borderRadius: "12px",
            padding: "20px 24px",
            transition: "border-color 0.2s",
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "28px",
              fontWeight: "700",
              color: stat.color,
              lineHeight: 1.1,
              marginBottom: "6px",
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#445566",
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
