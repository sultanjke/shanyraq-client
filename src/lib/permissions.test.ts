import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";

describe("role permissions", () => {
  it("blocks residents from auditor and manager actions", () => {
    expect(can("resident", "approval:vote")).toBe(true);
    expect(can("resident", "document:verify")).toBe(false);
    expect(can("resident", "finance:publish")).toBe(false);
  });

  it("blocks contractors from publishing finances", () => {
    expect(can("contractor", "document:upload")).toBe(true);
    expect(can("contractor", "finance:publish")).toBe(false);
  });

  it("lets auditors verify documents and run checks without resident voting", () => {
    expect(can("auditor", "document:verify")).toBe(true);
    expect(can("auditor", "risk:run")).toBe(true);
    expect(can("auditor", "approval:vote")).toBe(false);
  });

  it("lets managers create approvals but not close audit findings", () => {
    expect(can("manager", "approval:create")).toBe(true);
    expect(can("manager", "risk:resolve")).toBe(false);
  });
});
