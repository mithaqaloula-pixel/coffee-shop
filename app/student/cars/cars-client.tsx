"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { carSchema, type CarInput } from "@/lib/validations";
import { CAR_COLORS } from "@/lib/orders";
import { ar } from "@/lib/translations/ar";
import { addCar, deleteCar } from "./actions";

export function AddCarDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<CarInput>({
    resolver: zodResolver(carSchema),
    defaultValues: { plateNumber: "", model: "", color: "", year: undefined },
  });

  async function onSubmit(values: CarInput) {
    const res = await addCar(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(ar.cars.added);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {ar.cars.add}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-right">
          <DialogTitle>{ar.cars.addTitle}</DialogTitle>
          <DialogDescription>{ar.cars.addSubtitle}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar.cars.plateLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={ar.cars.platePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar.cars.modelLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={ar.cars.modelPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar.cars.colorLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    dir="rtl"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={ar.cars.colorPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAR_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full ${c.className}`}
                            />
                            {c.value}
                          </span>
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
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar.cars.yearLabel}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={ar.cars.yearPlaceholder}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {ar.cars.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type CarCardProps = {
  id: string;
  plateNumber: string;
  model: string | null;
  color: string | null;
  year: number | null;
};

export function CarCard({ id, plateNumber, model, color, year }: CarCardProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const swatch = CAR_COLORS.find((c) => c.value === color)?.className;

  function onDelete() {
    startTransition(async () => {
      const res = await deleteCar(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(ar.cars.deleted);
      setOpen(false);
    });
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-xl font-extrabold tabular-nums text-brand-700">
            {plateNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            {model}
            {year ? ` · ${year}` : ""}
          </p>
          {color && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                className={`inline-block h-3 w-3 rounded-full ${swatch ?? "bg-muted"}`}
              />
              {color}
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={ar.cars.delete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader className="text-right">
              <DialogTitle>{ar.cars.deleteConfirmTitle}</DialogTitle>
              <DialogDescription>{ar.cars.deleteConfirmBody}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {ar.cars.deleteConfirm}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {ar.common.cancel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
