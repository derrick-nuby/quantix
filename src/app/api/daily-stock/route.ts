import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate < today) {
      return NextResponse.json({ error: 'Cannot create entries for past dates' }, { status: 400 });
    }

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
      products.map(async (product) => {
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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const dailyStocks = await prisma.dailyStock.findMany({
      where: {
        date: parsedDate,
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
    console.error('Failed to retrieve daily stock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

