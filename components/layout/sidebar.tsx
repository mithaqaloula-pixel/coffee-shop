"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coffee,
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  ClipboardList,
  History,
  Star,
  BarChart3,
  Calculator,
  Settings,
  ChevronDown,
  ChevronUp,
  Truck,
  FileText,
  Users,
  Receipt,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
};

const navGroups: { groupLabel: string; items: NavItem[] }[] = [
  {
    groupLabel: "الرئيسية",
    items: [
      { label: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
      { label: "المنيو", href: "/menu", icon: UtensilsCrossed },
      { label: "المخزون", href: "/inventory", icon: Package },
    ],
  },
  {
    groupLabel: "الطلبات",
    items: [
      { label: "طلب جديد", href: "/orders/new", icon: ShoppingCart },
      { label: "قائمة الطلبات", href: "/orders/queue", icon: ClipboardList },
      { label: "السجل", href: "/orders/history", icon: History },
    ],
  },
  {
    groupLabel: "العملاء والتقارير",
    items: [
      { label: "الولاء", href: "/loyalty", icon: Star },
      { label: "التقارير", href: "/reports", icon: BarChart3 },
      {
        label: "المحاسبة",
        href: "/accounting/expenses",
        icon: Calculator,
        children: [
          { label: "الموردون", href: "/accounting/suppliers", icon: Truck },
          { label: "الفواتير", href: "/accounting/invoices", icon: FileText },
          { label: "الرواتب", href: "/accounting/payroll", icon: Users },
          { label: "المصاريف", href: "/accounting/expenses", icon: Receipt },
          { label: "التقارير المالية", href: "/accounting/reports", icon: TrendingUp },
        ],
      },
    ],
  },
  {
    groupLabel: "الإعدادات",
    items: [
      { label: "الإعدادات", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [accountingOpen, setAccountingOpen] = useState(() =>
    pathname.startsWith("/accounting")
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-brand-800 text-white flex flex-col z-40 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-brand-700">
        <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-inner shrink-0">
          <Coffee className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-wide text-white leading-none">
            m4 coffee
          </div>
          <div className="text-xs text-brand-300 mt-0.5">نظام نقاط البيع</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.groupLabel}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
              {group.groupLabel}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                if (item.children) {
                  const active = item.children.some((c) => isActive(c.href)) || isActive(item.href);
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => setAccountingOpen((o) => !o)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          active
                            ? "bg-brand-600 text-white"
                            : "text-brand-200 hover:bg-brand-700 hover:text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-right">{item.label}</span>
                        {accountingOpen ? (
                          <ChevronUp className="h-3.5 w-3.5 opacity-60" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                        )}
                      </button>
                      {accountingOpen && (
                        <ul className="mt-0.5 mr-4 space-y-0.5 border-r border-brand-700 pr-2">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                  isActive(child.href)
                                    ? "bg-brand-600 text-white font-medium"
                                    : "text-brand-300 hover:bg-brand-700 hover:text-white"
                                )}
                              >
                                <child.icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{child.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive(item.href)
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-brand-200 hover:bg-brand-700 hover:text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-brand-700">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">المدير</div>
            <div className="text-xs text-brand-400 truncate">admin@coffee.om</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
