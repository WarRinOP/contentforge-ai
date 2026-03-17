"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import CopyButton from "@/components/ui/CopyButton";

interface OutlineItem {
  level: string;
  heading: string;
  points: string[];
}

interface OutlinePanelProps {
  outline: OutlineItem[];
}

function outlineToText(outline: OutlineItem[]): string {
  const lines: string[] = [];
  for (const item of outline) {
    if (item.level === "h1") lines.push(`# ${item.heading}`);
    else if (item.level === "h2") lines.push(`## ${item.heading}`);
    else if (item.level === "h3") lines.push(`### ${item.heading}`);
    if (item.points && item.points.length > 0) {
      for (const point of item.points) lines.push(`- ${point}`);
    }
  }
  return lines.join("\n");
}

export default function OutlinePanel({ outline }: OutlinePanelProps) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCollapse = (index: number) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const plainText = outlineToText(outline);

  const isParentCollapsed = (index: number): boolean => {
    for (let i = index - 1; i >= 0; i--) {
      if (outline[i].level === "h2") return !!collapsed[i];
      if (outline[i].level === "h1") return false;
    }
    return false;
  };

  return (
    <Card
      title="Article Outline"
      headerAction={<CopyButton textToCopy={plainText} label="Copy outline" />}
    >
      <div className="space-y-0 overflow-hidden">
        {outline.map((item, index) => {
          const isH1 = item.level === "h1";
          const isH2 = item.level === "h2";
          const isH3 = item.level === "h3";
          const isCollapsed = collapsed[index];

          if (isH3 && isParentCollapsed(index)) return null;

          const showPoints = !isCollapsed && item.points && item.points.length > 0;

          return (
            <div key={index} className={isH1 ? "mb-1" : ""}>
              <div
                className={`flex items-start gap-1.5 rounded-sm ${
                  isH1 ? "py-1.5 pl-2.5 border-l-[3px] border-accent" : ""
                } ${
                  isH2 ? "py-1 pl-4 border-l-2 border-accent/30 cursor-pointer hover:bg-bg-surface2/50" : ""
                } ${
                  isH3 ? "py-0.5 pl-7 border-l border-border-default" : ""
                }`}
                onClick={isH2 ? () => toggleCollapse(index) : undefined}
              >
                {isH2 && (
                  <svg
                    className={`w-3 h-3 text-text-muted shrink-0 mt-[3px] transition-transform duration-200 ${
                      isCollapsed ? "" : "rotate-90"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
                <span
                  className={`break-words min-w-0 ${
                    isH1 ? "text-[13px] font-semibold text-text-primary" : ""
                  } ${
                    isH2 ? "text-[12px] font-medium text-text-primary" : ""
                  } ${
                    isH3 ? "text-[12px] text-text-secondary" : ""
                  }`}
                >
                  {item.heading}
                </span>
              </div>

              {showPoints && (
                <div className={`${isH1 ? "pl-5" : isH2 ? "pl-9" : "pl-10"} pb-0.5`}>
                  {item.points.map((point, pi) => (
                    <div key={pi} className="flex items-start gap-1 py-[1px]">
                      <span className="text-border-hover mt-[4px] text-[6px] shrink-0">●</span>
                      <span className="text-[11px] leading-relaxed text-text-muted break-words min-w-0">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
