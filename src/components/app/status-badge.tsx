import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus, DocumentStatus, Locale, RiskSeverity } from "@/lib/domain";
import { statusLabel } from "@/lib/i18n";

const statusTone: Record<string, string> = {
  verified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  review: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  draft: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  blocked: "border-red-500/30 bg-red-500/10 text-red-200",
  critical: "border-red-500/30 bg-red-500/10 text-red-200",
  rejected: "border-red-500/30 bg-red-500/10 text-red-200",
  expired: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

export function StatusBadge({
  status,
  locale,
}: {
  status: DocumentStatus | RiskSeverity | ApprovalStatus | "draft" | "published" | "open" | "awarded";
  locale: Locale;
}) {
  return (
    <Badge variant="outline" className={statusTone[status] ?? "border-border text-muted-foreground"}>
      {statusLabel(status, locale)}
    </Badge>
  );
}
