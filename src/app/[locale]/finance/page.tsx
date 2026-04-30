import { Banknote, Send } from "lucide-react";
import { publishExpenseReportAction } from "@/app/actions";
import { AppShell } from "@/components/app/app-shell";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { formatKzt, isLocale, localized, type Locale } from "@/lib/domain";
import { getDictionary } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { getDashboardData } from "@/lib/store";

export default async function FinancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const user = await requireUser(locale);
  const data = await getDashboardData(user);
  const dictionary = getDictionary(locale);
  const total = data.expenses.reduce((sum, expense) => sum + expense.amountKzt, 0);
  const published = data.expenses
    .filter((expense) => expense.status === "published")
    .reduce((sum, expense) => sum + expense.amountKzt, 0);

  return (
    <AppShell locale={locale} user={user}>
      <div className="grid gap-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{dictionary.finance.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{dictionary.finance.subtitle}</p>
          </div>
          {can(user.role, "finance:publish") ? (
            <form action={publishExpenseReportAction}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                {dictionary.actions.publishReport}
              </Button>
            </form>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                {dictionary.finance.report}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div>
                <p className="text-sm text-muted-foreground">Resident payments</p>
                <p className="mt-1 text-3xl font-semibold">{formatKzt(18_400_000)} KZT</p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{dictionary.status.published}</span>
                  <span>
                    {formatKzt(published)} / {formatKzt(total)} KZT
                  </span>
                </div>
                <Progress value={(published / total) * 100} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border p-3">
                  <p className="text-muted-foreground">Reserve</p>
                  <p className="mt-1 font-semibold">4.6M KZT</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-muted-foreground">Under review</p>
                  <p className="mt-1 font-semibold">2.8M KZT</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary.finance.vendor}</TableHead>
                      <TableHead>{dictionary.finance.category}</TableHead>
                      <TableHead>{dictionary.finance.amount}</TableHead>
                      <TableHead>{dictionary.documents.status}</TableHead>
                      <TableHead>{dictionary.finance.procurement}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expenses.map((expense) => {
                      const procurement = data.procurements.find((item) => item.id === expense.procurementId);
                      return (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <div className="font-medium">{expense.vendor}</div>
                            <div className="text-xs text-muted-foreground">{localized(expense.description, locale)}</div>
                          </TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{formatKzt(expense.amountKzt)} KZT</TableCell>
                          <TableCell>
                            <StatusBadge status={expense.status} locale={locale} />
                          </TableCell>
                          <TableCell>{procurement ? localized(procurement.title, locale) : "Direct utility"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.finance.procurement}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.procurements.map((procurement) => (
              <div key={procurement.id} className="grid gap-3 rounded-md border border-border p-4 md:grid-cols-5 md:items-center">
                <div className="md:col-span-2">
                  <p className="font-medium">{localized(procurement.title, locale)}</p>
                  <p className="text-sm text-muted-foreground">{procurement.vendor}</p>
                </div>
                <p className="text-sm">
                  {dictionary.finance.bidders}: <strong>{procurement.bidderCount}</strong>
                </p>
                <p className="text-sm">
                  {dictionary.finance.benchmark}: <strong>{formatKzt(procurement.benchmarkAmountKzt)} KZT</strong>
                </p>
                <p className="text-sm">
                  {dictionary.finance.contract}: <strong>{formatKzt(procurement.contractAmountKzt)} KZT</strong>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
