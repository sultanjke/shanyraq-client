import { describe, expect, it } from "vitest";
import { runDocumentRiskRules, runProcurementRiskRules } from "@/lib/risk-engine";
import { DEMO_BUILDING_ID, seedDocuments, seedProcurements } from "@/lib/seed";

describe("red-flag rules", () => {
  it("flags land designation and garden land signals", () => {
    const risks = runDocumentRiskRules(DEMO_BUILDING_ID, seedDocuments);
    const codes = risks.map((risk) => risk.code);

    expect(codes).toContain("land-use-mismatch");
    expect(codes).toContain("garden-land-signal");
  });

  it("flags missing permit and project documentation", () => {
    const risks = runDocumentRiskRules(
      DEMO_BUILDING_ID,
      seedDocuments.filter((document) => !["permit", "project"].includes(document.category)),
    );
    const codes = risks.map((risk) => risk.code);

    expect(codes).toContain("missing-permit");
    expect(codes).toContain("missing-project-docs");
  });

  it("flags single-bid procurement and high price variance", () => {
    const risks = runProcurementRiskRules(DEMO_BUILDING_ID, seedProcurements);
    const codes = risks.map((risk) => risk.code);

    expect(codes).toContain("single-bid-procurement");
    expect(codes).toContain("price-variance");
  });
});
