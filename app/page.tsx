import Link from "next/link";
import { Car, GraduationCap, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ar } from "@/lib/translations/ar";
import { LanguageToggle } from "@/components/language-toggle";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-background px-6">
      <header className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
        <div className="flex items-center gap-2 text-brand-700">
          <Car className="h-6 w-6" />
          <span className="text-lg font-bold">{ar.appName}</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
          <Car className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            {ar.appName}
          </h1>
          <p className="text-lg font-medium text-brand-600">{ar.tagline}</p>
          <p className="text-muted-foreground">{ar.landing.description}</p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-3">
          <Button asChild size="xl" className="w-full">
            <Link href="/login?role=student">
              <GraduationCap className="h-5 w-5" />
              {ar.landing.loginAsStudent}
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline" className="w-full">
            <Link href="/login?role=worker">
              <Wrench className="h-5 w-5" />
              {ar.landing.loginAsWorker}
            </Link>
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {ar.appName}
      </footer>
    </main>
  );
}
