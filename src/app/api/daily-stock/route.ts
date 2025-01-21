import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    const parsedDate = new Date(date);

    // Check if entries already exist for this date
    const existingEntries = await prisma.dailyStock.findFirst({
      where: { date: parsedDate },
    });

    if (existingEntries) {
      return NextResponse.json({ error: "Entries for this date already exist" }, { status: 400 });
    }

    // Check if previous day's entries are complete
    const previousDay = subDays(parsedDate, 1);
    const previousDayEntries = await prisma.dailyStock.findFirst({
      where: { date: previousDay },
    });

    if (!previousDayEntries) {
      return NextResponse.json({ error: "Previous day's entries are not complete" }, { status: 400 });
    }

    // Get all products
    const products = await prisma.product.findMany();

    // Create daily stock entries for each product
    const dailyStocks = await Promise.all(
      products.map(async (product: { id: string; }) => {
        const previousStock = await prisma.dailyStock.findFirst({
          where: {
            productId: product.id,
            date: previousDay,
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
      }),
    );

    return NextResponse.json(dailyStocks, { status: 201 });
  } catch (error) {
    console.error("Failed to start day:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

