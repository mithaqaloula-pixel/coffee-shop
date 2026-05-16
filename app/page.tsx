import { Coffee } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-cream-100 to-coffee-100 p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-coffee-700 text-cream-50 shadow-lg">
          <Coffee className="h-10 w-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-coffee-800">
          نظام إدارة المقهى
        </h1>
        <p className="text-lg text-coffee-600">
          نظام نقاط بيع متكامل لإدارة المقهى — الطلبات، المخزون، الولاء، والمحاسبة
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-sm font-medium text-coffee-700 border border-coffee-200">
          الخطوة 1 من 12 — تم إعداد المشروع بنجاح ✓
        </div>
      </div>
    </main>
  );
}
