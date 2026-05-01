import type { UserRole } from "@/lib/domain";

export type Permission =
  | "document:upload"
  | "document:verify"
  | "finance:publish"
  | "approval:create"
  | "approval:vote"
  | "risk:run"
  | "risk:resolve"
  | "audit:export"
  | "access:review";

const rolePermissions: Record<UserRole, Permission[]> = {
  resident: ["approval:vote", "audit:export"],
  manager: ["document:upload", "finance:publish", "approval:create", "audit:export", "access:review"],
  contractor: ["document:upload"],
  auditor: ["document:verify", "risk:run", "risk:resolve", "audit:export", "access:review"],
};

export function can(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function assertCan(role: UserRole, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error(`Role ${role} cannot perform ${permission}`);
  }
}
