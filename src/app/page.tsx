"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TopicInput from "@/components/generator/TopicInput";
import GeneratorResults from "@/components/generator/GeneratorResults";
import Badge from "@/components/ui/Badge";
import {
  getStoredRemaining,
  setStoredRemaining,
  isAdminMode,
  getAdminKey,
  setAdminKey,
  clearAdminKey,
  getSessionId,
  MAX_GENERATIONS,
} from "@/lib/session";

interface ContentRecord {
  id: string;
  topic: string;
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

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentRecord | null>(null);
  const [recentContent, setRecentContent] = useState<ContentRecord[]>([]);
  const [recentLoaded, setRecentLoaded] = useState(false);

  // Admin state
  const [remaining, setRemaining] = useState(MAX_GENERATIONS);
  const [admin, setAdmin] = useState(false);
  const [exhaustedTest, setExhaustedTest] = useState(false);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Init from localStorage
  useEffect(() => {
    setRemaining(isAdminMode() ? 999 : getStoredRemaining());
    setAdmin(isAdminMode());
  }, []);

  useEffect(() => {
    if (recentLoaded) return;
    let cancelled = false;
    async function loadRecent() {
      try {
        const res = await fetch("/api/content");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setRecentContent(data.slice(0, 3));
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setRecentLoaded(true); }
    }
    loadRecent();
    return () => { cancelled = true; };
  }, [recentLoaded]);

  const handleResult = (data: Record<string, unknown>) => {
    setCurrentContent(data as unknown as ContentRecord);
    setRecentLoaded(false);
  };

  const handleDraftGenerated = (updated: Record<string, unknown>) => {
    setCurrentContent(updated as unknown as ContentRecord);
    setRecentLoaded(false);
  };

  const handleRemaining = (n: number) => {
    setRemaining(exhaustedTest ? n : (admin ? 999 : n));
  };

