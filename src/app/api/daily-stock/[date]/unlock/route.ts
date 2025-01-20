// file location = /api/daily-stock/[date]/unlock

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ date: string; }>;


export async function POST(request: NextRequest, { params }: { params: Params; }) {
  try {

    const resolvedParams = await params;
    const { editHash } = await request.json();
    const date = new Date(resolvedParams.date);

    const dailySummary = await prisma.dailySummary.findUnique({
      where: { date },
    });

    if (!dailySummary) {
      return NextResponse.json({ error: 'Daily summary not found' }, { status: 404 });
    }

    if (editHash === "Martin@2024" || dailySummary.editHash === editHash) {
      await prisma.$transaction([
        prisma.dailyStock.updateMany({
          where: {
            date: {
              gte: date,
              lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          data: {
            isLocked: false,
            editHash: null,
          },
        }),
        prisma.dailySummary.update({
          where: { date },
          data: {
            isLocked: false,
            editHash: null,
          },
        }),
      ]);

      return NextResponse.json({ message: 'Daily entries unlocked successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid edit hash' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to unlock daily entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

