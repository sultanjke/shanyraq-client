import { Link2, ShieldCheck } from "lucide-react";
import { AuditExportButton } from "@/components/app/audit-export-button";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/domain";
import { getDictionary, roleLabel } from "@/lib/i18n";
import { auditIntegrity, getDashboardData } from "@/lib/store";

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const user = await requireUser(locale);
  const data = await getDashboardData(user);
  const dictionary = getDictionary(locale);
  const valid = await auditIntegrity(user);

  return (
    <AppShell locale={locale} user={user}>
      <div className="grid gap-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{dictionary.audit.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{dictionary.audit.subtitle}</p>
          </div>
          <AuditExportButton locale={locale} label={dictionary.actions.exportLog} />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {dictionary.audit.integrity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  valid
                    ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200"
                    : "rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200"
                }
              >
                {valid ? dictionary.audit.valid : dictionary.audit.invalid}
              </span>
              <span className="text-muted-foreground">Events: {data.auditEvents.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>{dictionary.audit.actor}</TableHead>
                    <TableHead>{dictionary.audit.action}</TableHead>
                    <TableHead>{dictionary.audit.entity}</TableHead>
                    <TableHead>{dictionary.audit.previousHash}</TableHead>
                    <TableHead>{dictionary.audit.eventHash}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.auditEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {new Date(event.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.actorName}</div>
                        <div className="text-xs text-muted-foreground">{roleLabel(event.actorRole, locale)}</div>
                      </TableCell>
                      <TableCell>{event.action}</TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="ghost" className="gap-2 px-0">
                          <span>
                            <Link2 className="h-3.5 w-3.5" />
                            {event.entityType}
                          </span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <code className="block max-w-36 truncate font-mono text-xs text-muted-foreground">
                          {event.previousHash}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="block max-w-36 truncate font-mono text-xs text-muted-foreground">
                          {event.eventHash}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
