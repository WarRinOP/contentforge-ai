import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { requireAdmin, setOwnQuota, GuardConfig } from '@/lib/usage-guard'

const GUARD: GuardConfig = { prefix: 'cf', limit: 3, noun: 'generations' }

// Admin test tool: fill (or empty) the caller's own device and address counters.
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const denied = await requireAdmin(req, supabase, GUARD)
  if (denied) return denied

  const { action } = await req.json().catch(() => ({ action: 'exhaust' }))
  return setOwnQuota(req, supabase, GUARD, action === 'reset' ? 'reset' : 'exhaust')
}
