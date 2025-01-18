import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from 'decimal.js';

type Params = Promise<
  {
    date: string;
    productId: string;
  }
>;


export async function PATCH(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;

    const { soldQuantity, newStock, buyingPrice, sellingPrice } = await request.json();
    const date = new Date(resolvedParams.date);

    const dailyStock = await prisma.dailyStock.findUnique({
      where: {
        date_productId: {
          date,
          productId: resolvedParams.productId,
        },
      },
    });

    if (!dailyStock) {
      return NextResponse.json({ error: 'Daily stock entry not found' }, { status: 404 });
    }

    if (dailyStock.isLocked) {
      return NextResponse.json({ error: 'Cannot update locked entry' }, { status: 400 });
    }

    const updatedDailyStock = await prisma.dailyStock.update({
      where: {
        date_productId: {
          date,
          productId: resolvedParams.productId,
        },
      },
      data: {
        soldQuantity: soldQuantity !== undefined ? dailyStock.soldQuantity + soldQuantity : undefined,
        newStock: newStock !== undefined ? dailyStock.newStock + newStock : undefined,
        buyingPrice: buyingPrice !== undefined ? new Decimal(buyingPrice) : undefined, // Convert to Decimal
        sellingPrice: sellingPrice !== undefined ? new Decimal(sellingPrice) : undefined, // Convert to Decimal
        closingStock: dailyStock.openingStock +
          (dailyStock.newStock + (newStock || 0)) -
          (dailyStock.soldQuantity + (soldQuantity || 0)),
      },
    });

    return NextResponse.json(updatedDailyStock);
  } catch (error) {
    console.error('Failed to update daily stock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

