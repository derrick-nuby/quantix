import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

type Params = Promise<{ id: string; }>;

export async function PATCH(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { name, imageUrl } = body;

    if (!name && !imageUrl) {
      return NextResponse.json({ error: 'At least one field to update is required' }, { status: 400 });
    }

    const updatedProduct: Product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        ...(name && { name }),
        ...(imageUrl && { imageUrl }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;

    // Check if the product has any associated daily stock entries
    const stockEntries = await prisma.dailyStock.findFirst({
      where: { productId: resolvedParams.id },
    });

    if (stockEntries) {
      return NextResponse.json({ error: 'Cannot delete product with existing stock entries' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Params; }) {
  try {
    const resolvedParams = await params;
    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}