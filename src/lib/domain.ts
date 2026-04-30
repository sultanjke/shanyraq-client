export const locales = ["en", "ru", "kk"] as const;

export type Locale = (typeof locales)[number];
export type UserRole = "resident" | "manager" | "contractor" | "auditor";
export type DocumentStatus = "draft" | "review" | "verified" | "blocked";
export type RiskSeverity = "info" | "review" | "critical" | "resolved";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";
export type VoteChoice = "yes" | "no";

export type LocalizedText = Record<Locale, string>;

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  transparencyScore: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  unit?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit?: string;
}

export interface RiskFlag {
  id: string;
  buildingId: string;
  code: string;
  title: LocalizedText;
  severity: RiskSeverity;
  explanation: LocalizedText;
  owner: string;
  sourceEntityType: string;
  sourceEntityId: string;
  status: RiskSeverity;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNo: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  sha256: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

export interface RepositoryDocument {
  id: string;
  buildingId: string;
  title: LocalizedText;
  category: string;
  authority: string;
  currentStatus: DocumentStatus;
  linkedRiskId?: string | null;
  externalRef?: string | null;
  createdAt: string;
  versions: DocumentVersion[];
}

export interface Procurement {
  id: string;
  buildingId: string;
  title: LocalizedText;
  vendor: string;
  bidderCount: number;
  benchmarkAmountKzt: number;
  contractAmountKzt: number;
  status: "open" | "awarded" | "review";
}

export interface Expense {
  id: string;
  buildingId: string;
  vendor: string;
  category: string;
  amountKzt: number;
  status: "draft" | "published" | "review";
  description: LocalizedText;
  procurementId?: string | null;
  approvalId?: string | null;
  publishedAt?: string | null;
}

export interface Approval {
  id: string;
  buildingId: string;
  title: LocalizedText;
  summary: LocalizedText;
  status: ApprovalStatus;
  quorumPercent: number;
  yesPercent: number;
  deadline: string;
}

export interface Vote {
  id: string;
  approvalId: string;
  userId: string;
  choice: VoteChoice;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  buildingId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | "system";
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  previousHash: string;
  eventHash: string;
  createdAt: string;
}

export interface DashboardData {
  building: Building;
  user: SessionUser;
  documents: RepositoryDocument[];
  risks: RiskFlag[];
  expenses: Expense[];
  procurements: Procurement[];
  approvals: Approval[];
  votes: Vote[];
  auditEvents: AuditEvent[];
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localized(value: LocalizedText, locale: Locale) {
  return value[locale] ?? value.en;
}

export function formatKzt(amount: number) {
  return new Intl.NumberFormat("en", {
    notation: amount >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: amount >= 1_000_000 ? 1 : 0,
  }).format(amount);
}
