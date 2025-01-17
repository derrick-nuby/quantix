import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

async function lockPreviousDay() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Lock all entries for yesterday
    await prisma.dailyStock.updateMany({
      where: {
        date: {
          gte: yesterday,
          lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        },
        isLocked: false,
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
          gte: yesterday,
          lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalProfit = dailyStocks.reduce((sum, stock) => {
      return sum + (stock.soldQuantity * (stock.sellingPrice.toNumber() - stock.buyingPrice.toNumber()));
    }, 0);

    const totalInflow = dailyStocks.reduce((sum, stock) => {
      return sum + (stock.soldQuantity * stock.sellingPrice.toNumber());
    }, 0);

    const totalOutflow = dailyStocks.reduce((sum, stock) => {
      return sum + (stock.newStock * stock.buyingPrice.toNumber());
    }, 0);

    // Create or update daily summary
    await prisma.dailySummary.upsert({
      where: { date: yesterday },
      update: {
        totalProfit,
        totalInflow,
        totalOutflow,
        isLocked: true,
        editHash: crypto.randomBytes(16).toString('hex'),
      },
      create: {
        date: yesterday,
        totalProfit,
        totalInflow,
        totalOutflow,
        isLocked: true,
        editHash: crypto.randomBytes(16).toString('hex'),
      },
    });

    console.log('Previous day locked successfully');
  } catch (error) {
    console.error('Failed to lock previous day:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export { lockPreviousDay };

