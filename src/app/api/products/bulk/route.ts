import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
    }

    const createdProducts: Product[] = await prisma.$transaction(
      products.map((product) =>
        prisma.product.create({
          data: {
            name: product.name,
            imageUrl: product.imageUrl,
            lowStock: product.lowStock || 5,
          },
        })
      )
    );

    return NextResponse.json(createdProducts, { status: 201 });
  } catch (error) {
    console.error('Failed to create products in bulk:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

