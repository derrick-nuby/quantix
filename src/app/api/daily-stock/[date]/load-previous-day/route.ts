// file location = src/app/api/daily-stock/[date]/load-previous-day/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

type Params = Promise<{ date: Date; }>;

export async function POST(request: NextRequest, { params }: { params: Params; }) {
  try {

    const resolvedParams = await params;
    const parsedDate = new Date(resolvedParams.date);

    // Get the previous day's date
    const previousDay = subDays(parsedDate, 1);

    // Fetch previous day's entries
    const previousDayEntries = await prisma.dailyStock.findMany({
      where: { date: previousDay },
      include: {
        product: true,
      },
    });

    if (!previousDayEntries || previousDayEntries.length === 0) {
      return NextResponse.json({ error: "No entries found for the previous day" }, { status: 404 });
    }

    // Update current day's entries with previous day's data
    const updatedEntries = await Promise.all(
      previousDayEntries.map(async (entry) => {
        const existingEntry = await prisma.dailyStock.findFirst({
          where: {
            date: parsedDate,
            productId: entry.productId,
          },
        });

        if (existingEntry) {
          return prisma.dailyStock.update({
            where: { id: existingEntry.id },
            data: {
              openingStock: entry.closingStock,
              buyingPrice: entry.buyingPrice,
              sellingPrice: entry.sellingPrice,
            },
          });
        } else {
          return prisma.dailyStock.create({
            data: {
              date: parsedDate,
              productId: entry.productId,
              openingStock: entry.closingStock,
              closingStock: entry.closingStock,
              buyingPrice: entry.buyingPrice,
              sellingPrice: entry.sellingPrice,
            },
          });
        }
      })
    );

    return NextResponse.json(updatedEntries, { status: 200 });
  } catch (error) {
    console.error("Failed to load previous day data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}