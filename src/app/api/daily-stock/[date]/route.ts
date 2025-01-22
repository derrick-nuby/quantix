// file location = src/app/api/daily-stock/[date]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ date: Date; }>;

export async function GET(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const date = new Date(resolvedParams.date);

    const dailyStocks = await prisma.dailyStock.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            lowStock: true,
            productNumber: true, // Include productNumber in the selection
          },
        },
      },
      orderBy: {
        product: {
          productNumber: 'asc', // Order by productNumber
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
