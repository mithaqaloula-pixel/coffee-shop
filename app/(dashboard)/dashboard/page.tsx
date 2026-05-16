import Link from "next/link";
import {
  UtensilsCrossed,
  Package,
  ShoppingCart,
  ClipboardList,
  Star,
  BarChart3,
  Calculator,
  Settings,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    todayRevenue,
    activeCustomers,
    lowStockCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { status: "completed", createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      where: { status: "completed", createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.customer.count(),
    // Items where current quantity is at or below their reorder threshold
    prisma.inventoryItem
      .findMany({ select: { quantity: true, reorderThreshold: true } })
      .then((items) => items.filter((i) => i.quantity <= i.reorderThreshold).length),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: todayRevenue._sum.total ?? 0,
    activeCustomers,
    lowStockCount,
    recentOrders,
  };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  completed: { label: "مكتمل", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  pending:   { label: "معلق",   color: "text-yellow-600 bg-yellow-50", icon: Clock },
  preparing: { label: "يُحضَّر", color: "text-blue-600 bg-blue-50", icon: Clock },
  cancelled: { label: "ملغي",   color: "text-red-600 bg-red-50", icon: AlertTriangle },
};

const navCards = [
  {
    href: "/menu",
    icon: UtensilsCrossed,
    title: "المنيو",
    desc: "إدارة المنتجات والفئات والأسعار",
    color: "from-brand-700 to-brand-600",
  },
  {
    href: "/inventory",
    icon: Package,
    title: "المخزون",
    desc: "متابعة المواد الخام وتنبيهات النفاد",
    color: "from-brand-600 to-brand-500",
  },
  {
    href: "/orders/new",
    icon: ShoppingCart,
    title: "طلب جديد",
    desc: "إنشاء طلب جديد من نقطة البيع",
    color: "from-brand-800 to-brand-700",
  },
  {
    href: "/orders/queue",
    icon: ClipboardList,
    title: "قائمة الطلبات",
    desc: "الطلبات الحالية قيد التحضير",
    color: "from-brand-700 to-brand-600",
  },
  {
    href: "/loyalty",
    icon: Star,
    title: "الولاء",
    desc: "نقاط العملاء وبرنامج المكافآت",
    color: "from-brand-600 to-brand-500",
  },
  {
    href: "/reports",
    icon: BarChart3,
    title: "التقارير",
    desc: "إحصائيات المبيعات والأداء",
    color: "from-brand-800 to-brand-700",
  },
  {
    href: "/accounting/expenses",
    icon: Calculator,
    title: "المحاسبة",
    desc: "المصاريف والموردين والرواتب",
    color: "from-brand-700 to-brand-600",
  },
  {
    href: "/settings",
    icon: Settings,
    title: "الإعدادات",
    desc: "إعدادات المتجر والطباعة والنظام",
    color: "from-brand-600 to-brand-500",
  },
];

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statCards = [
    {
      label: "إيرادات اليوم",
      value: `${data.todayRevenue.toFixed(3)} ر.ع`,
      icon: TrendingUp,
      color: "text-brand-700 bg-brand-50",
      desc: "حتى الآن",
    },
    {
      label: "طلبات اليوم",
      value: data.todayOrders.toString(),
      icon: ShoppingCart,
      color: "text-brand-700 bg-brand-50",
      desc: "طلب مكتمل",
    },
    {
      label: "إجمالي العملاء",
      value: data.activeCustomers.toString(),
      icon: Users,
      color: "text-brand-700 bg-brand-50",
      desc: "عميل مسجل",
    },
    {
      label: "تنبيهات المخزون",
      value: data.lowStockCount.toString(),
      icon: AlertTriangle,
      color: data.lowStockCount > 0 ? "text-amber-700 bg-amber-50" : "text-brand-700 bg-brand-50",
      desc: "صنف يحتاج إعادة طلب",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">لوحة التحكم</h2>
        <p className="text-muted-foreground text-sm mt-1">
          مرحباً بك في نظام إدارة m4 coffee
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", s.color)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                {s.value}
              </div>
              <div className="text-sm font-medium text-foreground mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation cards */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">الأقسام الرئيسية</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {navCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={cn("bg-gradient-to-br p-5 flex items-center justify-between", card.color)}>
                <card.icon className="h-7 w-7 text-white" />
                <ArrowLeft className="h-4 w-4 text-white/60 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </div>
              <div className="p-4">
                <div className="font-semibold text-foreground text-base">{card.title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">آخر الطلبات</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">رقم الطلب</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">العميل</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">الأصناف</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">الإجمالي</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات بعد
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => {
                    const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                    const StatusIcon = st.icon;
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-brand-700">
                          #{order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {order.customer?.name ?? "بدون عميل"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          {itemCount} صنف
                        </td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                          {order.total.toFixed(3)} ر.ع
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              st.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString("ar-OM", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {data.recentOrders.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <Link
                href="/orders/history"
                className="text-sm text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                عرض كل الطلبات
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
