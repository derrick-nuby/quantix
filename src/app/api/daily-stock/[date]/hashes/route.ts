// file location: src/app/api/daily-stock/[date]/hashes/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ date: string; }>;

export async function GET(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const { date } = resolvedParams;
    const dateObj = new Date(date);

    const dailySummaries = await prisma.dailySummary.findMany({
      where: { date: dateObj },
    });

    if (dailySummaries.length === 0) {
      return NextResponse.json({ message: `No hashes found for this date: ${date}` }, { status: 404 });
    }

    const hashes = dailySummaries.map(summary => summary.editHash);

    if (hashes.every(hash => hash === null)) {
      return NextResponse.json({ message: `No hashes found for this date: ${date}` }, { status: 404 });
    }

    return NextResponse.json({ hashes });
  } catch (error) {
    console.error('Failed to retrieve hashes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}