import type { LocalizedText, Procurement, RepositoryDocument, RiskFlag } from "@/lib/domain";

const nowIso = () => new Date().toISOString();

function text(en: string, ru: string, kk: string): LocalizedText {
  return { en, ru, kk };
}

function createRisk(
  code: string,
  buildingId: string,
  sourceEntityType: string,
  sourceEntityId: string,
  title: LocalizedText,
  explanation: LocalizedText,
  severity: RiskFlag["severity"],
  owner: string,
): RiskFlag {
  return {
    id: `risk-${code}-${sourceEntityId}`,
    buildingId,
    code,
    title,
    severity,
    status: severity,
    explanation,
    owner,
    sourceEntityType,
    sourceEntityId,
    createdAt: nowIso(),
    resolvedAt: null,
  };
}

export function runDocumentRiskRules(buildingId: string, documents: RepositoryDocument[]): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const allText = documents
    .map((document) => `${document.title.en} ${document.category} ${document.authority} ${document.externalRef ?? ""}`)
    .join(" ")
    .toLowerCase();

  const hasPermit = documents.some((document) => document.category === "permit" && document.currentStatus === "verified");
  const hasProject = documents.some((document) => document.category === "project" && document.currentStatus === "verified");
  const landDocument = documents.find((document) => document.category === "land");

  if (landDocument && !/apartment|multi-family|residential/.test(allText)) {
    risks.push(
      createRisk(
        "land-use-mismatch",
        buildingId,
        "document",
        landDocument.id,
        text("Land-use designation mismatch", "Несоответствие назначения земли", "Жер нысаналы мақсаты сәйкес емес"),
        text(
          "The land evidence does not clearly confirm apartment or multi-family residential use.",
          "Земельные доказательства явно не подтверждают назначение под многоквартирный дом.",
          "Жер құжаты көппәтерлі тұрғын үй мақсатын нақты растамайды.",
        ),
        "critical",
        "Akimat registry",
      ),
    );
  }

  if (/garden|dacha|cooperative|сад|дача/.test(allText)) {
    const source = documents.find((document) => /garden|dacha|cooperative/i.test(document.title.en)) ?? documents[0];
    risks.push(
      createRisk(
        "garden-land-signal",
        buildingId,
        "document",
        source.id,
        text("Garden land construction signal", "Признак строительства на садовой земле", "Бақ жеріндегі құрылыс белгісі"),
        text(
          "Historic records mention garden or dacha land, so auditor confirmation is required.",
          "Исторические записи упоминают садовый или дачный участок, требуется подтверждение аудитора.",
          "Тарихи жазбалар бақ немесе саяжай жерін көрсетеді, аудитор растауы қажет.",
        ),
        "review",
        "State land cadastre",
      ),
    );
  }

  if (!hasPermit) {
    risks.push(
      createRisk(
        "missing-permit",
        buildingId,
        "document",
        "permit",
        text("Missing verified construction permit", "Нет проверенного разрешения на строительство", "Тексерілген құрылыс рұқсаты жоқ"),
        text(
          "No verified construction permit is attached to the building profile.",
          "К профилю дома не приложено проверенное разрешение на строительство.",
          "Үй профилінде тексерілген құрылыс рұқсаты жоқ.",
        ),
        "critical",
        "Urban planning control",
      ),
    );
  }

  if (!hasProject) {
    risks.push(
      createRisk(
        "missing-project-docs",
        buildingId,
        "document",
        "project",
        text("Missing approved project documentation", "Нет утвержденной проектной документации", "Бекітілген жоба құжаттары жоқ"),
        text(
          "No verified approved project documentation is attached.",
          "Утвержденная проектная документация не приложена в проверенном виде.",
          "Бекітілген жоба құжаты тексерілген түрде тіркелмеген.",
        ),
        "critical",
        "Architecture department",
      ),
    );
  }

  documents
    .filter((document) => document.currentStatus === "blocked" || document.currentStatus === "review")
    .forEach((document) => {
      risks.push(
        createRisk(
          "unverified-version",
          buildingId,
          "document",
          document.id,
          text("Unverified document version", "Непроверенная версия документа", "Құжат нұсқасы тексерілмеген"),
          text(
            "The latest document version still needs auditor review.",
            "Последняя версия документа требует проверки аудитора.",
            "Құжаттың соңғы нұсқасы аудиторлық тексеруді қажет етеді.",
          ),
          document.currentStatus === "blocked" ? "critical" : "review",
          document.authority,
        ),
      );
    });

  return risks;
}

export function runProcurementRiskRules(buildingId: string, procurements: Procurement[]): RiskFlag[] {
  return procurements.flatMap((procurement) => {
    const risks: RiskFlag[] = [];
    const variance = procurement.contractAmountKzt / procurement.benchmarkAmountKzt - 1;

    if (procurement.bidderCount <= 1) {
      risks.push(
        createRisk(
          "single-bid-procurement",
          buildingId,
          "procurement",
          procurement.id,
          text("Single-bid procurement", "Закупка с одним участником", "Бір қатысушы бар сатып алу"),
          text(
            "Only one bidder is recorded, reducing competitive pressure.",
            "Зафиксирован только один участник, что снижает конкуренцию.",
            "Бір ғана қатысушы тіркелген, бұл бәсекені төмендетеді.",
          ),
          "review",
          "Building manager",
        ),
      );
    }

    if (variance >= 0.15) {
      risks.push(
        createRisk(
          "price-variance",
          buildingId,
          "procurement",
          procurement.id,
          text("Price above benchmark", "Цена выше ориентира", "Баға нарықтан жоғары"),
          text(
            `Contract price is ${(variance * 100).toFixed(0)}% above benchmark.`,
            `Цена контракта на ${(variance * 100).toFixed(0)}% выше ориентира.`,
            `Келісім бағасы нарықтық бағдардан ${(variance * 100).toFixed(0)}% жоғары.`,
          ),
          variance >= 0.3 ? "critical" : "review",
          "Auditor",
        ),
      );
    }

    return risks;
  });
}

export function dedupeRisks(existing: RiskFlag[], generated: RiskFlag[]) {
  const existingCodes = new Set(existing.map((risk) => `${risk.code}:${risk.sourceEntityId}`));
  return generated.filter((risk) => !existingCodes.has(`${risk.code}:${risk.sourceEntityId}`));
}
