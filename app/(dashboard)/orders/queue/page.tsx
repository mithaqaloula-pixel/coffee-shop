'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

type OrderItem = {
  id: string;
  quantity: number;
  notes: string | null;
  product: { nameAr: string; nameEn: string };
};

type Order = {
  id: string;
  orderNumber: number;
  status: string;
  createdAt: string;
  notes: string | null;
  items: OrderItem[];
  customer: { name: string; phone: string } | null;
};

function ElapsedTime({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      setElapsed(diff);
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const display = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const colorClass =
    minutes < 5
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : minutes < 10
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-red-600 bg-red-50 border-red-200 animate-pulse';

  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded-full text-xs font-mono font-bold border',
        colorClass
      )}
    >
      {display}
    </span>
  );
}

export default function QueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?status=pending&limit=50');
      if (res.ok) {
        const data = await res.json();
        // include pending + preparing
        const active = data.filter((o: Order) =>
          ['pending', 'preparing'].includes(o.status)
        );
        setOrders(active);
      }
    } catch {
      // silent fail for polling
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function markPreparing(orderId: string) {
    setUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'preparing' }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'preparing' } : o))
      );
    } finally {
      setUpdating(null);
    }
  }

  async function markComplete(orderId: string) {
    setUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } finally {
      setUpdating(null);
    }
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');

  return (
    <div className="p-6 bg-surface-50 min-h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-700">قائمة الطلبات</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} طلب نشط • يتجدد تلقائياً كل 3 ثوانٍ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-500">مباشر</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-xl font-medium">لا توجد طلبات معلقة</p>
          <p className="text-sm mt-2">يتجدد تلقائياً...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending column */}
          <div>
            <h2 className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              في الانتظار ({pendingOrders.length})
            </h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updating={updating === order.id}
                  onPrepare={() => markPreparing(order.id)}
                  onComplete={() => markComplete(order.id)}
                />
              ))}
              {pendingOrders.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">لا طلبات في الانتظار</p>
              )}
            </div>
          </div>

          {/* Preparing column */}
          <div>
            <h2 className="text-sm font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              قيد التحضير ({preparingOrders.length})
            </h2>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updating={updating === order.id}
                  onPrepare={() => markPreparing(order.id)}
                  onComplete={() => markComplete(order.id)}
                />
              ))}
              {preparingOrders.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">لا طلبات قيد التحضير</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  updating,
  onPrepare,
  onComplete,
}: {
  order: Order;
  updating: boolean;
  onPrepare: () => void;
  onComplete: () => void;
}) {
  const isPending = order.status === 'pending';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm overflow-hidden',
        isPending ? 'border-amber-200' : 'border-brand-200'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          isPending ? 'bg-amber-50' : 'bg-brand-50'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">#{order.orderNumber}</span>
          {order.customer && (
            <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border">
              {order.customer.name}
            </span>
          )}
        </div>
        <ElapsedTime createdAt={order.createdAt} />
      </div>

      <div className="p-4">
        <ul className="space-y-2 mb-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <span className="inline-block bg-brand-700 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {item.quantity}
              </span>
              <div>
                <span className="text-sm font-medium text-gray-900">{item.product.nameAr}</span>
                {item.notes && (
                  <p className="text-xs text-amber-600 mt-0.5">ملاحظة: {item.notes}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="text-xs text-gray-500 bg-surface-50 rounded p-2 mb-3">
            {order.notes}
          </p>
        )}

        <div className="flex gap-2">
          {isPending && (
            <button
              onClick={onPrepare}
              disabled={updating}
              className="flex-1 py-2 text-sm font-medium rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
            >
              بدء التحضير
            </button>
          )}
          <button
            onClick={onComplete}
            disabled={updating}
            className={cn(
              'py-2 text-sm font-bold rounded-lg bg-brand-700 text-white hover:bg-brand-600 transition-colors',
              isPending ? 'flex-1' : 'w-full'
            )}
          >
            {updating ? 'جاري...' : '✓ جاهز'}
          </button>
        </div>
      </div>
    </div>
  );
}
