import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/db/client";
import {
  approvals as approvalsTable,
  auditEvents as auditEventsTable,
  buildings as buildingsTable,
  documentVersions as documentVersionsTable,
  documents as documentsTable,
  expenses as expensesTable,
  procurements as procurementsTable,
  riskFlags as riskFlagsTable,
  users as usersTable,
  votes as votesTable,
} from "@/db/schema";
import { appendAuditEvent, verifyAuditChain } from "@/lib/audit";
import type {
  Approval,
  AuditEvent,
  Building,
  DashboardData,
  DocumentStatus,
  DocumentVersion,
  Expense,
  LocalizedText,
  Procurement,
  RepositoryDocument,
  RiskFlag,
  SessionUser,
  User,
  Vote,
  VoteChoice,
} from "@/lib/domain";
import { dedupeRisks, runDocumentRiskRules, runProcurementRiskRules } from "@/lib/risk-engine";
import {
  cloneSeedState,
  DEMO_BUILDING_ID,
  seedApprovals,
  seedAuditEvents,
  seedBuilding,
  seedDocuments,
  seedExpenses,
  seedProcurements,
  seedRisks,
  seedUsers,
  seedVotes,
} from "@/lib/seed";

interface DemoState {
  building: Building;
  users: User[];
  documents: RepositoryDocument[];
  risks: RiskFlag[];
  procurements: Procurement[];
  expenses: Expense[];
  approvals: Approval[];
  votes: Vote[];
  auditEvents: AuditEvent[];
}

type StoreMode = "memory" | "postgres";

const globalForStore = globalThis as typeof globalThis & {
  __shanyraqDemoState?: DemoState;
  __shanyraqDbSeeded?: boolean;
};

function getMemoryState() {
  if (!globalForStore.__shanyraqDemoState) {
    globalForStore.__shanyraqDemoState = cloneSeedState();
  }

  return globalForStore.__shanyraqDemoState;
}

function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    unit: user.unit,
  };
}

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function asLocalized(value: unknown): LocalizedText {
  return value as LocalizedText;
}

function mapUser(row: typeof usersTable.$inferSelect): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as User["role"],
    passwordHash: row.passwordHash,
    unit: row.unit ?? undefined,
  };
}

function mapBuilding(row: typeof buildingsTable.$inferSelect): Building {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    transparencyScore: row.transparencyScore,
  };
}

function mapRisk(row: typeof riskFlagsTable.$inferSelect): RiskFlag {
  return {
    id: row.id,
    buildingId: row.buildingId,
    code: row.code,
    title: asLocalized(row.title),
    severity: row.severity as RiskFlag["severity"],
    status: row.status as RiskFlag["status"],
    explanation: asLocalized(row.explanation),
    owner: row.owner,
    sourceEntityType: row.sourceEntityType,
    sourceEntityId: row.sourceEntityId,
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
    resolvedAt: iso(row.resolvedAt),
  };
}

function mapProcurement(row: typeof procurementsTable.$inferSelect): Procurement {
  return {
    id: row.id,
    buildingId: row.buildingId,
    title: asLocalized(row.title),
    vendor: row.vendor,
    bidderCount: row.bidderCount,
    benchmarkAmountKzt: row.benchmarkAmountKzt,
    contractAmountKzt: row.contractAmountKzt,
    status: row.status as Procurement["status"],
  };
}

function mapExpense(row: typeof expensesTable.$inferSelect): Expense {
  return {
    id: row.id,
    buildingId: row.buildingId,
    vendor: row.vendor,
    category: row.category,
    amountKzt: row.amountKzt,
    status: row.status as Expense["status"],
    description: asLocalized(row.description),
    procurementId: row.procurementId,
    approvalId: row.approvalId,
    publishedAt: iso(row.publishedAt),
  };
}

function mapApproval(row: typeof approvalsTable.$inferSelect): Approval {
  return {
    id: row.id,
    buildingId: row.buildingId,
    title: asLocalized(row.title),
    summary: asLocalized(row.summary),
    status: row.status as Approval["status"],
    quorumPercent: row.quorumPercent,
    yesPercent: row.yesPercent,
    deadline: iso(row.deadline) ?? new Date().toISOString(),
  };
}

function mapVote(row: typeof votesTable.$inferSelect): Vote {
  return {
    id: row.id,
    approvalId: row.approvalId,
    userId: row.userId,
    choice: row.choice as VoteChoice,
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
  };
}

function mapAudit(row: typeof auditEventsTable.$inferSelect): AuditEvent {
  return {
    id: row.id,
    buildingId: row.buildingId,
    actorId: row.actorId,
    actorName: row.actorName,
    actorRole: row.actorRole as AuditEvent["actorRole"],
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    metadata: row.metadata as Record<string, unknown>,
    previousHash: row.previousHash,
    eventHash: row.eventHash,
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
  };
}

