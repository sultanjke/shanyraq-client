import { createHash } from "node:crypto";

export function hashPassword(password: string) {
  return createHash("sha256").update(`shanyraq-demo:${password}`).digest("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  return hashPassword(password) === passwordHash;
}
