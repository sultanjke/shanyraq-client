import { FileUp } from "lucide-react";
import { uploadDocumentVersionAction, verifyDocumentAction } from "@/app/actions";
import { AppShell } from "@/components/app/app-shell";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { isLocale, localized, type Locale } from "@/lib/domain";
import { getDictionary } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { getDashboardData } from "@/lib/store";

export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const user = await requireUser(locale);
  const data = await getDashboardData(user);
  const dictionary = getDictionary(locale);

  return (
    <AppShell locale={locale} user={user}>
      <div className="grid gap-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">{dictionary.documents.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{dictionary.documents.subtitle}</p>
        </section>

        {can(user.role, "document:upload") ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                {dictionary.actions.upload}
              </CardTitle>
              <CardDescription>Files are stored in Vercel Blob when configured, otherwise locally for demo mode.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={uploadDocumentVersionAction} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <input type="hidden" name="locale" value={locale} />
                <div className="grid gap-2">
                  <Label htmlFor="documentId">{dictionary.documents.chooseDocument}</Label>
                  <select
                    id="documentId"
                    name="documentId"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {data.documents.map((document) => (
                      <option key={document.id} value={document.id}>
                        {localized(document.title, locale)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">{dictionary.documents.file}</Label>
                  <Input id="file" name="file" type="file" required />
                </div>
                <Button type="submit">{dictionary.actions.upload}</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dictionary.documents.document}</TableHead>
                    <TableHead>{dictionary.documents.authority}</TableHead>
                    <TableHead>{dictionary.documents.version}</TableHead>
                    <TableHead>{dictionary.documents.status}</TableHead>
                    <TableHead>{dictionary.documents.linkedRisk}</TableHead>
                    <TableHead>{dictionary.documents.hash}</TableHead>
                    <TableHead className="text-right">{dictionary.documents.action}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.documents.map((document) => {
                    const latest = document.versions[0];
                    const risk = data.risks.find((item) => item.id === document.linkedRiskId);
                    return (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="font-medium">{localized(document.title, locale)}</div>
                          <div className="text-xs text-muted-foreground">{document.externalRef}</div>
                        </TableCell>
                        <TableCell>{document.authority}</TableCell>
                        <TableCell>v{latest?.versionNo ?? 0}</TableCell>
                        <TableCell>
                          <StatusBadge status={document.currentStatus} locale={locale} />
                        </TableCell>
                        <TableCell>{risk ? localized(risk.title, locale) : "None"}</TableCell>
                        <TableCell>
                          <code className="block max-w-40 truncate font-mono text-xs text-muted-foreground">
                            {latest?.sha256}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          {can(user.role, "document:verify") && document.currentStatus !== "verified" ? (
                            <form action={verifyDocumentAction}>
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="documentId" value={document.id} />
                              <Button type="submit" size="sm" variant="secondary">
                                {dictionary.actions.verify}
                              </Button>
                            </form>
                          ) : latest ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={latest.fileUrl}>{dictionary.documents.file}</a>
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
