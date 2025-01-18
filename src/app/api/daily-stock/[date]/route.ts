import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ date: string; }>;

export async function GET(request: NextRequest, { params }: { params: Params; }) {
  try {

    const resolvedParams = await params;

    const date = new Date(resolvedParams.date);
    date.setHours(0, 0, 0, 0);

    const dailyStocks = await prisma.dailyStock.findMany({
      where: {
        date: date,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            lowStock: true,
          },
        },
      },
    });

    if (!dailyStocks || dailyStocks.length === 0) {
      return NextResponse.json({ error: 'No daily stocks found for the given date' }, { status: 404 });
    }

    return NextResponse.json(dailyStocks);
  } catch (error) {
    console.error('Failed to fetch daily stocks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

