"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
};

// Uploads a single image to /api/upload and reports the resulting secure URL
// via `onChange`, so it plugs into react-hook-form via a Controller/FormField.
export function ImageUploader({ value, onChange, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "تعذّر رفع الصورة");
      }
      onChange(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative h-48 w-full overflow-hidden rounded-xl border">
          <Image
            src={value}
            alt="معاينة الصورة"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute left-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            aria-label="إزالة الصورة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/40 text-muted-foreground transition hover:border-brand-400 hover:bg-accent/40 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <ImagePlus className="h-7 w-7" />
          )}
          <span className="text-sm">
            {uploading ? "جاري الرفع..." : "اضغط لرفع صورة"}
          </span>
          <span className="text-xs">JPG · PNG · WEBP — حتى 5 ميجابايت</span>
        </button>
      )}
    </div>
  );
}
