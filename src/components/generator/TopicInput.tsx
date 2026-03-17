"use client";

import React, { useState } from "react";
import {
  getSessionId,
  getAdminKey,
  setStoredRemaining,
  MAX_GENERATIONS,
} from "@/lib/session";

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
  onRemaining?: (n: number) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  exhaustedTest?: boolean;
}

export default function TopicInput({
  onResult,
  onRemaining,
  isGenerating,
  setIsGenerating,
  exhaustedTest,
}: TopicInputProps) {
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
    if (!topic.trim()) { setError("Topic is required."); return; }
    setError("");
    setIsGenerating(true);
    try {
      const sessionId = getSessionId();
      const adminKey = getAdminKey();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      // Check Block mode: deliberately omit admin key so real rate limit fires
      if (adminKey && !exhaustedTest) headers["x-admin-key"] = adminKey;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: topic.trim(),
          targetAudience: targetAudience.trim() || "general audience",
          contentType,
          tone,
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.error || `You've used all ${MAX_GENERATIONS} free generations.`);
        onRemaining?.(0);
        setStoredRemaining(0);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const remaining = typeof data.remaining === "number" ? data.remaining : MAX_GENERATIONS;
      onRemaining?.(remaining);
      setStoredRemaining(remaining);
      onResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#445566",
    display: "block",
    marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    background: "#161a1d",
    border: "1px solid #1d2327",
    borderRadius: "8px",
    color: "#f0f4f8",
    fontSize: "14px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      background: "#0e1012",
      border: "1px solid #1d2327",
      borderRadius: "12px",
      padding: "24px",
      transition: "border-color 0.2s",
    }}>
      {/* Topic */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Topic *</label>
        <div style={{ position: "relative" }}>
          <textarea
            value={topic}
            onChange={(e) => { setTopic(e.target.value); if (error) setError(""); }}
            placeholder="Enter your content topic... e.g. 'best CRM software for small business 2026'"
            rows={3}
            disabled={isGenerating}
            style={{ ...inputStyle, resize: "none", paddingRight: "44px" }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e) => (e.target.style.borderColor = "#1d2327")}
          />
          <span style={{
            position: "absolute",
            bottom: "10px",
            right: "14px",
            fontSize: "11px",
            color: "#445566",
            fontFamily: "'JetBrains Mono', monospace",
          }}>{topic.length}</span>
        </div>
      </div>

      {/* Target Audience */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>
          Target Audience{" "}
          <span style={{ textTransform: "none", fontWeight: "400", color: "#445566" }}>(optional)</span>
        </label>
        <input
          type="text"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="e.g. small business owners, marketing managers"
          disabled={isGenerating}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#10b981")}
          onBlur={(e) => (e.target.style.borderColor = "#1d2327")}
        />
      </div>

      {/* Content Type */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Content Type</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {CONTENT_TYPES.map((ct) => {
            const active = contentType === ct.value;
            return (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                disabled={isGenerating}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${active ? "#10b981" : "#1d2327"}`,
                  background: active ? "rgba(16,185,129,0.1)" : "#161a1d",
                  color: active ? "#10b981" : "#8b9eb0",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { if (!active && !isGenerating) { e.currentTarget.style.borderColor = "#2a3540"; e.currentTarget.style.color = "#f0f4f8"; }}}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1d2327"; e.currentTarget.style.color = "#8b9eb0"; }}}
              >
                <span>{ct.icon}</span>
                <span>{ct.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone */}
      <div style={{ marginBottom: "24px" }}>
        <label style={labelStyle}>Tone</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {TONES.map((t) => {
            const active = tone === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                disabled={isGenerating}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${active ? "#10b981" : "#1d2327"}`,
                  background: active ? "rgba(16,185,129,0.1)" : "#161a1d",
                  color: active ? "#10b981" : "#8b9eb0",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { if (!active && !isGenerating) { e.currentTarget.style.borderColor = "#2a3540"; e.currentTarget.style.color = "#f0f4f8"; }}}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1d2327"; e.currentTarget.style.color = "#8b9eb0"; }}}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isGenerating}
        style={{
          width: "100%",
          padding: "12px 24px",
          background: isGenerating ? "#059669" : "#10b981",
          color: "#070809",
          fontSize: "15px",
          fontWeight: "600",
          borderRadius: "8px",
          border: "none",
          cursor: isGenerating ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: isGenerating ? 0.85 : 1,
        }}
        onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.background = "#059669"; }}
        onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.background = "#10b981"; }}
      >
        {isGenerating ? (
          <>
            <span style={{
              width: "14px", height: "14px",
              border: "2px solid rgba(7,8,9,0.3)",
              borderTop: "2px solid #070809",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              display: "inline-block",
              flexShrink: 0,
            }} />
            Generating with Claude...
          </>
        ) : (
          "Generate SEO Brief →"
        )}
      </button>

      {/* Error */}
      {error && (
        <div style={{ marginTop: "12px", fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
          ⚠ {error}
        </div>
      )}

      {/* Sample */}
      {!isGenerating && (
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <button
            onClick={fillSample}
            style={{
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "#445566",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#445566")}
          >
            Try a sample topic →
          </button>
        </div>
      )}
    </div>
  );
}
