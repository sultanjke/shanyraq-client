import { redirect } from "next/navigation";
import { signInAction } from "@/app/actions";
import { BrandLogo } from "@/components/app/brand-logo";
import { LoginSubmitButton } from "@/components/app/login-submit-button";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/domain";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { error } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const currentUser = await getCurrentUser();
  if (currentUser) redirect(`/${locale}/dashboard`);

  const dictionary = getDictionary(locale);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="grid w-full max-w-sm gap-10">
        <div className="auth-logo-enter grid justify-items-center">
          <BrandLogo className="w-40" />
        </div>

        <Card className="auth-card-enter border-border bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="p-6 sm:p-8">
            <form action={signInAction} className="grid gap-2">
              <div className="grid gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{dictionary.loginTitle}</h1>
                <p className="text-sm text-muted-foreground mb-5">{dictionary.loginSubtitle}</p>
              </div>

              <input type="hidden" name="locale" value={locale} />
              <div className="grid gap-2">
                <Label htmlFor="email">{dictionary.email}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{dictionary.password}</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {error ? <p className="text-sm text-red-300">{dictionary.invalidLogin}</p> : null}
              <LoginSubmitButton label={dictionary.signIn} />
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
