import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const MAX_GENERATIONS = 3;

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key') || '';
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { session_id, action } = await req.json();
  if (!session_id) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const newCount = action === 'reset' ? 0 : MAX_GENERATIONS;

  await supabase
    .from('cf_sessions')
    .upsert({ session_id, usage_count: newCount }, { onConflict: 'session_id' });

  return NextResponse.json({ ok: true, usage_count: newCount });
}
