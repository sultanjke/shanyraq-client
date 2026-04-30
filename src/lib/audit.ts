import { createHash } from "node:crypto";
import type { AuditEvent, UserRole } from "@/lib/domain";

const GENESIS_HASH = "0".repeat(64);

export interface AuditInput {
  id: string;
  buildingId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | "system";
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function computeAuditHash(event: Omit<AuditEvent, "eventHash">) {
  return createHash("sha256").update(canonicalJson(event)).digest("hex");
}

export function buildAuditEvent(input: AuditInput, previousHash = GENESIS_HASH): AuditEvent {
  const eventWithoutHash = {
    ...input,
    metadata: input.metadata ?? {},
    previousHash,
  };

  return {
    ...eventWithoutHash,
    eventHash: computeAuditHash(eventWithoutHash),
  };
}

export function appendAuditEvent(events: AuditEvent[], input: AuditInput) {
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const previousHash = sorted.at(-1)?.eventHash ?? GENESIS_HASH;
  return buildAuditEvent(input, previousHash);
}

export function verifyAuditChain(events: AuditEvent[]) {
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return sorted.every((event, index) => {
    const expectedPrevious = index === 0 ? GENESIS_HASH : sorted[index - 1].eventHash;
    const eventWithoutHash: Omit<AuditEvent, "eventHash"> = {
      id: event.id,
      buildingId: event.buildingId,
      actorId: event.actorId,
      actorName: event.actorName,
      actorRole: event.actorRole,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      metadata: event.metadata,
      previousHash: event.previousHash,
      createdAt: event.createdAt,
    };
    const expectedHash = computeAuditHash(eventWithoutHash);

    return event.previousHash === expectedPrevious && event.eventHash === expectedHash;
  });
}

export { GENESIS_HASH };
