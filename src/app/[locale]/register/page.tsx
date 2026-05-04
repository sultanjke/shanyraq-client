import { Building2, KeyRound } from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/domain";
import { getRegisterDictionary } from "@/lib/i18n";
import { listBuildings } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function RegisterPage({
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

  const buildings = await listBuildings();
  const defaultBuilding = buildings[0];
  const register = getRegisterDictionary(locale);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="grid w-full max-w-2xl gap-8">
        <div className="grid justify-items-center gap-4 text-center">
          <BrandLogo className="w-40" />
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{register.title}</h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">{register.subtitle}</p>
          </div>
        </div>

        <Card className="border-border bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="p-6 sm:p-8">
            <form action={registerAction} className="grid gap-5">
              <input type="hidden" name="locale" value={locale} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">{register.fullName}</Label>
                  <Input id="name" name="name" autoComplete="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{register.email}</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{register.password}</Label>
                  <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
                </div>
                <div className="grid gap-2">
                  <Label>{register.requestedRole}</Label>
                  <Select name="requestedRole" defaultValue="resident" required>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">{register.roles.resident}</SelectItem>
                      <SelectItem value="manager">{register.roles.manager}</SelectItem>
                      <SelectItem value="contractor">{register.roles.contractor}</SelectItem>
                      <SelectItem value="auditor">{register.roles.auditor}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 rounded-md border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  {register.buildingMembership}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>{register.building}</Label>
                    <Select name="buildingId" defaultValue={defaultBuilding?.id ?? "new"}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder={register.chooseBuilding} />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.city}, {building.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">{register.registerAnotherComplex}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="buildingName">{register.complexName}</Label>
                    <Input id="buildingName" name="buildingName" defaultValue={defaultBuilding?.name ?? ""} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">{register.city}</Label>
                    <Input id="city" name="city" defaultValue={defaultBuilding?.city ?? ""} required />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="buildingAddress">{register.address}</Label>
                    <Input id="buildingAddress" name="buildingAddress" defaultValue={defaultBuilding?.address ?? ""} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">{register.unit}</Label>
                    <Input id="unit" name="unit" placeholder={register.unitPlaceholder} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="organizationName">{register.organization}</Label>
                    <Input id="organizationName" name="organizationName" placeholder={register.organizationPlaceholder} />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="evidenceNote">{register.evidence}</Label>
                <Textarea
                  id="evidenceNote"
                  name="evidenceNote"
                  required
                  minLength={10}
                  placeholder={register.evidencePlaceholder}
                />
              </div>

              {error ? (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error === "duplicate" ? register.duplicateError : register.genericError}
                </p>
              ) : null}

              <Button type="submit" className="gap-2">
                <KeyRound className="h-4 w-4" />
                {register.submit}
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/${locale}/login`}>{register.backToSignIn}</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
