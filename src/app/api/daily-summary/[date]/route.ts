import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ date: string; }>;

export async function GET(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const date = new Date(resolvedParams.date);

    // Fetch the daily summary for the given date
    const dailySummary = await prisma.dailySummary.findUnique({
      where: {
        date,
      },
    });

    if (!dailySummary) {
      return NextResponse.json({ error: 'Daily summary not found' }, { status: 404 });
    }

    return NextResponse.json(dailySummary);
  } catch (error) {
    console.error('Failed to fetch daily summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
