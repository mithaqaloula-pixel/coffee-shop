import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "كامبس واش — غسيل سيارتك وانت في المحاضرة",
  description:
    "كامبس واش: خدمة غسيل سيارات متنقلة لطلاب الجامعة. اطلب الغسيل ونحن نوصله لموقفك.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
