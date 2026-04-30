import { describe, expect, it } from "vitest";
import { appendAuditEvent, verifyAuditChain } from "@/lib/audit";
import { DEMO_BUILDING_ID, seedAuditEvents, seedUsers } from "@/lib/seed";

describe("audit hash chain", () => {
  it("validates the seeded audit chain", () => {
    expect(verifyAuditChain(seedAuditEvents)).toBe(true);
  });

  it("detects modified previous events", () => {
    const tampered = structuredClone(seedAuditEvents);
    tampered[0].action = "Changed after the fact";

    expect(verifyAuditChain(tampered)).toBe(false);
  });

  it("links new events to the previous event hash", () => {
    const event = appendAuditEvent(seedAuditEvents, {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      buildingId: DEMO_BUILDING_ID,
      actorId: seedUsers[3].id,
      actorName: seedUsers[3].name,
      actorRole: "auditor",
      action: "Verified document",
      entityType: "document",
      entityId: "doc-1",
      createdAt: "2026-05-01T12:00:00.000Z",
    });

    expect(event.previousHash).toBe(seedAuditEvents.at(-1)?.eventHash);
    expect(verifyAuditChain([...seedAuditEvents, event])).toBe(true);
  });
});
