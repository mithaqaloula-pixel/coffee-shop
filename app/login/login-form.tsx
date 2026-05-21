"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { ArrowRight, Car, Loader2 } from "lucide-react";
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
  phoneSchema,
  otpSchema,
  type RequestOtpInput,
  type VerifyOtpInput,
} from "@/lib/validations";
import { z } from "zod";
import { ar } from "@/lib/translations/ar";

const phoneForm = z.object({ phone: phoneSchema });
const otpForm = z.object({ phone: phoneSchema, otp: otpSchema });

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  const phoneFormMethods = useForm<RequestOtpInput>({
    resolver: zodResolver(phoneForm),
    defaultValues: { phone: "" },
  });

  const otpFormMethods = useForm<VerifyOtpInput>({
    resolver: zodResolver(otpForm),
    defaultValues: { phone: "", otp: "" },
  });

  async function onRequestOtp(values: RequestOtpInput) {
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || ar.login.invalidPhone);
      }
      setPhone(values.phone);
      otpFormMethods.reset({ phone: values.phone, otp: "" });
      setStep("otp");
      toast.success(ar.login.otpSent);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : ar.common.error);
    }
  }

  async function onVerifyOtp(values: VerifyOtpInput) {
    const res = await signIn("credentials", {
      phone: values.phone,
      otp: values.otp,
      redirect: false,
    });

    if (!res || res.error) {
      otpFormMethods.setError("otp", { message: ar.login.invalidOtp });
      return;
    }

    // Route based on the freshly-issued session.
    const session = await getSession();
    const role = session?.user?.role;
    if (session?.user?.needsOnboarding) {
      router.push("/onboarding");
    } else if (role === "STUDENT") {
      router.push("/student");
    } else if (role === "WORKER") {
      router.push("/worker");
    } else if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/onboarding");
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-background px-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <Car className="h-7 w-7" />
          </div>
          <CardTitle>{ar.login.title}</CardTitle>
          <CardDescription>{ar.appName}</CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" ? (
            <Form {...phoneFormMethods}>
              <form
                onSubmit={phoneFormMethods.handleSubmit(onRequestOtp)}
                className="space-y-4"
              >
                <FormField
                  control={phoneFormMethods.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ar.login.phoneLabel}</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder={ar.login.phonePlaceholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={phoneFormMethods.formState.isSubmitting}
                >
                  {phoneFormMethods.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {ar.login.sendOtp}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpFormMethods}>
              <form
                onSubmit={otpFormMethods.handleSubmit(onVerifyOtp)}
                className="space-y-4"
              >
                <p className="text-center text-sm text-muted-foreground">
                  {ar.login.otpSent}
                  <br />
                  <span className="font-medium text-foreground tabular-nums">
                    {phone}
                  </span>
                </p>
                <FormField
                  control={otpFormMethods.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ar.login.otpLabel}</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          maxLength={6}
                          className="text-center text-lg tracking-[0.5em] tabular-nums"
                          placeholder={ar.login.otpPlaceholder}
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otpFormMethods.formState.isSubmitting}
                >
                  {otpFormMethods.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {ar.login.verify}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-brand-600 hover:underline"
                    onClick={() => onRequestOtp({ phone })}
                  >
                    {ar.login.resend}
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:underline"
                    onClick={() => setStep("phone")}
                  >
                    {ar.login.changePhone}
                  </button>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
            >
              <ArrowRight className="h-3 w-3" />
              {ar.common.back}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
