"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ar } from "@/lib/translations/ar";
import { cancelOrder } from "../actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(ar.orderStatus.cancelled);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-destructive">
          <XCircle className="h-4 w-4" />
          {ar.orderStatus.cancel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-right">
          <DialogTitle>{ar.orderStatus.cancelConfirmTitle}</DialogTitle>
          <DialogDescription>
            {ar.orderStatus.cancelConfirmBody}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {ar.orderStatus.cancel}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {ar.common.back}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
