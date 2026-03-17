import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET — Fetch all content with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const period = searchParams.get("period");

    let query = supabase
      .from("cf_content")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by search text (topic field)
    if (search && search.trim().length > 0) {
      query = query.ilike("topic", `%${search.trim()}%`);
    }

    // Filter by status
    if (status && ["brief", "outlined", "drafted"].includes(status)) {
      query = query.eq("status", status);
    }

    // Filter by period
    if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte("created_at", weekAgo.toISOString());
    } else if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte("created_at", monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — Delete content by id
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if record exists first
    const { data: existing, error: fetchError } = await supabase
      .from("cf_content")
      .select("id")
      .eq("id", id.trim())
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("cf_content")
      .delete()
      .eq("id", id.trim());

    if (deleteError) {
      return NextResponse.json(
        { error: `Database error: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Content deleted" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
