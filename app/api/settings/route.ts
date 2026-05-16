import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      return NextResponse.json({
        id: 'singleton',
        shopName: 'm4 coffee',
        shopNameEn: 'm4 coffee',
        address: null,
        phone: null,
        vatNumber: null,
        receiptFooter: 'شكراً لزيارتكم',
        printerType: 'browser',
        printerAddress: null,
        kitchenPrinterAddress: null,
        autoPrint: true,
        printCopies: 1,
        nextOrderNumber: 1001,
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      shopName,
      shopNameEn,
      address,
      phone,
      vatNumber,
      receiptFooter,
      printerType,
      printerAddress,
      kitchenPrinterAddress,
      autoPrint,
      printCopies,
    } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {
        ...(shopName !== undefined && { shopName }),
        ...(shopNameEn !== undefined && { shopNameEn }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(vatNumber !== undefined && { vatNumber }),
        ...(receiptFooter !== undefined && { receiptFooter }),
        ...(printerType !== undefined && { printerType }),
        ...(printerAddress !== undefined && { printerAddress }),
        ...(kitchenPrinterAddress !== undefined && { kitchenPrinterAddress }),
        ...(autoPrint !== undefined && { autoPrint }),
        ...(printCopies !== undefined && { printCopies }),
      },
      create: {
        id: 'singleton',
        shopName: shopName ?? 'm4 coffee',
        shopNameEn: shopNameEn ?? null,
        address: address ?? null,
        phone: phone ?? null,
        vatNumber: vatNumber ?? null,
        receiptFooter: receiptFooter ?? 'شكراً لزيارتكم',
        printerType: printerType ?? 'browser',
        printerAddress: printerAddress ?? null,
        kitchenPrinterAddress: kitchenPrinterAddress ?? null,
        autoPrint: autoPrint ?? true,
        printCopies: printCopies ?? 1,
        nextOrderNumber: 1001,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