function mapVersion(row: typeof documentVersionsTable.$inferSelect): DocumentVersion {
  return {
    id: row.id,
    documentId: row.documentId,
    versionNo: row.versionNo,
    fileName: row.fileName,
    fileUrl: row.fileUrl,
    fileSize: row.fileSize,
    sha256: row.sha256,
    status: row.status as DocumentStatus,
    uploadedBy: row.uploadedBy,
    uploadedByName: row.uploadedByName,
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
  };
}

function mapDocument(
  row: typeof documentsTable.$inferSelect,
  versions: DocumentVersion[],
): RepositoryDocument {
  return {
    id: row.id,
    buildingId: row.buildingId,
    title: asLocalized(row.title),
    category: row.category,
    authority: row.authority,
    currentStatus: row.currentStatus as DocumentStatus,
    linkedRiskId: row.linkedRiskId,
    externalRef: row.externalRef,
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
    versions,
  };
}

async function ensureDatabaseSeeded() {
  if (!hasDatabaseUrl() || globalForStore.__shanyraqDbSeeded) return;

  const db = getDb();
  const existing = await db.select({ id: buildingsTable.id }).from(buildingsTable).limit(1);
  if (existing.length > 0) {
    globalForStore.__shanyraqDbSeeded = true;
    return;
  }

  await db.insert(buildingsTable).values(seedBuilding);
  await db.insert(usersTable).values(seedUsers);
  await db.insert(documentsTable).values(
    seedDocuments.map((document) => ({
      id: document.id,
      buildingId: document.buildingId,
      title: document.title,
      category: document.category,
      authority: document.authority,
      currentStatus: document.currentStatus,
      linkedRiskId: document.linkedRiskId,
      externalRef: document.externalRef,
      createdAt: new Date(document.createdAt),
    })),
  );
  await db.insert(documentVersionsTable).values(
    seedDocuments.flatMap((document) =>
      document.versions.map((version) => ({
        ...version,
        createdAt: new Date(version.createdAt),
      })),
    ),
  );
  await db.insert(procurementsTable).values(seedProcurements);
  await db.insert(expensesTable).values(
    seedExpenses.map((expense) => ({
      ...expense,
      publishedAt: expense.publishedAt ? new Date(expense.publishedAt) : null,
    })),
  );
  await db.insert(approvalsTable).values(
    seedApprovals.map((approval) => ({
      ...approval,
      deadline: new Date(approval.deadline),
    })),
  );
  await db.insert(votesTable).values(seedVotes.map((vote) => ({ ...vote, createdAt: new Date(vote.createdAt) })));
  await db.insert(riskFlagsTable).values(
    seedRisks.map((risk) => ({
      ...risk,
      createdAt: new Date(risk.createdAt),
      resolvedAt: risk.resolvedAt ? new Date(risk.resolvedAt) : null,
    })),
  );
  await db.insert(auditEventsTable).values(
    seedAuditEvents.map((event) => ({
      ...event,
      createdAt: new Date(event.createdAt),
    })),
  );

  globalForStore.__shanyraqDbSeeded = true;
}

async function getMode(): Promise<StoreMode> {
  if (!hasDatabaseUrl()) return "memory";

  await ensureDatabaseSeeded();
  return "postgres";
}

