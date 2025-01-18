// file location = /api/daily-stock/[date]/lock

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

type Params = Promise<{ date: string; }>;

export async function POST(request: NextRequest, { params }: { params: Params; }) {
  try {

    const resolvedParams = await params;

    const date = new Date(resolvedParams.date);

    // Lock all entries for the date
    await prisma.dailyStock.updateMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      data: {
        isLocked: true,
        editHash: crypto.randomBytes(16).toString('hex'),
      },
    });

    // Calculate daily summary
    const dailyStocks = await prisma.dailyStock.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalProfit = dailyStocks.reduce((sum: number, stock: { soldQuantity: number; sellingPrice: { toNumber: () => number; }; buyingPrice: { toNumber: () => number; }; }) => {
      return sum + (stock.soldQuantity * (stock.sellingPrice.toNumber() - stock.buyingPrice.toNumber()));
    }, 0);

    const totalInflow = dailyStocks.reduce((sum: number, stock: { soldQuantity: number; sellingPrice: { toNumber: () => number; }; buyingPrice: { toNumber: () => number; }; }) => {
      return sum + (stock.soldQuantity * stock.sellingPrice.toNumber());
    }, 0);

    const totalOutflow = dailyStocks.reduce((sum: number, stock: { newStock: number; buyingPrice: { toNumber: () => number; }; }) => {
      return sum + (stock.newStock * stock.buyingPrice.toNumber());
    }, 0);

    const dailySummary = await prisma.dailySummary.create({
      data: {
        date,
        totalProfit,
        totalInflow,
        totalOutflow,
        isLocked: true,
        editHash: crypto.randomBytes(16).toString('hex'),
      },
    });

    return NextResponse.json({
      message: 'Daily entries locked successfully',
      dailySummary,
    });
  } catch (error) {
    console.error('Failed to lock daily entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

