"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

const CONTENT_TYPES = [
  { value: "Blog Post", icon: "📝", label: "Blog Post" },
  { value: "How-To Guide", icon: "📋", label: "How-To Guide" },
  { value: "Product Review", icon: "⭐", label: "Product Review" },
  { value: "Listicle", icon: "📊", label: "Listicle" },
  { value: "Opinion Piece", icon: "💬", label: "Opinion Piece" },
];

const TONES = [
  { value: "Professional", label: "Professional" },
  { value: "Conversational", label: "Conversational" },
  { value: "Authoritative", label: "Authoritative" },
  { value: "Friendly", label: "Friendly" },
];

interface TopicInputProps {
  onResult: (data: Record<string, unknown>) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

export default function TopicInput({ onResult, isGenerating, setIsGenerating }: TopicInputProps) {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentType, setContentType] = useState("Blog Post");
  const [tone, setTone] = useState("Professional");
  const [error, setError] = useState("");

  const fillSample = () => {
    setTopic("best project management tools for remote teams 2026");
    setTargetAudience("remote team managers");
    setContentType("Blog Post");
    setTone("Professional");
    setError("");
  };

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError("Topic is required.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          targetAudience: targetAudience.trim() || "general audience",
          contentType,
          tone,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="form-container">
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6">
        {/* Topic */}
        <div className="mb-5">
          <label className="label mb-2 block">Topic *</label>
          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => { setTopic(e.target.value); if (error) setError(""); }}
              placeholder="Enter your content topic... e.g. 'best CRM software for small business 2026'"
              rows={3}
              className="w-full bg-bg-surface2 border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
              disabled={isGenerating}
            />
            <span className="absolute bottom-3 right-4 text-xs text-text-muted mono">{topic.length}</span>
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-5">
          <label className="label mb-2 block">
            Target Audience <span className="text-text-muted normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. small business owners, marketing managers"
            className="w-full bg-bg-surface2 border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
            disabled={isGenerating}
          />
        </div>

        {/* Content Type */}
        <div className="mb-5">
          <label className="label mb-2 block">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  contentType === ct.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-default bg-bg-surface2 text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                <span>{ct.icon}</span>
                <span>{ct.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-6">
          <label className="label mb-2 block">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  tone === t.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-default bg-bg-surface2 text-text-secondary hover:border-border-hover hover:text-text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button variant="primary" size="lg" fullWidth loading={isGenerating} loadingText="Generating with Claude..." onClick={handleSubmit}>
          Generate SEO Brief →
        </Button>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-danger flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </p>
        )}

        {/* Sample Topic */}
        {!isGenerating && (
          <div className="mt-3 text-center">
            <button onClick={fillSample} className="text-sm text-text-muted hover:text-accent transition-colors cursor-pointer">
              Try a sample topic →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
