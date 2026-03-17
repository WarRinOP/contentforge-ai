import { NextRequest, NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/claude";
import { getSupabaseAdmin } from "@/lib/supabase";

interface OutlineItem {
  level: string;
  heading: string;
  points: string[];
}

const DRAFT_SYSTEM_PROMPT = `You are an expert SEO content writer. Write high-quality, engaging articles that are optimized for search engines. Write the article directly in markdown format. Do not wrap in JSON. Do not add code fences. Just write the article.`;

function formatOutline(outline: OutlineItem[]): string {
  const lines: string[] = [];
  for (const item of outline) {
    const prefix = item.level.toUpperCase();
    lines.push(`${prefix}: ${item.heading}`);
    if (item.points && item.points.length > 0) {
      for (const point of item.points) {
        lines.push(`  - ${point}`);
      }
    }
  }
  return lines.join("\n");
}

function buildDraftPrompt(record: {
  content_type: string;
  tone: string;
  target_audience: string | null;
  target_keyword: string;
  secondary_keywords: string[];
  recommended_word_count: number;
  outline: OutlineItem[];
}): string {
  const outlineFormatted = formatOutline(record.outline);
  const secondaryKeywords = record.secondary_keywords?.join(", ") || "";

  return `Write a complete ${record.content_type} article based on this outline. Match the tone: ${record.tone}.

Target keyword: ${record.target_keyword}
Secondary keywords: ${secondaryKeywords}
Recommended word count: ${record.recommended_word_count}

Outline:
${outlineFormatted}

Requirements:
- Include target keyword naturally in first paragraph and 2-3 times total
- Include secondary keywords naturally throughout
- Write in ${record.tone} tone for ${record.target_audience || "general audience"}
- Format with proper markdown headings matching the outline structure
- Each H2 section should be 150-250 words
- Include a compelling introduction and conclusion
- Do not include meta tags or SEO notes in the article body`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId } = body;

    // Validate contentId
    if (!contentId || typeof contentId !== "string" || contentId.trim().length === 0) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 }
      );
    }

    // Fetch content record
    const supabase = getSupabaseAdmin();
    const { data: record, error: fetchError } = await supabase
      .from("cf_content")
      .select("*")
      .eq("id", contentId.trim())
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Validate outline exists
    if (!record.outline || (Array.isArray(record.outline) && record.outline.length === 0)) {
      return NextResponse.json(
        { error: "Content has no outline. Generate a brief first." },
        { status: 400 }
      );
    }

    // Call Claude for draft
    let draftResponse: string;
    try {
      draftResponse = await generateWithClaude(
        DRAFT_SYSTEM_PROMPT,
        buildDraftPrompt({
          content_type: record.content_type || "Blog Post",
          tone: record.tone || "Professional",
          target_audience: record.target_audience,
          target_keyword: record.target_keyword,
          secondary_keywords: record.secondary_keywords || [],
          recommended_word_count: record.recommended_word_count || 1500,
          outline: record.outline as OutlineItem[],
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Claude API error: ${message}` },
        { status: 500 }
      );
    }

    // Count words
    const wordCount = draftResponse.trim().split(/\s+/).length;

    // Update record
    const { data: updated, error: updateError } = await supabase
      .from("cf_content")
      .update({
        full_draft: draftResponse,
        word_count: wordCount,
        status: "drafted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentId.trim())
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Database error: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
