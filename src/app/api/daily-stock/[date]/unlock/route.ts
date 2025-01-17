import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  date: string;
};

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const { editHash } = await request.json();
    const date = new Date(params.date);

    const dailySummary = await prisma.dailySummary.findUnique({
      where: { date },
    });

    if (!dailySummary) {
      return NextResponse.json({ error: 'Daily summary not found' }, { status: 404 });
    }

    if (dailySummary.editHash !== editHash) {
      return NextResponse.json({ error: 'Invalid edit hash' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Failed to unlock daily entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

