import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const valid = Boolean(code && code === process.env.ADMIN_SECRET);
  return NextResponse.json({ valid });
}
