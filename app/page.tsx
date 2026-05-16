import { Coffee, Package, Users, ShoppingBag, Building2, UserCog } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getCounts() {
  const [products, inventory, customers, orders, suppliers, employees, settings] =
    await Promise.all([
      prisma.product.count(),
      prisma.inventoryItem.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.supplier.count(),
      prisma.employee.count(),
      prisma.settings.findUnique({ where: { id: "singleton" } }),
    ]);
  return { products, inventory, customers, orders, suppliers, employees, settings };
}

export default async function HomePage() {
  const data = await getCounts();

  const cards = [
    { icon: Coffee, label: "المنتجات", value: data.products, color: "bg-coffee-700" },
    { icon: Package, label: "أصناف المخزون", value: data.inventory, color: "bg-coffee-600" },
    { icon: Users, label: "العملاء", value: data.customers, color: "bg-coffee-500" },
    { icon: ShoppingBag, label: "الطلبات السابقة", value: data.orders, color: "bg-coffee-700" },
    { icon: Building2, label: "الموردون", value: data.suppliers, color: "bg-coffee-600" },
    { icon: UserCog, label: "الموظفون", value: data.employees, color: "bg-coffee-500" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-coffee-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-coffee-700 text-cream-50 shadow-lg">
            <Coffee className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-coffee-800">
            {data.settings?.shopName ?? "نظام إدارة المقهى"}
          </h1>
          <p className="text-lg text-coffee-600">
            نظام نقاط بيع متكامل — الطلبات، المخزون، الولاء، والمحاسبة
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 border border-emerald-200">
            الخطوة 2 من 12 — قاعدة البيانات جاهزة ✓
          </div>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-coffee-800 mb-4 text-center">
            بيانات تجريبية محمّلة في النظام
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <Card key={c.label} className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${c.color} text-cream-50 flex items-center justify-center shrink-0`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-coffee-800 tabular-nums">{c.value}</div>
                  <div className="text-sm text-coffee-600">{c.label}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="p-6 bg-cream-50 border-coffee-200">
          <h3 className="font-semibold text-coffee-800 mb-3">حسابات تجريبية للدخول (لاحقاً)</h3>
          <ul className="text-sm text-coffee-700 space-y-1 font-mono" dir="ltr">
            <li>admin@coffee.om / admin123 — مدير</li>
            <li>barista@coffee.om / barista123 — باريستا</li>
          </ul>
        </Card>

        <p className="text-center text-sm text-coffee-600">
          الخطوات التالية: المخزون، المنيو، الكاشير، الدفع، الطباعة، الولاء، والمحاسبة.
        </p>
      </div>
    </main>
  );
}
