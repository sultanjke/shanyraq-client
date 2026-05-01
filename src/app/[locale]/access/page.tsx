import { ShieldCheck, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import {
  approveRegistrationRequestAction,
  rejectRegistrationRequestAction,
} from "@/app/actions";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/lib/domain";
import { roleLabel } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { getRegistrationRequests } from "@/lib/store";

export default async function AccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const user = await requireUser(locale);
  if (!can(user.role, "access:review")) redirect(`/${locale}/dashboard`);

  const requests = await getRegistrationRequests();
  const pendingCount = requests.filter((request) => request.status === "pending").length;

  return (
    <AppShell locale={locale} user={user}>
      <div className="grid gap-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              Building membership
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Access requests</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review who can enter each apartment complex workspace. Approval creates the user account, building
              membership, and a hash-chain audit event.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {pendingCount} pending
          </Badge>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Membership queue
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-72">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        No access requests yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-xs text-muted-foreground">{request.email}</div>
                        {request.unit ? <div className="text-xs text-muted-foreground">Unit {request.unit}</div> : null}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.buildingName}</div>
                        <div className="text-xs text-muted-foreground">
                          {request.city}, {request.buildingAddress}
                        </div>
                      </TableCell>
                      <TableCell>{roleLabel(request.requestedRole, locale)}</TableCell>
                      <TableCell className="max-w-72">
                        <p className="line-clamp-3 text-sm text-muted-foreground">{request.evidenceNote}</p>
                        {request.organizationName ? (
                          <p className="mt-1 text-xs text-muted-foreground">{request.organizationName}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.status === "pending" ? "outline" : "secondary"}>{request.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" ? (
                          <div className="grid gap-2">
                            <form action={approveRegistrationRequestAction}>
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="requestId" value={request.id} />
                              <Button type="submit" size="sm" className="w-full">
                                Approve
                              </Button>
                            </form>
                            <form action={rejectRegistrationRequestAction} className="flex gap-2">
                              <input type="hidden" name="locale" value={locale} />
                              <input type="hidden" name="requestId" value={request.id} />
                              <Input name="reason" placeholder="Reason" className="h-8" />
                              <Button type="submit" size="sm" variant="outline">
                                Reject
                              </Button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "Reviewed"}
                          </span>
                        )}
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
