"use client";

import { Languages } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ar } from "@/lib/translations/ar";

// Phase 1 placeholder: only Arabic is wired up. The toggle exists so the
// header layout is final; switching locales lands in a later phase.
export function LanguageToggle() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toast.info("الإنجليزية قريباً — التطبيق حالياً بالعربية")}
    >
      <Languages className="h-4 w-4" />
      {ar.language.toggle}
    </Button>
  );
}
