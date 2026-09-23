import { auth } from '@/lib/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handlers = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (err) {
    console.warn('[Auth API] GET handler warning (DB offline):', err);
    return NextResponse.json({ error: 'Auth service offline' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (err) {
    console.warn('[Auth API] POST handler warning (DB offline):', err);
    return NextResponse.json({ error: 'Auth service offline' }, { status: 503 });
  }
}
