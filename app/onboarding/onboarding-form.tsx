"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
import { onboardingSchema, type OnboardingInput } from "@/lib/validations";
import { ar } from "@/lib/translations/ar";

export function OnboardingForm() {
  const router = useRouter();
  const { update } = useSession();

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", role: undefined },
  });

  async function onSubmit(values: OnboardingInput) {
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || ar.common.error);
      }

      // Refresh the JWT so role/name/needsOnboarding reflect the new state.
      await update();

      router.push(values.role === "STUDENT" ? "/student" : "/worker");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : ar.common.error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-background px-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <UserCog className="h-7 w-7" />
          </div>
          <CardTitle>{ar.onboarding.title}</CardTitle>
          <CardDescription>{ar.onboarding.subtitle}</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ar.onboarding.nameLabel}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={ar.onboarding.namePlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ar.onboarding.roleLabel}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={ar.onboarding.roleLabel}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STUDENT">
                          {ar.onboarding.roleStudent}
                        </SelectItem>
                        <SelectItem value="WORKER">
                          {ar.onboarding.roleWorker}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {ar.onboarding.finish}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
