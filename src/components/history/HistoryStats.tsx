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
    { label: "Total Pieces", value: content.length, color: "text-text-primary" },
    { label: "Drafted", value: content.filter((c) => c.status === "drafted").length, color: "text-success" },
    { label: "Outlined", value: content.filter((c) => c.status === "outlined").length, color: "text-info" },
    { label: "This Week", value: content.filter((c) => isWithinLastNDays(c.created_at, 7)).length, color: "text-warning" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-bg-surface border border-border-default rounded-xl p-5 h-24 animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className={`metric-value mb-1 ${stat.color}`}>{stat.value}</div>
          <div className="label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
