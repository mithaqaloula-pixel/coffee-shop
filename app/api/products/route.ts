import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        recipe: {
          include: {
            items: {
              include: { inventoryItem: true },
            },
          },
        },
      },
      orderBy: { nameAr: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, price, category, image, recipeItems } = body;

    if (!nameAr || !price || !category) {
      return NextResponse.json({ error: 'nameAr, price, and category are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        nameAr,
        nameEn: nameEn || '',
        price,
        category,
        image: image || null,
        recipe: recipeItems && recipeItems.length > 0
          ? {
              create: {
                items: {
                  create: recipeItems.map((ri: { inventoryItemId: string; quantity: number }) => ({
                    inventoryItemId: ri.inventoryItemId,
                    quantity: ri.quantity,
                  })),
                },
              },
            }
          : undefined,
      },
      include: {
        recipe: {
          include: {
            items: { include: { inventoryItem: true } },
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
