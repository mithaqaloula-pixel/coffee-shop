"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      dir="rtl"
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
