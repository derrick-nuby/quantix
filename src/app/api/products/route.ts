import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, imageUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const product: Product = await prisma.product.create({
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    });

    const total = await prisma.product.count();

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

