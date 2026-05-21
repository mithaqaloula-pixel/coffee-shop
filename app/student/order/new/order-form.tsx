"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/image-uploader";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations";
import { formatPrice } from "@/lib/orders";
import { ar } from "@/lib/translations/ar";
import { createOrder } from "./actions";

type Props = {
  cars: { id: string; label: string }[];
  parkingLots: { id: string; name: string }[];
  services: {
    id: string;
    nameAr: string;
    price: number;
    durationMinutes: number;
  }[];
};

export function OrderForm({ cars, parkingLots, services }: Props) {
  const router = useRouter();
  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      carId: cars.length === 1 ? cars[0].id : "",
      parkingLotId: "",
      serviceTypeId: "",
      spotCode: "",
      carPhotoUrl: "",
      notes: "",
    },
  });

  const selectedService = services.find(
    (s) => s.id === form.watch("serviceTypeId"),
  );

  async function onSubmit(values: CreateOrderInput) {
    const res = await createOrder(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(ar.order.created);
    router.push(`/student/orders/${res.orderId}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="carId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.order.carLabel}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={ar.order.carPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cars.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parkingLotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.order.parkingLabel}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} dir="rtl">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={ar.order.parkingPlaceholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parkingLots.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.order.serviceLabel}</FormLabel>
              <div className="grid gap-2">
                {services.map((s) => {
                  const active = field.value === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => field.onChange(s.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-right transition ${
                        active
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                          : "hover:border-brand-300"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{s.nameAr}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {s.durationMinutes} {ar.order.minutes}
                        </p>
                      </div>
                      <span className="font-bold tabular-nums text-brand-700">
                        {formatPrice(s.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="spotCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.order.spotLabel}</FormLabel>
              <FormControl>
                <Input placeholder={ar.order.spotPlaceholder} {...field} />
              </FormControl>
              <FormDescription>{ar.order.spotHint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="carPhotoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.order.photoLabel}</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value || undefined}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.order.notesLabel}</FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  placeholder={ar.order.notesPlaceholder}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedService && (
          <Card className="bg-brand-50/60">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-medium">{ar.order.summary}</p>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {ar.order.duration}
                </span>
                <span>
                  {selectedService.durationMinutes} {ar.order.minutes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{ar.order.total}</span>
                <span className="text-lg font-bold tabular-nums text-brand-700">
                  {formatPrice(selectedService.price)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {ar.order.submit}
        </Button>
      </form>
    </Form>
  );
}
