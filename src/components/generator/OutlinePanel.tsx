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
    if (item.level === "h1") {
      lines.push(`# ${item.heading}`);
    } else if (item.level === "h2") {
      lines.push(`## ${item.heading}`);
    } else if (item.level === "h3") {
      lines.push(`### ${item.heading}`);
    }
    if (item.points && item.points.length > 0) {
      for (const point of item.points) {
        lines.push(`- ${point}`);
      }
    }
  }
  return lines.join("\n");
}

export default function OutlinePanel({ outline }: OutlinePanelProps) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCollapse = (index: number) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Group items: H2s own their H3s and points
  const plainText = outlineToText(outline);

  return (
    <Card
      title="Article Outline"
      headerAction={
        <CopyButton textToCopy={plainText} label="Copy outline" />
      }
    >
      <div className="space-y-1">
        {outline.map((item, index) => {
          const isH1 = item.level === "h1";
          const isH2 = item.level === "h2";
          const isH3 = item.level === "h3";
          const isCollapsed = collapsed[index];

          // Find the parent H2 for H3 items to check if parent is collapsed
          if (isH3) {
            // Find previous H2
            let parentH2Index = -1;
            for (let i = index - 1; i >= 0; i--) {
              if (outline[i].level === "h2") {
                parentH2Index = i;
                break;
              }
            }
            if (parentH2Index >= 0 && collapsed[parentH2Index]) {
              return null; // Hide if parent H2 is collapsed
            }
          }

          return (
            <div key={index}>
              {/* Heading */}
              <div
                className={`flex items-start gap-2 ${
                  isH1
                    ? "border-l-2 border-accent pl-3 py-2"
                    : isH2
                    ? "border-l-2 border-accent-dim pl-3 py-1.5 ml-2"
                    : "border-l border-border-default pl-3 py-1 ml-6"
                }`}
              >
                {isH2 && (
                  <button
                    onClick={() => toggleCollapse(index)}
                    className="mt-0.5 shrink-0 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isCollapsed ? "" : "rotate-90"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                )}
                <span
                  className={`${
                    isH1
                      ? "text-base font-semibold text-text-primary"
                      : isH2
                      ? "text-sm font-medium text-text-primary"
                      : "text-sm text-text-secondary"
                  }`}
                >
                  {item.heading}
                </span>
              </div>

              {/* Points */}
              {!isCollapsed &&
                item.points &&
                item.points.length > 0 && (
                  <ul
                    className={`space-y-0.5 mt-0.5 mb-1 ${
                      isH1
                        ? "ml-5"
                        : isH2
                        ? "ml-10"
                        : "ml-12"
                    }`}
                  >
                    {item.points.map((point, pi) => (
                      <li
                        key={pi}
                        className="text-[13px] text-text-muted leading-relaxed flex items-start gap-1.5"
                      >
                        <span className="text-border-hover mt-1 shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