  const verifyAdmin = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setAdminKey(adminCode);
        setAdmin(true);
        setRemaining(999);
        setShowAdminInput(false);
        setAdminCode("");
        setAdminError("");
      } else {
        setAdminError("Invalid code");
      }
    } catch {
      setAdminError("Verification failed");
    } finally {
      setAdminLoading(false);
    }
  };

  const exhaustSession = async (action: "exhaust" | "reset" = "exhaust") => {
    const sid = getSessionId();
    const res = await fetch("/api/admin/exhaust-session", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": getAdminKey() },
      body: JSON.stringify({ session_id: sid, action }),
    });
    if (res.ok) {
      if (action === "exhaust") {
        setExhaustedTest(true);
        setRemaining(0);
        setStoredRemaining(0);
      } else {
        setExhaustedTest(false);
        setRemaining(999);
      }
    }
  };

  const limitReached = !admin && remaining <= 0;

  return (
    <>
    <div style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "clamp(40px, 7vw, 64px) 20px 32px",
        maxWidth: "640px",
        margin: "0 auto",
        width: "100%",
      }}>
        <h1 style={{
          fontSize: "clamp(26px, 6vw, 40px)",
          fontWeight: "800",
          lineHeight: 1.15,
          color: "#f0f4f8",
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}>
          AI-Powered SEO Content Generator
        </h1>
        <p style={{ fontSize: "clamp(14px, 3vw, 16px)", color: "#8b9eb0", lineHeight: 1.7, margin: "0 0 10px" }}>
          Enter a topic to get a complete SEO brief, outline, meta tags, and full draft.
        </p>

        {/* Badges row */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px" }}>
          <span style={{
            fontSize: "11px", color: "#445566",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 10px",
            background: "#0e1012",
            border: "1px solid #1d2327",
            borderRadius: "20px",
          }}>
            claude-haiku-4-5
          </span>

          {/* Remaining / status badge */}
          <span style={{
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 10px",
            borderRadius: "20px",
            background: limitReached ? "rgba(239,68,68,0.08)" : exhaustedTest ? "rgba(245,158,11,0.08)" : "#0e1012",
            border: `1px solid ${limitReached ? "rgba(239,68,68,0.3)" : exhaustedTest ? "rgba(245,158,11,0.3)" : admin ? "rgba(16,185,129,0.3)" : "#1d2327"}`,
            color: limitReached ? "#ef4444" : exhaustedTest ? "#f59e0b" : admin ? "#10b981" : "#445566",
          }}>
            {exhaustedTest ? "🔒 Check Block ON" : admin ? "∞ Unlimited" : limitReached ? "❌ Limit reached" : `${remaining}/${MAX_GENERATIONS} remaining`}
          </span>
        </div>
      </div>

      {/* Form — blocked state */}
      <div style={{ maxWidth: "720px", margin: "0 auto", width: "100%", padding: "0 16px" }}>
        {limitReached ? (
          <div style={{
            textAlign: "center",
            padding: "40px 24px",
            background: "#0e1012",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#f0f4f8", marginBottom: "8px" }}>
              Demo limit reached
            </div>
            <div style={{ fontSize: "14px", color: "#8b9eb0", lineHeight: 1.7 }}>
              You&apos;ve used all {MAX_GENERATIONS} free generations in this demo session.<br />
              Want unlimited access?{" "}
              <span style={{ color: "#10b981", fontWeight: "500" }}>Contact Abrar Tajwar Khan</span> for a custom build.
            </div>
          </div>
        ) : (
          <TopicInput
            onResult={handleResult}
            onRemaining={handleRemaining}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            exhaustedTest={exhaustedTest}
          />
        )}
      </div>

      {/* Results */}
      {currentContent && (
        <div style={{ maxWidth: "1200px", margin: "40px auto 0", width: "100%", padding: "0 20px" }}>
          <GeneratorResults content={currentContent} onDraftGenerated={handleDraftGenerated} />
        </div>
      )}

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <div style={{ maxWidth: "720px", margin: "48px auto 0", width: "100%", padding: "0 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#445566", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              Recent Content
            </h2>
            <Link href="/history" style={{ fontSize: "12px", color: "#10b981", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentContent.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "#0e1012",
                  border: "1px solid #1d2327",
                  borderRadius: "10px",
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                  gap: "12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a3540")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1d2327")}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#f0f4f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.topic.length > 70 ? item.topic.slice(0, 70) + "…" : item.topic}
                  </div>
                  <div style={{ fontSize: "12px", color: "#445566", marginTop: "3px" }}>
                    {item.status}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <Badge variant={statusBadge[item.status] || "gray"}>{item.status}</Badge>
                  <span style={{ fontSize: "12px", color: "#445566" }}>{timeAgo(item.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <footer style={{
      marginTop: "auto",
      padding: "24px 16px",
      textAlign: "center",
      borderTop: "1px solid #1d2327",
      fontSize: "12px",
      color: "#445566",
    }}>
      <div>Built by <span style={{ color: "#8b9eb0", fontWeight: "500" }}>Abrar Tajwar Khan</span></div>
      <div style={{ marginTop: "8px" }}>
        {admin ? (
          <>
            <button
              onClick={() => { clearAdminKey(); setAdmin(false); setExhaustedTest(false); setRemaining(getStoredRemaining()); }}
              style={{ background: "none", border: "none", color: "#10b981", fontSize: "10px", cursor: "pointer", padding: "2px 6px" }}
            >
              ✓ Admin active — disable
            </button>
            <span style={{ color: "#1d2327", fontSize: "10px", margin: "0 6px" }}>|</span>
            <button
              onClick={() => exhaustedTest ? exhaustSession("reset") : undefined}
              style={{ background: "none", border: "none", fontSize: "10px", cursor: exhaustedTest ? "pointer" : "default", fontWeight: exhaustedTest ? 400 : 700, color: exhaustedTest ? "#445566" : "#10b981", textDecoration: exhaustedTest ? "none" : "underline", padding: "2px 4px" }}
            >
              🔓 Unlimited Testing
            </button>
            <span style={{ color: "#1d2327", fontSize: "10px", margin: "0 4px" }}>/</span>
            <button
              onClick={() => !exhaustedTest ? exhaustSession("exhaust") : undefined}
              style={{ background: "none", border: "none", fontSize: "10px", cursor: !exhaustedTest ? "pointer" : "default", fontWeight: !exhaustedTest ? 400 : 700, color: !exhaustedTest ? "#445566" : "#f59e0b", textDecoration: !exhaustedTest ? "none" : "underline", padding: "2px 4px" }}
            >
              🔒 Check Block
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAdminInput(true)}
            style={{ background: "none", border: "none", color: "#1d2327", fontSize: "10px", cursor: "pointer", padding: "2px 6px" }}
          >
            Admin
          </button>
        )}
      </div>
    </footer>

    {/* Admin modal */}
    {showAdminInput && (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px",
        }}
        onClick={() => { setShowAdminInput(false); setAdminError(""); setAdminCode(""); }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#0e1012", border: "1px solid #1d2327",
            borderRadius: "14px", padding: "24px", maxWidth: "380px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#f0f4f8", marginBottom: "6px" }}>
            Are you the developer?
          </div>
          <div style={{ fontSize: "12px", color: "#445566", marginBottom: "16px" }}>
            Enter the secret code for unlimited testing
          </div>
          <input
            type="password"
            value={adminCode}
            onChange={(e) => { setAdminCode(e.target.value); setAdminError(""); }}
            onKeyDown={(e) => e.key === "Enter" && verifyAdmin()}
            placeholder="Secret code"
            autoFocus
            style={{
              width: "100%", padding: "10px 14px",
              background: "#161a1d", border: `1px solid ${adminError ? "#ef4444" : "#1d2327"}`,
              borderRadius: "8px", color: "#f0f4f8", fontSize: "14px",
              outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          {adminError && (
            <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{adminError}</div>
          )}
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button
              onClick={() => { setShowAdminInput(false); setAdminError(""); setAdminCode(""); }}
              style={{
                flex: 1, padding: "9px", background: "none",
                border: "1px solid #1d2327", borderRadius: "8px",
                color: "#445566", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              onClick={verifyAdmin}
              disabled={adminLoading}
              style={{
                flex: 1, padding: "9px",
                background: adminLoading ? "#059669" : "#10b981",
                border: "none", borderRadius: "8px",
                color: "#070809", fontSize: "13px", fontWeight: "600",
                cursor: adminLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              {adminLoading ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
