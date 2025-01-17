import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  date: string;
  productId: string;
};

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { soldQuantity, newStock, buyingPrice, sellingPrice } = await request.json();
    const date = new Date(params.date);

    const dailyStock = await prisma.dailyStock.findUnique({
      where: {
        date_productId: {
          date,
          productId: params.productId,
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
          productId: params.productId,
        },
      },
      data: {
        soldQuantity: soldQuantity !== undefined ? dailyStock.soldQuantity + soldQuantity : undefined,
        newStock: newStock !== undefined ? dailyStock.newStock + newStock : undefined,
        buyingPrice: buyingPrice !== undefined ? buyingPrice : undefined,
        sellingPrice: sellingPrice !== undefined ? sellingPrice : undefined,
        closingStock: dailyStock.openingStock + (newStock || 0) - (soldQuantity || 0),
      },
    });

    return NextResponse.json(updatedDailyStock);
  } catch (error) {
    console.error('Failed to update daily stock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

