import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ date: string; }>;

export async function GET(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const date = new Date(resolvedParams.date);

    // Get all daily stocks for the date
    const dailyStocks = await prisma.dailyStock.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!dailyStocks || dailyStocks.length === 0) {
      return NextResponse.json(
        { error: 'No daily stocks found for the given date' },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalProfit = dailyStocks.reduce((sum: number, stock: {
      soldQuantity: number;
      sellingPrice: { toNumber: () => number; };
      buyingPrice: { toNumber: () => number; };
    }) => {
      return sum + (stock.soldQuantity * (stock.sellingPrice.toNumber() - stock.buyingPrice.toNumber()));
    }, 0);

    const totalInflow = dailyStocks.reduce((sum: number, stock: {
      soldQuantity: number;
      sellingPrice: { toNumber: () => number; };
    }) => {
      return sum + (stock.soldQuantity * stock.sellingPrice.toNumber());
    }, 0);

    const totalOutflow = dailyStocks.reduce((sum: number, stock: {
      newStock: number;
      buyingPrice: { toNumber: () => number; };
    }) => {
      return sum + (stock.newStock * stock.buyingPrice.toNumber());
    }, 0);

    // Upsert the daily summary
    const dailySummary = await prisma.dailySummary.upsert({
      where: {
        date: date,
      },
      update: {
        totalProfit,
        totalInflow,
        totalOutflow,
      },
      create: {
        date,
        totalProfit,
        totalInflow,
        totalOutflow,
      },
    });

    return NextResponse.json(dailySummary);
  } catch (error) {
    console.error('Failed to fetch/create daily summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}