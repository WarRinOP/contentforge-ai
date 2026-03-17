import { NextRequest, NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/claude";
import { getSupabaseAdmin } from "@/lib/supabase";

const MAX_GENERATIONS = 3;
const MAX_IP_GENERATIONS = 10; // across all sessions from same IP

const SYSTEM_PROMPT = `You are an expert SEO strategist and content director. Generate comprehensive SEO briefs and content outlines that rank on Google. Always respond with a single valid JSON object. No markdown. No backticks. No explanation.`;

function buildUserPrompt(
  topic: string,
  targetAudience: string,
  contentType: string,
  tone: string
): string {
  return `Generate a complete SEO content brief for this topic:
Topic: ${topic}
Target audience: ${targetAudience}
Content type: ${contentType}
Tone: ${tone}

Return ONLY this JSON:
{
  "target_keyword": "<primary keyword to rank for, naturally included in topic>",
  "secondary_keywords": [
    "<related keyword 1>",
    "<related keyword 2>",
    "<related keyword 3>",
    "<related keyword 4>",
    "<related keyword 5>",
    "<related keyword 6>",
    "<related keyword 7>",
    "<related keyword 8>"
  ],
  "search_intent": "<informational | commercial | transactional | navigational>",
  "recommended_word_count": <integer between 800-3000 based on topic complexity and content type>,
  "outline": [
    {
      "level": "h1",
      "heading": "<compelling H1 title containing target keyword>",
      "points": []
    },
    {
      "level": "h2",
      "heading": "<section heading>",
      "points": [
        "<talking point 1>",
        "<talking point 2>",
        "<talking point 3>"
      ]
    }
  ],
  "meta_title": "<SEO title tag, 50-60 chars, includes keyword>",
  "meta_description": "<meta description, 150-160 chars, compelling + keyword>",
  "og_title": "<Open Graph title, can be slightly different from meta title, more engaging>",
  "og_description": "<OG description, 2 sentences, social-share optimized>"
}

Requirements for the outline:
- 5-7 H2 sections total
- Each H2 has 2-4 talking points
- Include 1-2 H3 subsections under relevant H2s

Topic: ${topic}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, targetAudience, contentType, tone, session_id } = body;

    // ── Admin bypass ────────────────────────────────────
    const adminKey = request.headers.get("x-admin-key") || "";
    const isAdmin = adminKey && adminKey === process.env.ADMIN_SECRET;

    // Simulate block (Check Block mode) — fires BEFORE admin bypass
    if (
      request.headers.get("x-simulate-block") === "true" &&
      adminKey === process.env.ADMIN_SECRET
    ) {
      return NextResponse.json(
        {
          error: `You've used all ${MAX_GENERATIONS} free generations. This is a portfolio demo — reach out for unlimited access!`,
          code: "RATE_LIMIT",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // ── Rate limiting (skipped for admin) ───────────────
    const supabase = getSupabaseAdmin();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!isAdmin) {
      // Session check
      if (session_id) {
        const { data: session } = await supabase
          .from("cf_sessions")
          .select("usage_count")
          .eq("session_id", session_id)
          .single();

        if (session && session.usage_count >= MAX_GENERATIONS) {
          return NextResponse.json(
            {
              error: `You've used all ${MAX_GENERATIONS} free generations. This is a portfolio demo — reach out for unlimited access!`,
              code: "RATE_LIMIT",
              remaining: 0,
            },
            { status: 429 }
          );
        }
      }

      // IP check
      if (ip !== "unknown") {
        const { data: ipSessions } = await supabase
          .from("cf_sessions")
          .select("usage_count")
          .eq("ip", ip);

        const ipTotal = (ipSessions || []).reduce(
          (sum, s) => sum + (s.usage_count || 0),
          0
        );
        if (ipTotal >= MAX_IP_GENERATIONS) {
          return NextResponse.json(
            {
              error: `Generation limit reached for this network.`,
              code: "RATE_LIMIT",
              remaining: 0,
            },
            { status: 429 }
          );
        }
      }
    }

    // Validate topic
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic is required and cannot be empty" },
        { status: 400 }
      );
    }

    const audience = targetAudience || "general audience";
    const type = contentType || "Blog Post";
    const writingTone = tone || "Professional";

    // Call Claude
    let claudeResponse: string;
    try {
      claudeResponse = await generateWithClaude(
        SYSTEM_PROMPT,
        buildUserPrompt(topic.trim(), audience, type, writingTone)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Claude API error: ${message}` },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsed;
    try {
      let cleaned = claudeResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse Claude response" },
        { status: 500 }
      );
    }

    // Save to Supabase
    const { data, error: dbError } = await supabase
      .from("cf_content")
      .insert({
        topic: topic.trim(),
        target_audience: audience,
        content_type: type,
        tone: writingTone,
        target_keyword: parsed.target_keyword,
        secondary_keywords: parsed.secondary_keywords,
        search_intent: parsed.search_intent,
        recommended_word_count: parsed.recommended_word_count,
        outline: parsed.outline,
        meta_title: parsed.meta_title,
        meta_description: parsed.meta_description,
        og_title: parsed.og_title,
        og_description: parsed.og_description,
        status: "outlined",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // ── Update session usage count (skip for admin) ─────
    if (!isAdmin && session_id) {
      try {
        await supabase.rpc("increment_cf_usage", { sid: session_id, new_ip: ip });
      } catch {
        // RPC not available — manual upsert fallback
        const { data: existing } = await supabase
          .from("cf_sessions")
          .select("usage_count")
          .eq("session_id", session_id)
          .single();
        await supabase.from("cf_sessions").upsert(
          {
            session_id,
            usage_count: (existing?.usage_count ?? 0) + 1,
            ip,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "session_id" }
        );
      }
    }


    // Calculate remaining
    let remaining = MAX_GENERATIONS;
    if (!isAdmin && session_id) {
      const { data: updatedSession } = await supabase
        .from("cf_sessions")
        .select("usage_count")
        .eq("session_id", session_id)
        .single();
      remaining = Math.max(
        0,
        MAX_GENERATIONS - (updatedSession?.usage_count ?? 0)
      );
    } else if (isAdmin) {
      remaining = 999;
    }

    return NextResponse.json({ ...data, remaining }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
