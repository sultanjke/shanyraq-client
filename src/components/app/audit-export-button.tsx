"use client";

import { Download } from "lucide-react";
import { useState, useTransition } from "react";
import { exportAuditLogAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/domain";

export function AuditExportButton({ locale, label }: { locale: Locale; label: string }) {
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-fit gap-2"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setContent(await exportAuditLogAction(locale));
          })
        }
      >
        <Download className="h-4 w-4" />
        {label}
      </Button>
      {content ? <Textarea readOnly value={content} className="min-h-36 font-mono text-xs" /> : null}
    </div>
  );
}