export async function getUserByEmail(email: string) {
  if ((await getMode()) === "memory") {
    return getMemoryState().users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  const rows = await getDb().select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function getUserById(id: string) {
  if ((await getMode()) === "memory") {
    const user = getMemoryState().users.find((item) => item.id === id);
    return user ? toSessionUser(user) : null;
  }

  const rows = await getDb().select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return rows[0] ? toSessionUser(mapUser(rows[0])) : null;
}

export async function getDashboardData(user: SessionUser): Promise<DashboardData> {
  if ((await getMode()) === "memory") {
    const state = getMemoryState();
    return {
      building: state.building,
      user,
      documents: state.documents,
      risks: state.risks,
      procurements: state.procurements,
      expenses: state.expenses,
      approvals: state.approvals,
      votes: state.votes,
      auditEvents: [...state.auditEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }

  const db = getDb();
  const [buildingRow] = await db.select().from(buildingsTable).where(eq(buildingsTable.id, DEMO_BUILDING_ID)).limit(1);
  const documentRows = await db.select().from(documentsTable).where(eq(documentsTable.buildingId, DEMO_BUILDING_ID));
  const versionRows = await db.select().from(documentVersionsTable);

  return {
    building: mapBuilding(buildingRow),
    user,
    documents: documentRows.map((document) =>
      mapDocument(
        document,
        versionRows
          .filter((version) => version.documentId === document.id)
          .map(mapVersion)
          .sort((a, b) => b.versionNo - a.versionNo),
      ),
    ),
    risks: (await db.select().from(riskFlagsTable).where(eq(riskFlagsTable.buildingId, DEMO_BUILDING_ID))).map(mapRisk),
    procurements: (
      await db.select().from(procurementsTable).where(eq(procurementsTable.buildingId, DEMO_BUILDING_ID))
    ).map(mapProcurement),
    expenses: (await db.select().from(expensesTable).where(eq(expensesTable.buildingId, DEMO_BUILDING_ID))).map(
      mapExpense,
    ),
    approvals: (await db.select().from(approvalsTable).where(eq(approvalsTable.buildingId, DEMO_BUILDING_ID))).map(
      mapApproval,
    ),
    votes: (await db.select().from(votesTable)).map(mapVote),
    auditEvents: (
      await db
        .select()
        .from(auditEventsTable)
        .where(eq(auditEventsTable.buildingId, DEMO_BUILDING_ID))
        .orderBy(desc(auditEventsTable.createdAt))
    ).map(mapAudit),
  };
}

export async function addAuditEvent(
  actor: SessionUser | { id: string; name: string; role: "system" },
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  const input = {
    id: randomUUID(),
    buildingId: DEMO_BUILDING_ID,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    metadata,
    createdAt: new Date().toISOString(),
  };

  if ((await getMode()) === "memory") {
    const state = getMemoryState();
    const event = appendAuditEvent(state.auditEvents, input);
    state.auditEvents.push(event);
    return event;
  }

  const db = getDb();
  const existing = (await db.select().from(auditEventsTable).orderBy(desc(auditEventsTable.createdAt))).map(mapAudit);
  const event = appendAuditEvent(existing, input);
  await db.insert(auditEventsTable).values({
    ...event,
    createdAt: new Date(event.createdAt),
  });
  return event;
}

export async function uploadDocumentVersion(input: {
  documentId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  sha256: string;
  uploadedBy: SessionUser;
}) {
  const versionId = randomUUID();

  if ((await getMode()) === "memory") {
    const state = getMemoryState();
    const document = state.documents.find((item) => item.id === input.documentId);
    if (!document) throw new Error("Document not found.");

    const version: DocumentVersion = {
      id: versionId,
      documentId: input.documentId,
      versionNo: Math.max(...document.versions.map((item) => item.versionNo), 0) + 1,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      sha256: input.sha256,
      status: "review",
      uploadedBy: input.uploadedBy.id,
      uploadedByName: input.uploadedBy.name,
      createdAt: new Date().toISOString(),
    };
    document.versions.unshift(version);
    document.currentStatus = "review";
    await addAuditEvent(input.uploadedBy, `Uploaded ${input.fileName}`, "document", input.documentId, {
      sha256: input.sha256,
      versionNo: version.versionNo,
    });
    return version;
  }

  const db = getDb();
  const existingVersions = await db
    .select()
    .from(documentVersionsTable)
    .where(eq(documentVersionsTable.documentId, input.documentId));
  const versionNo = Math.max(...existingVersions.map((item) => item.versionNo), 0) + 1;
  await db.insert(documentVersionsTable).values({
    id: versionId,
    documentId: input.documentId,
    versionNo,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    fileSize: input.fileSize,
    sha256: input.sha256,
    status: "review",
    uploadedBy: input.uploadedBy.id,
    uploadedByName: input.uploadedBy.name,
    createdAt: new Date(),
  });
  await db
    .update(documentsTable)
    .set({ currentStatus: "review" })
    .where(eq(documentsTable.id, input.documentId));
  await addAuditEvent(input.uploadedBy, `Uploaded ${input.fileName}`, "document", input.documentId, {
    sha256: input.sha256,
    versionNo,
  });
}

export async function verifyDocument(documentId: string, actor: SessionUser) {
  if ((await getMode()) === "memory") {
    const document = getMemoryState().documents.find((item) => item.id === documentId);
    if (!document) throw new Error("Document not found.");
    document.currentStatus = "verified";
    document.versions[0].status = "verified";
    await addAuditEvent(actor, `Verified ${document.title.en}`, "document", document.id);
    return;
  }

  const db = getDb();
  await db.update(documentsTable).set({ currentStatus: "verified" }).where(eq(documentsTable.id, documentId));
  const versions = await db.select().from(documentVersionsTable).where(eq(documentVersionsTable.documentId, documentId));
  const latest = versions.sort((a, b) => b.versionNo - a.versionNo)[0];
  if (latest) {
    await db.update(documentVersionsTable).set({ status: "verified" }).where(eq(documentVersionsTable.id, latest.id));
  }
  await addAuditEvent(actor, "Verified document", "document", documentId);
}

export async function publishExpenseReport(actor: SessionUser) {
  const publishedAt = new Date().toISOString();

  if ((await getMode()) === "memory") {
    getMemoryState().expenses.forEach((expense) => {
      if (expense.status !== "published") {
        expense.status = "published";
        expense.publishedAt = publishedAt;
      }
    });
    await addAuditEvent(actor, "Published monthly financial report", "finance", DEMO_BUILDING_ID);
    return;
  }

  await getDb()
    .update(expensesTable)
    .set({ status: "published", publishedAt: new Date(publishedAt) })
    .where(eq(expensesTable.buildingId, DEMO_BUILDING_ID));
  await addAuditEvent(actor, "Published monthly financial report", "finance", DEMO_BUILDING_ID);
}

export async function createApproval(actor: SessionUser, title: string, summary: string) {
  const approval: Approval = {
    id: randomUUID(),
    buildingId: DEMO_BUILDING_ID,
    title: { en: title, ru: title, kk: title },
    summary: { en: summary, ru: summary, kk: summary },
    status: "pending",
    quorumPercent: 60,
    yesPercent: 0,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  if ((await getMode()) === "memory") {
    getMemoryState().approvals.unshift(approval);
    await addAuditEvent(actor, `Created approval: ${title}`, "approval", approval.id);
    return approval;
  }

  await getDb().insert(approvalsTable).values({
    ...approval,
    deadline: new Date(approval.deadline),
  });
  await addAuditEvent(actor, `Created approval: ${title}`, "approval", approval.id);
  return approval;
}

export async function castVote(actor: SessionUser, approvalId: string, choice: VoteChoice) {
  if ((await getMode()) === "memory") {
    const state = getMemoryState();
    if (state.votes.some((vote) => vote.approvalId === approvalId && vote.userId === actor.id)) {
      return;
    }

    const approval = state.approvals.find((item) => item.id === approvalId);
    if (!approval || approval.status !== "pending") return;

    state.votes.push({
      id: randomUUID(),
      approvalId,
      userId: actor.id,
      choice,
      createdAt: new Date().toISOString(),
    });
    if (choice === "yes") {
      approval.yesPercent = Math.min(100, approval.yesPercent + 4);
      if (approval.yesPercent >= approval.quorumPercent) approval.status = "approved";
    }
    await addAuditEvent(actor, `Voted ${choice} on ${approval.title.en}`, "approval", approval.id, { choice });
    return;
  }

  const db = getDb();
  const existing = await db.select().from(votesTable).where(eq(votesTable.approvalId, approvalId));
  if (existing.some((vote) => vote.userId === actor.id)) return;

  const [approvalRow] = await db.select().from(approvalsTable).where(eq(approvalsTable.id, approvalId)).limit(1);
  if (!approvalRow || approvalRow.status !== "pending") return;

  await db.insert(votesTable).values({
    id: randomUUID(),
    approvalId,
    userId: actor.id,
    choice,
    createdAt: new Date(),
  });
  const nextYes = choice === "yes" ? Math.min(100, approvalRow.yesPercent + 4) : approvalRow.yesPercent;
  await db
    .update(approvalsTable)
    .set({ yesPercent: nextYes, status: nextYes >= approvalRow.quorumPercent ? "approved" : "pending" })
    .where(eq(approvalsTable.id, approvalId));
  await addAuditEvent(actor, `Voted ${choice} on approval`, "approval", approvalId, { choice });
}

export async function runRiskChecks(actor: SessionUser) {
  const data = await getDashboardData(actor);
  const generated = [
    ...runDocumentRiskRules(data.building.id, data.documents),
    ...runProcurementRiskRules(data.building.id, data.procurements),
  ];
  const freshRisks = dedupeRisks(data.risks, generated);

  if (freshRisks.length === 0) {
    await addAuditEvent(actor, "Ran consistency checks with no new risks", "risk", data.building.id);
    return [];
  }

  if ((await getMode()) === "memory") {
    getMemoryState().risks.unshift(...freshRisks);
  } else {
    await getDb().insert(riskFlagsTable).values(
      freshRisks.map((risk) => ({
        ...risk,
        createdAt: new Date(risk.createdAt),
        resolvedAt: risk.resolvedAt ? new Date(risk.resolvedAt) : null,
      })),
    );
  }

  await addAuditEvent(actor, `Ran consistency checks and opened ${freshRisks.length} risks`, "risk", data.building.id, {
    newRisks: freshRisks.map((risk) => risk.code),
  });
  return freshRisks;
}

export async function auditIntegrity(user: SessionUser) {
  const { auditEvents } = await getDashboardData(user);
  return verifyAuditChain(auditEvents);
}

export async function exportAuditLines(user: SessionUser) {
  const { auditEvents } = await getDashboardData(user);
  return auditEvents
    .map((event) =>
      [event.createdAt, event.actorRole, event.actorName, event.action, event.entityType, event.entityId, event.eventHash].join(
        " | ",
      ),
    )
    .join("\n");
}
