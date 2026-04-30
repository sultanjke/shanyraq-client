import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const buildings = pgTable("buildings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  transparencyScore: integer("transparency_score").notNull().default(75),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  passwordHash: text("password_hash").notNull(),
  unit: text("unit"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    buildingId: uuid("building_id")
      .notNull()
      .references(() => buildings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    unit: text("unit"),
    ownershipShare: numeric("ownership_share", { precision: 6, scale: 3 }),
  },
  (table) => [uniqueIndex("membership_building_user_idx").on(table.buildingId, table.userId)],
);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  title: jsonb("title").notNull(),
  category: text("category").notNull(),
  authority: text("authority").notNull(),
  currentStatus: text("current_status").notNull(),
  linkedRiskId: uuid("linked_risk_id"),
  externalRef: text("external_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  versionNo: integer("version_no").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  sha256: text("sha256").notNull(),
  status: text("status").notNull(),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id),
  uploadedByName: text("uploaded_by_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const procurements = pgTable("procurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  title: jsonb("title").notNull(),
  vendor: text("vendor").notNull(),
  bidderCount: integer("bidder_count").notNull(),
  benchmarkAmountKzt: integer("benchmark_amount_kzt").notNull(),
  contractAmountKzt: integer("contract_amount_kzt").notNull(),
  status: text("status").notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  vendor: text("vendor").notNull(),
  category: text("category").notNull(),
  amountKzt: integer("amount_kzt").notNull(),
  status: text("status").notNull(),
  description: jsonb("description").notNull(),
  procurementId: uuid("procurement_id").references(() => procurements.id),
  approvalId: uuid("approval_id"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  title: jsonb("title").notNull(),
  summary: jsonb("summary").notNull(),
  status: text("status").notNull(),
  quorumPercent: integer("quorum_percent").notNull(),
  yesPercent: integer("yes_percent").notNull(),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
});

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    approvalId: uuid("approval_id")
      .notNull()
      .references(() => approvals.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    choice: text("choice").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("vote_approval_user_idx").on(table.approvalId, table.userId)],
);

export const riskFlags = pgTable("risk_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  title: jsonb("title").notNull(),
  severity: text("severity").notNull(),
  explanation: jsonb("explanation").notNull(),
  owner: text("owner").notNull(),
  sourceEntityType: text("source_entity_type").notNull(),
  sourceEntityId: text("source_entity_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").notNull(),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata").notNull(),
  previousHash: text("previous_hash").notNull(),
  eventHash: text("event_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const buildingRelations = relations(buildings, ({ many }) => ({
  documents: many(documents),
  expenses: many(expenses),
  procurements: many(procurements),
  approvals: many(approvals),
  risks: many(riskFlags),
  auditEvents: many(auditEvents),
}));

export const documentRelations = relations(documents, ({ many }) => ({
  versions: many(documentVersions),
}));
