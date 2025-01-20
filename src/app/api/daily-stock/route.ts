import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    const parsedDate = new Date(date);

    // Check if entries already exist for this date
    const existingEntries = await prisma.dailyStock.findFirst({
      where: { date: parsedDate },
    });

    if (existingEntries) {
      return NextResponse.json({ error: 'Entries for this date already exist' }, { status: 400 });
    }

    // Get all products
    const products = await prisma.product.findMany();

    // Create daily stock entries for each product
    const dailyStocks = await Promise.all(
      products.map(async (product: { id: string; }) => {
        const previousDay = new Date(parsedDate);
        previousDay.setDate(previousDay.getDate() - 1);

        const previousStock = await prisma.dailyStock.findFirst({
          where: {
            productId: product.id,
            date: {
              lt: parsedDate,
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        return prisma.dailyStock.create({
          data: {
            date: parsedDate,
            productId: product.id,
            openingStock: previousStock ? previousStock.closingStock : 0,
            closingStock: previousStock ? previousStock.closingStock : 0,
            buyingPrice: previousStock ? previousStock.buyingPrice : 0,
            sellingPrice: previousStock ? previousStock.sellingPrice : 0,
          },
        });
      })
    );

    return NextResponse.json(dailyStocks, { status: 201 });
  } catch (error) {
    console.error('Failed to start day:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}