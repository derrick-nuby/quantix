import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from 'decimal.js';

type Params = Promise<{ date: string; }>;

type StockUpdate = {
  productId: string;
  soldQuantity?: number;
  newStock?: number;
  buyingPrice?: number;
  sellingPrice?: number;
};

export async function PATCH(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const date = new Date(resolvedParams.date);
    const { updates } = await request.json() as { updates: StockUpdate[]; };

    // Validate input
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid updates array' },
        { status: 400 }
      );
    }

    // Extract product IDs from updates
    const productIds = updates.map(update => update.productId);

    // Fetch all relevant daily stocks in a single query
    const existingStocks = await prisma.dailyStock.findMany({
      where: {
        date,
        productId: {
          in: productIds
        }
      }
    });

    // Create a map for easier access
    const stocksMap = new Map(
      existingStocks.map(stock => [stock.productId, stock])
    );

    // Validate all stocks exist and aren't locked
    for (const update of updates) {
      const stock = stocksMap.get(update.productId);

      // Check if stock exists
      if (!stock) {
        return NextResponse.json(
          { error: `Daily stock not found for product ${update.productId}` },
          { status: 404 }
        );
      }

      // Check if stock is locked
      if (stock.isLocked) {
        return NextResponse.json(
          { error: `Cannot update locked entry for product ${update.productId}` },
          { status: 400 }
        );
      }
    }

    // Perform all updates in a single transaction
    const updatedStocks = await prisma.$transaction(
      updates.map(update => {
        const currentStock = stocksMap.get(update.productId)!;

        // Calculate new quantities
        const newSoldQuantity = update.soldQuantity !== undefined
          ? currentStock.soldQuantity + update.soldQuantity
          : currentStock.soldQuantity;

        const newNewStock = update.newStock !== undefined
          ? currentStock.newStock + update.newStock
          : currentStock.newStock;

        // Calculate closing stock
        const newClosingStock =
          currentStock.openingStock + newNewStock - newSoldQuantity;

        // Validate closing stock
        if (newClosingStock < 0) {
          throw new Error(
            `Invalid operation: Closing stock would become negative for product ${update.productId}`
          );
        }

        // Prepare update operation
        return prisma.dailyStock.update({
          where: {
            date_productId: {
              date,
              productId: update.productId,
            },
          },
          data: {
            soldQuantity: newSoldQuantity,
            newStock: newNewStock,
            closingStock: newClosingStock,
            ...(update.buyingPrice !== undefined && {
              buyingPrice: new Decimal(update.buyingPrice)
            }),
            ...(update.sellingPrice !== undefined && {
              sellingPrice: new Decimal(update.sellingPrice)
            })
          },
        });
      })
    );

    return NextResponse.json(updatedStocks);

  } catch (error) {
    console.error('Failed to update daily stocks in bulk:', error);

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('Closing stock would become negative')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}