import { Building2, KeyRound } from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { BrandLogo } from "@/components/app/brand-logo";
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

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="grid w-full max-w-2xl gap-8">
        <div className="grid justify-items-center gap-4 text-center">
          <BrandLogo className="w-40" />
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Request Shanyraq access</h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Create a pending request for a building. A manager or auditor reviews your role, unit, and evidence before
              the account becomes active.
            </p>
          </div>
        </div>

        <Card className="border-border bg-card/80 shadow-2xl shadow-black/20">
          <CardContent className="p-6 sm:p-8">
            <form action={registerAction} className="grid gap-5">
              <input type="hidden" name="locale" value={locale} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" autoComplete="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
                </div>
                <div className="grid gap-2">
                  <Label>Requested role</Label>
                  <Select name="requestedRole" defaultValue="resident" required>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 rounded-md border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  Building membership
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Building</Label>
                    <Select name="buildingId" defaultValue={defaultBuilding?.id ?? "new"}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Choose building" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.city}, {building.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">Register another complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="buildingName">Complex name</Label>
                    <Input id="buildingName" name="buildingName" defaultValue={defaultBuilding?.name ?? ""} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" defaultValue={defaultBuilding?.city ?? ""} required />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="buildingAddress">Address</Label>
                    <Input id="buildingAddress" name="buildingAddress" defaultValue={defaultBuilding?.address ?? ""} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit or apartment</Label>
                    <Input id="unit" name="unit" placeholder="12B" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="organizationName">Organization</Label>
                    <Input id="organizationName" name="organizationName" placeholder="For managers, contractors, auditors" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="evidenceNote">Access evidence</Label>
                <Textarea
                  id="evidenceNote"
                  name="evidenceNote"
                  required
                  minLength={10}
                  placeholder="Example: owner of unit 12B, contract reference, audit assignment, or management agreement."
                />
              </div>

              {error ? (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error === "duplicate"
                    ? "This email already has an account or pending request."
                    : "Check the form and try again."}
                </p>
              ) : null}

              <Button type="submit" className="gap-2">
                <KeyRound className="h-4 w-4" />
                Submit access request
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/${locale}/login`}>Back to sign in</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
