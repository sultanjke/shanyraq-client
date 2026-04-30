import { Check, Plus, Vote } from "lucide-react";
import { castVoteAction, createApprovalAction } from "@/app/actions";
import { AppShell } from "@/components/app/app-shell";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { isLocale, localized, type Locale } from "@/lib/domain";
import { getDictionary } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { getDashboardData } from "@/lib/store";

export default async function ApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const user = await requireUser(locale);
  const data = await getDashboardData(user);
  const dictionary = getDictionary(locale);

  return (
    <AppShell locale={locale} user={user}>
      <div className="grid gap-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">{dictionary.approvals.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{dictionary.approvals.subtitle}</p>
        </section>

        {can(user.role, "approval:create") ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {dictionary.actions.createApproval}
              </CardTitle>
              <CardDescription>New approvals are localized by mirroring the submitted text in all MVP languages.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createApprovalAction} className="grid gap-4">
                <input type="hidden" name="locale" value={locale} />
                <div className="grid gap-2">
                  <Label htmlFor="title">{dictionary.approvals.decisionTitle}</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="summary">{dictionary.approvals.decisionSummary}</Label>
                  <Textarea id="summary" name="summary" required />
                </div>
                <Button type="submit" className="w-fit">{dictionary.actions.createApproval}</Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.approvals.map((approval) => {
            const vote = data.votes.find((item) => item.approvalId === approval.id && item.userId === user.id);
            const canVote = can(user.role, "approval:vote") && approval.status === "pending" && !vote;
            return (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{localized(approval.title, locale)}</CardTitle>
                    <StatusBadge status={approval.status} locale={locale} />
                  </div>
                  <CardDescription>{localized(approval.summary, locale)}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>
                        {approval.yesPercent}% {dictionary.approvals.yes}
                      </span>
                      <span>
                        {dictionary.approvals.quorum}: {approval.quorumPercent}%
                      </span>
                    </div>
                    <Progress value={approval.yesPercent} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dictionary.approvals.deadline}: {new Date(approval.deadline).toLocaleDateString()}
                  </div>
                  {vote ? (
                    <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                      <Check className="h-4 w-4" />
                      {dictionary.approvals.alreadyVoted}: {vote.choice}
                    </div>
                  ) : null}
                  {canVote ? (
                    <div className="flex gap-2">
                      <form action={castVoteAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="approvalId" value={approval.id} />
                        <input type="hidden" name="choice" value="yes" />
                        <Button type="submit" size="sm" className="gap-2">
                          <Vote className="h-4 w-4" />
                          {dictionary.actions.voteYes}
                        </Button>
                      </form>
                      <form action={castVoteAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="approvalId" value={approval.id} />
                        <input type="hidden" name="choice" value="no" />
                        <Button type="submit" size="sm" variant="outline">
                          {dictionary.actions.voteNo}
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
