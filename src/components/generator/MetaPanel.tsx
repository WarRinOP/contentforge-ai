"use client";

import React from "react";
import Card from "@/components/ui/Card";
import CopyButton from "@/components/ui/CopyButton";

interface ContentRecord {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
}

interface MetaPanelProps {
  content: ContentRecord;
}

interface MetaFieldConfig {
  label: string;
  value: string | null;
  optimalMin: number;
  optimalMax: number;
  warnMin: number;
  warnMax: number;
}

function getCharCountColor(
  length: number,
  optimalMin: number,
  optimalMax: number,
  warnMin: number,
  warnMax: number
): string {
  if (length >= optimalMin && length <= optimalMax) return "text-success";
  if (
    (length >= warnMin && length < optimalMin) ||
    (length > optimalMax && length <= warnMax)
  )
    return "text-warning";
  return "text-danger";
}

export default function MetaPanel({ content }: MetaPanelProps) {
  const fields: MetaFieldConfig[] = [
    {
      label: "Meta Title",
      value: content.meta_title,
      optimalMin: 50,
      optimalMax: 60,
      warnMin: 45,
      warnMax: 70,
    },
    {
      label: "Meta Description",
      value: content.meta_description,
      optimalMin: 150,
      optimalMax: 160,
      warnMin: 140,
      warnMax: 170,
    },
    {
      label: "OG Title",
      value: content.og_title,
      optimalMin: 40,
      optimalMax: 60,
      warnMin: 30,
      warnMax: 70,
    },
    {
      label: "OG Description",
      value: content.og_description,
      optimalMin: 100,
      optimalMax: 200,
      warnMin: 80,
      warnMax: 220,
    },
  ];

  return (
    <Card title="Meta Tags">
      <div className="space-y-4">
        {fields.map((field) => {
          const len = field.value?.length || 0;
          const colorClass = field.value
            ? getCharCountColor(
                len,
                field.optimalMin,
                field.optimalMax,
                field.warnMin,
                field.warnMax
              )
            : "text-text-muted";

          return (
            <div key={field.label}>
              <span className="label block mb-1.5">{field.label}</span>
              <div className="bg-bg-surface2 border border-border-default rounded-lg px-3 py-2.5">
                <p className="text-sm mono text-text-primary leading-relaxed break-words">
                  {field.value || "—"}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-xs mono ${colorClass}`}>
                  {len} / {field.optimalMin}-{field.optimalMax} chars
                </span>
                {field.value && (
                  <CopyButton
                    textToCopy={field.value}
                    label={field.label}
                    size="sm"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
