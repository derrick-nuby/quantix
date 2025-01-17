// file location = /app/api/cron/lock-previous-day/route.ts

import { NextResponse } from 'next/server';
import { lockPreviousDay } from '@/scripts/lockPreviousDay';

export async function GET() {
  try {
    await lockPreviousDay();
    return NextResponse.json({ message: 'Previous day locked successfully' });
  } catch (error) {
    console.error('Failed to lock previous day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

