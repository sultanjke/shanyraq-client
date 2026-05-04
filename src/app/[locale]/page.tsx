import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileArchive,
  KeyRound,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Background } from "@/components/ui/background";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { isLocale, type Locale } from "@/lib/domain";
import { getDictionary, getLandingDictionary } from "@/lib/i18n";

const metricValues = ["82/100", "3", "75%", "8.5M KZT"] as const;
const featureIcons = [FileArchive, Landmark, UsersRound, ShieldAlert, ShieldCheck, LockKeyhole] as const;
const riskIcons = [Scale, FileArchive, Landmark, ClipboardCheck] as const;

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dictionary = getDictionary(locale);
  const landing = getLandingDictionary(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          <Link href={`/${locale}`} aria-label={dictionary.appName}>
            <BrandLogo className="w-20 m-2" />
          </Link>
          <nav className="hidden items-center gap-2 md:flex" aria-label={landing.navLabel}>
            <Button asChild variant="ghost">
              <Link href={`/${locale}/login`}>{landing.primaryCta}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/register`}>{landing.secondaryCta}</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden border-b border-border">
        <Background
          fill
          position="absolute"
          height={56}
          className="top-0 z-0 [mask-image:linear-gradient(to_bottom,black_0%,black_48%,transparent_100%)]"
          gradient={{
            display: true,
            opacity: 1,
            x: 3,
            y: 0,
            width: 120,
            height: 70,
            colorStart: "accent-background-strong",
            colorEnd: "static-transparent",
          }}
          dots={{
            display: true,
            opacity: 0.95,
            size: 4,
            color: "page-background",
          }}
        />
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl content-center gap-10 px-4 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="mb-5 w-fit gap-2 bg-blue-600 text-white">
              {landing.badgeLabel}
            </Badge>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {landing.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {landing.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href={`/${locale}/login`}>
                  {landing.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href={`/${locale}/register`}>
                  <KeyRound className="h-4 w-4" />
                  {landing.secondaryCta}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-border bg-card/80 p-3 shadow-2xl shadow-black/10 sm:p-4">
              <div className="rounded-md border border-border bg-background">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="grid gap-4 p-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    {landing.metrics.map((metric, index) => (
                      <div key={metric} className="rounded-md border border-border bg-card p-3">
                        <p className="text-xs text-muted-foreground">{metric}</p>
                        <p className="mt-2 text-xl font-semibold">{metricValues[index]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-md border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{landing.previewApprovalTitle}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{landing.previewApprovalSubtitle}</p>
                        </div>
                        <Badge variant="secondary">72%</Badge>
                      </div>
                      <Progress value={72} className="mt-4" />
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span>{landing.previewQuorum}</span>
                        <span className="text-right">60%</span>
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ShieldAlert className="h-4 w-4" />
                        {landing.previewRiskTitle}
                      </div>
                      <div className="mt-3 grid gap-2">
                        {landing.previewRisks.map((risk, index) => (
                          <div key={risk} className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
                            <span className="text-sm">{risk}</span>
                            <Badge variant={index === 0 ? "destructive" : "outline"}>
                              {index === 0 ? landing.criticalLabel : landing.reviewLabel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{landing.previewAuditTitle}</p>
                      <Badge variant="outline">{landing.hashChainLabel}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 font-mono text-xs text-muted-foreground">
                      <div className="grid gap-1 rounded-md bg-muted/40 p-3 sm:grid-cols-[8rem_1fr_7rem]">
                        <span>18:05</span>
                        <span>{landing.previewAuditVote}</span>
                        <span className="truncate">9e7a8df5</span>
                      </div>
                      <div className="grid gap-1 rounded-md bg-muted/40 p-3 sm:grid-cols-[8rem_1fr_7rem]">
                        <span>21:42</span>
                        <span>{landing.previewAuditFinance}</span>
                        <span className="truncate">5f39a30d</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{landing.trustEyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{landing.trustTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{landing.trustSubtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {landing.risks.map((risk, index) => {
            const Icon = riskIcons[index];
            return (
              <Card
                key={risk.title}
                className="group/risk relative transition-shadow duration-300 ease-out hover:shadow-[0_-30px_90px_-40px_rgba(37,99,235,0.65)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 -bottom-6 z-0 h-10 rounded-full bg-blue-500/30 opacity-0 blur-2xl transition-opacity duration-300 ease-out group-hover/risk:opacity-100"
                />
                <Background
                  fill
                  position="absolute"
                  height="100%"
                  className="inset-0 z-0 h-full opacity-0 transition-opacity duration-300 ease-out group-hover/risk:opacity-100"
                  gradient={{
                    display: true,
                    opacity: 1,
                    x: 50,
                    y: -20,
                    width: 120,
                    height: 90,
                    colorStart: "accent-background-strong",
                    colorEnd: "static-transparent",
                  }}
                  dots={{
                    display: true,
                    opacity: 0.9,
                    size: 3,
                    color: "page-background",
                  }}
                />
                <CardContent className="relative z-10 grid gap-3 p-5">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">{risk.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{risk.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{landing.featuresEyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{landing.featuresTitle}</h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground mt-2">{landing.featuresSubtitle}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {landing.features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <Card key={feature.title}>
                <CardContent className="grid gap-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{landing.rolesEyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{landing.rolesTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {landing.roles.map((role) => (
              <Card key={role.title}>
                <CardContent className="grid gap-3 p-5">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-lg bg-card p-6 shadow-sm sm:p-8">
          <BorderBeam
            className="pointer-events-none before:border-blue-500/20 dark:before:border-blue-400/20"
            lightColor="#2563eb"
            lightWidth={350}
            duration={8}
            borderWidth={1.5}
          />
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{landing.finalTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{landing.finalSubtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href={`/${locale}/login`}>
                  {landing.finalPrimaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/register`}>{landing.finalSecondaryCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
