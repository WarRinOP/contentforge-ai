import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateMarkdown, generatePlainText } from "@/lib/export";

function createSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30)
    .replace(/-$/, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const format = searchParams.get("format") || "md";

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    if (!["md", "txt"].includes(format)) {
      return NextResponse.json(
        { error: "format must be 'md' or 'txt'" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from("cf_content")
      .select("*")
      .eq("id", id.trim())
      .single();

    if (error || !record) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    if (!record.full_draft) {
      return NextResponse.json(
        { error: "Content has no draft yet. Generate a draft first." },
        { status: 400 }
      );
    }

    const slug = createSlug(record.topic);
    const date = new Date().toISOString().split("T")[0];
    let content: string;
    let contentType: string;
    let extension: string;

    if (format === "md") {
      content = generateMarkdown(record);
      contentType = "text/markdown";
      extension = "md";
    } else {
      content = generatePlainText(record);
      contentType = "text/plain";
      extension = "txt";
    }

    const filename = `contentforge-${slug}-${date}.${extension}`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": `${contentType}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
