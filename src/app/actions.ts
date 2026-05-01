"use server";

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSession, requireUser, setSession } from "@/lib/auth";
import { isLocale, type Locale, type SessionUser, type VoteChoice } from "@/lib/domain";
import { assertCan } from "@/lib/permissions";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  approveRegistrationRequest,
  castVote,
  createApproval,
  exportAuditLines,
  getUserByEmail,
  publishExpenseReport,
  rejectRegistrationRequest,
  runRiskChecks,
  submitRegistrationRequest,
  uploadDocumentVersion,
  verifyDocument,
} from "@/lib/store";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  locale: z.string().default("en"),
});

const roleSchema = z.enum(["resident", "manager", "contractor", "auditor"]);

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  requestedRole: roleSchema,
  buildingId: z.string().trim().optional(),
  buildingName: z.string().trim().min(2),
  buildingAddress: z.string().trim().min(2),
  city: z.string().trim().min(2),
  unit: z.string().trim().optional(),
  organizationName: z.string().trim().optional(),
  evidenceNote: z.string().trim().min(10),
  locale: z.string().default("en"),
});

function formLocale(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "en");
  return isLocale(value) ? value : "en";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").toLowerCase();
}

async function saveUpload(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const fileName = safeFileName(file.name || "document.bin");

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`documents/${Date.now()}-${fileName}`, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return { fileName, fileUrl: blob.url, fileSize: buffer.length, sha256 };
  }

  if (process.env.NODE_ENV !== "production") {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const localName = `${Date.now()}-${fileName}`;
    await writeFile(path.join(uploadDir, localName), buffer);
    return { fileName, fileUrl: `/uploads/${localName}`, fileSize: buffer.length, sha256 };
  }

  return {
    fileName,
    fileUrl: `demo-upload://${sha256}/${fileName}`,
    fileSize: buffer.length,
    sha256,
  };
}

async function actor(locale: Locale): Promise<SessionUser> {
  return requireUser(locale);
}

export async function signInAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
  });

  const locale = parsed.success && isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  if (!parsed.success) redirect(`/${locale}/login?error=1`);

  const user = await getUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    redirect(`/${locale}/login?error=1`);
  }

  await setSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    unit: user.unit,
  });
  redirect(`/${locale}/dashboard`);
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    requestedRole: formData.get("requestedRole"),
    buildingId: formData.get("buildingId"),
    buildingName: formData.get("buildingName"),
    buildingAddress: formData.get("buildingAddress"),
    city: formData.get("city"),
    unit: formData.get("unit"),
    organizationName: formData.get("organizationName"),
    evidenceNote: formData.get("evidenceNote"),
    locale: formData.get("locale"),
  });

  const locale = parsed.success && isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  if (!parsed.success) redirect(`/${locale}/register?error=validation`);

  try {
    await submitRegistrationRequest({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      requestedRole: parsed.data.requestedRole,
      buildingId: parsed.data.buildingId && parsed.data.buildingId !== "new" ? parsed.data.buildingId : null,
      buildingName: parsed.data.buildingName,
      buildingAddress: parsed.data.buildingAddress,
      city: parsed.data.city,
      unit: parsed.data.unit || null,
      organizationName: parsed.data.organizationName || null,
      evidenceNote: parsed.data.evidenceNote,
    });
  } catch {
    redirect(`/${locale}/register?error=duplicate`);
  }

  redirect(`/${locale}/login?registered=1`);
}

export async function signOutAction(formData: FormData) {
  const locale = formLocale(formData);
  await clearSession();
  redirect(`/${locale}/login`);
}

export async function uploadDocumentVersionAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "document:upload");

  const documentId = String(formData.get("documentId") ?? "");
  const file = formData.get("file");
  if (!documentId || !(file instanceof File) || file.size === 0) {
    redirect(`/${locale}/documents?error=upload`);
  }

  const saved = await saveUpload(file);
  await uploadDocumentVersion({ documentId, uploadedBy: user, ...saved });
  revalidatePath(`/${locale}/documents`);
  redirect(`/${locale}/documents?uploaded=1`);
}

export async function verifyDocumentAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "document:verify");

  const documentId = String(formData.get("documentId") ?? "");
  if (documentId) {
    await verifyDocument(documentId, user);
  }
  revalidatePath(`/${locale}/documents`);
  redirect(`/${locale}/documents?verified=1`);
}

export async function publishExpenseReportAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "finance:publish");

  await publishExpenseReport(user);
  revalidatePath(`/${locale}/finance`);
  redirect(`/${locale}/finance?published=1`);
}

export async function runRiskChecksAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "risk:run");

  await runRiskChecks(user);
  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard?checked=1`);
}

export async function createApprovalAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "approval:create");

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (title && summary) {
    await createApproval(user, title, summary);
  }
  revalidatePath(`/${locale}/approvals`);
  redirect(`/${locale}/approvals?created=1`);
}

export async function castVoteAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "approval:vote");

  const approvalId = String(formData.get("approvalId") ?? "");
  const choice = String(formData.get("choice") ?? "yes") as VoteChoice;
  if (approvalId && (choice === "yes" || choice === "no")) {
    await castVote(user, approvalId, choice);
  }
  revalidatePath(`/${locale}/approvals`);
  redirect(`/${locale}/approvals?voted=1`);
}

export async function exportAuditLogAction(locale: Locale) {
  const user = await actor(locale);
  assertCan(user.role, "audit:export");
  return exportAuditLines(user);
}

export async function approveRegistrationRequestAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "access:review");

  const requestId = String(formData.get("requestId") ?? "");
  if (requestId) {
    await approveRegistrationRequest(requestId, user);
  }
  revalidatePath(`/${locale}/access`);
  revalidatePath(`/${locale}/audit`);
  redirect(`/${locale}/access?reviewed=1`);
}

export async function rejectRegistrationRequestAction(formData: FormData) {
  const locale = formLocale(formData);
  const user = await actor(locale);
  assertCan(user.role, "access:review");

  const requestId = String(formData.get("requestId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || "Access evidence was not sufficient.";
  if (requestId) {
    await rejectRegistrationRequest(requestId, user, reason);
  }
  revalidatePath(`/${locale}/access`);
  revalidatePath(`/${locale}/audit`);
  redirect(`/${locale}/access?reviewed=1`);
}
