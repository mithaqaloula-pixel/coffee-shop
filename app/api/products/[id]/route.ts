import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, price, category, image, active, recipeItems } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(nameAr !== undefined && { nameAr }),
        ...(nameEn !== undefined && { nameEn }),
        ...(price !== undefined && { price }),
        ...(category !== undefined && { category }),
        ...(image !== undefined && { image }),
        ...(active !== undefined && { active }),
      },
    });

    if (recipeItems !== undefined) {
      const existingRecipe = await prisma.recipe.findUnique({ where: { productId: params.id } });
      if (existingRecipe) {
        await prisma.recipeItem.deleteMany({ where: { recipeId: existingRecipe.id } });
        if (recipeItems.length > 0) {
          await prisma.recipeItem.createMany({
            data: recipeItems.map((ri: { inventoryItemId: string; quantity: number }) => ({
              recipeId: existingRecipe.id,
              inventoryItemId: ri.inventoryItemId,
              quantity: ri.quantity,
            })),
          });
        }
      } else if (recipeItems.length > 0) {
        await prisma.recipe.create({
          data: {
            productId: params.id,
            items: {
              create: recipeItems.map((ri: { inventoryItemId: string; quantity: number }) => ({
                inventoryItemId: ri.inventoryItemId,
                quantity: ri.quantity,
              })),
            },
          },
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        recipe: {
          include: { items: { include: { inventoryItem: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
