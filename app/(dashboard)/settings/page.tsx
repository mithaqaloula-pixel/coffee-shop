import { prisma } from '@/lib/prisma';
import { SettingsClient } from './settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });

  const defaults = {
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
  };

  const data = settings
    ? {
        shopName: settings.shopName,
        shopNameEn: settings.shopNameEn,
        address: settings.address,
        phone: settings.phone,
        vatNumber: settings.vatNumber,
        receiptFooter: settings.receiptFooter,
        printerType: settings.printerType,
        printerAddress: settings.printerAddress,
        kitchenPrinterAddress: settings.kitchenPrinterAddress,
        autoPrint: settings.autoPrint,
        printCopies: settings.printCopies,
      }
    : defaults;

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      <SettingsClient settings={data} />
    </div>
  );
}
