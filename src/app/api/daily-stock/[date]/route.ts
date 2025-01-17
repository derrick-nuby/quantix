import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  date: string;
};

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const date = new Date(params.date);

    const dailyStocks = await prisma.dailyStock.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(dailyStocks);
  } catch (error) {
    console.error('Failed to fetch daily stocks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

