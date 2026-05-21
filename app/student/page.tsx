import { getServerSession } from "next-auth";
import { GraduationCap } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { LanguageToggle } from "@/components/language-toggle";
import { ar } from "@/lib/translations/ar";

export default async function StudentPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "";

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <div className="flex items-center gap-2 text-brand-700">
          <GraduationCap className="h-5 w-5" />
          <span className="font-bold">{ar.appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <LogoutButton />
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-bold">
          {ar.student.welcome} {name} 👋
        </h1>
        <p className="max-w-md text-muted-foreground">
          {ar.student.placeholder}
        </p>
      </section>
    </main>
  );
}
