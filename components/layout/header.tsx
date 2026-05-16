"use client";

import { Bell, User } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "الرئيسية" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-border px-6 shadow-sm">
      {/* Left side: notifications + user */}
      <div className="flex items-center gap-4">
        {/* Bell with badge */}
        <button className="relative p-2 rounded-lg hover:bg-surface-100 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-foreground leading-none">المدير</div>
            <div className="text-xs text-muted-foreground mt-0.5">مدير النظام</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Right side: page title */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>
    </header>
  );
}
