import { AlertTriangle, CheckCircle2, FileCheck2, Landmark, Scale, UsersRound } from "lucide-react";
import { runRiskChecksAction } from "@/app/actions";
import { AppShell } from "@/components/app/app-shell";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { formatKzt, isLocale, localized, type Locale } from "@/lib/domain";
import { getDictionary } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { getDashboardData } from "@/lib/store";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const user = await requireUser(locale);
  const data = await getDashboardData(user);
  const dictionary = getDictionary(locale);

  const openRisks = data.risks.filter((risk) => risk.status !== "resolved").length;
  const verifiedDocuments = data.documents.filter((document) => document.currentStatus === "verified").length;
  const documentCompleteness = data.documents.length > 0 ? Math.round((verifiedDocuments / data.documents.length) * 100) : 0;
  const publishedExpenses = data.expenses.filter((expense) => expense.status === "published").length;
  const auditedTransactions = data.expenses.length > 0 ? Math.round((publishedExpenses / data.expenses.length) * 100) : 0;
  const participation = Math.min(100, data.votes.length * 32 + 32);
  const totalExpense = data.expenses.reduce((sum, expense) => sum + expense.amountKzt, 0);

  return (
    <AppShell locale={locale} user={user}>
      <div className="grid gap-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{dictionary.dashboard.officialContext}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{dictionary.dashboard.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{dictionary.dashboard.subtitle}</p>
          </div>
          {can(user.role, "risk:run") ? (
            <form action={runRiskChecksAction}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" className="gap-2">
                <Scale className="h-4 w-4" />
                {dictionary.actions.runChecks}
              </Button>
            </form>
          ) : null}
        </section>

        <section className="grid dashboard-grid gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                {dictionary.dashboard.transparencyScore}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{data.building.transparencyScore}/100</p>
              <Progress value={data.building.transparencyScore} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                {dictionary.dashboard.openRisks}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{openRisks}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatKzt(totalExpense)} KZT visible expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileCheck2 className="h-4 w-4" />
                {dictionary.dashboard.documentCompleteness}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{documentCompleteness}%</p>
              <Progress value={documentCompleteness} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <UsersRound className="h-4 w-4" />
                {dictionary.dashboard.residentParticipation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{participation}%</p>
              <Progress value={participation} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Landmark className="h-4 w-4" />
                {dictionary.dashboard.auditedTransactions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{auditedTransactions}%</p>
              <Progress value={auditedTransactions} className="mt-3" />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold">{dictionary.dashboard.riskRegister}</h2>
            {data.risks.map((risk) => (
              <Card key={risk.id}>
                <CardContent className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{localized(risk.title, locale)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{localized(risk.explanation, locale)}</p>
                    </div>
                    <StatusBadge status={risk.status} locale={locale} />
                  </div>
                  <p className="text-xs text-muted-foreground">Owner: {risk.owner}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{dictionary.dashboard.officialContext}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <a className="hover:text-foreground" href="https://www.gov.kz/situations/342/intro?lang=ru">
                Что такое объединение собственников имущества (ОСИ)
              </a>
              <a className="hover:text-foreground" href="https://egov.kz/cms/ru/services/pass613_msh">
                eGov.kz - Референс к утверждений земпроектов
              </a>
              <a className="hover:text-foreground" href="https://www.gov.kz/services/3173?lang=ru">
                Референс по проверке разрешений и лицензий
              </a>
              <a
                className="hover:text-foreground"
                href="https://www.oecd.org/en/publications/public-procurement-in-kazakhstan_c11183ae-en/full-report/managing-risks-and-supporting-accountability-through-the-public-procurement-cycle-in-kazakhstan_137a95c3.html"
              >
                Государственные закупки в Казахстане
              </a>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
