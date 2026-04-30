import { buildAuditEvent, type AuditInput } from "@/lib/audit";
import type {
  Approval,
  AuditEvent,
  Building,
  Expense,
  Procurement,
  RepositoryDocument,
  RiskFlag,
  User,
  Vote,
} from "@/lib/domain";
import { hashPassword } from "@/lib/password";

export const DEMO_BUILDING_ID = "11111111-1111-4111-8111-111111111111";

export const seedBuilding: Building = {
  id: DEMO_BUILDING_ID,
  name: "Baiterek 24",
  address: "Baiterek Avenue 24",
  city: "Astana",
  transparencyScore: 82,
};

export const seedUsers: User[] = [
  {
    id: "22222222-2222-4222-8222-222222222221",
    name: "Aida Saparova",
    email: "resident@shanyraq.kz",
    role: "resident",
    passwordHash: hashPassword("resident123"),
    unit: "12B",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Daniyar Karim",
    email: "manager@shanyraq.kz",
    role: "manager",
    passwordHash: hashPassword("manager123"),
  },
  {
    id: "22222222-2222-4222-8222-222222222223",
    name: "North Facade LLP",
    email: "contractor@shanyraq.kz",
    role: "contractor",
    passwordHash: hashPassword("contractor123"),
  },
  {
    id: "22222222-2222-4222-8222-222222222224",
    name: "Miras Audit Group",
    email: "auditor@shanyraq.kz",
    role: "auditor",
    passwordHash: hashPassword("auditor123"),
  },
];

export const seedDocuments: RepositoryDocument[] = [
  {
    id: "33333333-3333-4333-8333-333333333331",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Land title and cadastral extract",
      ru: "Право на землю и кадастровая выписка",
      kk: "Жер құқығы және кадастрлық үзінді",
    },
    category: "land",
    authority: "State land cadastre",
    currentStatus: "review",
    linkedRiskId: "44444444-4444-4444-8444-444444444441",
    externalRef: "CAD-AST-24 | historic dacha cooperative note",
    createdAt: "2026-04-22T09:00:00.000Z",
    versions: [
      {
        id: "55555555-5555-4555-8555-555555555551",
        documentId: "33333333-3333-4333-8333-333333333331",
        versionNo: 3,
        fileName: "cadastral-extract-v3.pdf",
        fileUrl: "https://egov.kz/cms/en/services/pass613_msh",
        fileSize: 420_000,
        sha256: "9e7a8df5acbc55a8d45721b9d68eb219f2edc9a0c03694b6a8c973f5539ed551",
        status: "review",
        uploadedBy: seedUsers[1].id,
        uploadedByName: seedUsers[1].name,
        createdAt: "2026-04-30T11:20:00.000Z",
      },
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333332",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Approved construction project",
      ru: "Утвержденный строительный проект",
      kk: "Бекітілген құрылыс жобасы",
    },
    category: "project",
    authority: "Architecture department",
    currentStatus: "verified",
    linkedRiskId: null,
    externalRef: "ARCH-PRJ-2026-05",
    createdAt: "2026-04-18T09:00:00.000Z",
    versions: [
      {
        id: "55555555-5555-4555-8555-555555555552",
        documentId: "33333333-3333-4333-8333-333333333332",
        versionNo: 5,
        fileName: "approved-project-v5.pdf",
        fileUrl: "https://www.gov.kz/services/3173?lang=en",
        fileSize: 2_100_000,
        sha256: "0d82a1eab7a2b0a5e6d3090210582efc5834c8f1ee6b79f77fdd5204f7bb2f74",
        status: "verified",
        uploadedBy: seedUsers[3].id,
        uploadedByName: seedUsers[3].name,
        createdAt: "2026-04-28T10:20:00.000Z",
      },
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Construction permit",
      ru: "Разрешение на строительство",
      kk: "Құрылысқа рұқсат",
    },
    category: "permit",
    authority: "Urban planning control",
    currentStatus: "verified",
    linkedRiskId: null,
    externalRef: "ELIC-2026-7782",
    createdAt: "2026-04-15T09:00:00.000Z",
    versions: [
      {
        id: "55555555-5555-4555-8555-555555555553",
        documentId: "33333333-3333-4333-8333-333333333333",
        versionNo: 2,
        fileName: "construction-permit-v2.pdf",
        fileUrl: "https://www.gov.kz/services/3173?lang=en",
        fileSize: 780_000,
        sha256: "d7a0feb3fcac87ff45cb3f019bed902f06c76220ed1f184f424aa4c4f22f4a1c",
        status: "verified",
        uploadedBy: seedUsers[3].id,
        uploadedByName: seedUsers[3].name,
        createdAt: "2026-04-27T08:05:00.000Z",
      },
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333334",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Monthly maintenance invoice register",
      ru: "Реестр счетов за обслуживание",
      kk: "Айлық қызмет көрсету шоттарының тізілімі",
    },
    category: "finance",
    authority: "Building manager",
    currentStatus: "review",
    linkedRiskId: "44444444-4444-4444-8444-444444444443",
    externalRef: "FIN-2026-04",
    createdAt: "2026-04-29T09:00:00.000Z",
    versions: [
      {
        id: "55555555-5555-4555-8555-555555555554",
        documentId: "33333333-3333-4333-8333-333333333334",
        versionNo: 8,
        fileName: "maintenance-invoices-april.pdf",
        fileUrl: "demo-upload://maintenance-invoices-april.pdf",
        fileSize: 860_000,
        sha256: "5f39a30de8c4e0e5c2cbe74fcb0b60bc83a97b1868087f07de9ab712e7ea324c",
        status: "review",
        uploadedBy: seedUsers[1].id,
        uploadedByName: seedUsers[1].name,
        createdAt: "2026-04-30T21:42:00.000Z",
      },
    ],
  },
];

export const seedProcurements: Procurement[] = [
  {
    id: "66666666-6666-4666-8666-666666666661",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Elevator maintenance contract",
      ru: "Договор на обслуживание лифтов",
      kk: "Лифтке қызмет көрсету келісімі",
    },
    vendor: "KazLift Service",
    bidderCount: 1,
    benchmarkAmountKzt: 2_370_000,
    contractAmountKzt: 2_800_000,
    status: "review",
  },
  {
    id: "66666666-6666-4666-8666-666666666662",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Yard cleaning and snow removal",
      ru: "Уборка двора и снега",
      kk: "Аула тазалау және қар шығару",
    },
    vendor: "Clean Yard LLP",
    bidderCount: 3,
    benchmarkAmountKzt: 960_000,
    contractAmountKzt: 940_000,
    status: "awarded",
  },
];

export const seedExpenses: Expense[] = [
  {
    id: "77777777-7777-4777-8777-777777777771",
    buildingId: DEMO_BUILDING_ID,
    vendor: "KazLift Service",
    category: "maintenance",
    amountKzt: 2_800_000,
    status: "review",
    procurementId: seedProcurements[0].id,
    approvalId: "88888888-8888-4888-8888-888888888882",
    publishedAt: null,
    description: {
      en: "Elevator maintenance, one bidder, benchmark +18%",
      ru: "Обслуживание лифтов, один участник, +18% к ориентиру",
      kk: "Лифт қызметі, бір қатысушы, нарықтан +18%",
    },
  },
  {
    id: "77777777-7777-4777-8777-777777777772",
    buildingId: DEMO_BUILDING_ID,
    vendor: "Astana Water Utility",
    category: "utilities",
    amountKzt: 1_100_000,
    status: "published",
    procurementId: null,
    approvalId: null,
    publishedAt: "2026-04-30T21:42:00.000Z",
    description: {
      en: "Metered service, contract verified",
      ru: "Услуга по счетчикам, договор проверен",
      kk: "Есептегіш бойынша қызмет, келісім тексерілді",
    },
  },
  {
    id: "77777777-7777-4777-8777-777777777773",
    buildingId: DEMO_BUILDING_ID,
    vendor: "North Facade Group",
    category: "repair",
    amountKzt: 4_600_000,
    status: "draft",
    procurementId: null,
    approvalId: "88888888-8888-4888-8888-888888888881",
    publishedAt: null,
    description: {
      en: "Facade repair, reserve release pending resident approval",
      ru: "Ремонт фасада, выпуск резерва ожидает решения жителей",
      kk: "Қасбет жөндеу, резервті шығару тұрғын шешімін күтеді",
    },
  },
];

export const seedApprovals: Approval[] = [
  {
    id: "88888888-8888-4888-8888-888888888881",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Facade repair reserve release",
      ru: "Использование резерва на ремонт фасада",
      kk: "Қасбет жөндеу үшін резервті пайдалану",
    },
    summary: {
      en: "Authorize 4.6M KZT from reserve after contractor quote comparison.",
      ru: "Разрешить 4,6 млн KZT из резерва после сравнения предложений.",
      kk: "Мердігер ұсыныстарын салыстырғаннан кейін резервтен 4,6 млн KZT бөлу.",
    },
    status: "pending",
    quorumPercent: 66,
    yesPercent: 58,
    deadline: "2026-05-07T18:00:00.000Z",
  },
  {
    id: "88888888-8888-4888-8888-888888888882",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Elevator contract re-tender",
      ru: "Повторный тендер по лифтам",
      kk: "Лифт келісіміне қайта тендер",
    },
    summary: {
      en: "Require a second procurement round due to single-bid price variance.",
      ru: "Потребовать второй раунд закупки из-за одного участника и отклонения цены.",
      kk: "Бір қатысушы және баға ауытқуына байланысты екінші сатып алу раундын талап ету.",
    },
    status: "pending",
    quorumPercent: 60,
    yesPercent: 72,
    deadline: "2026-05-05T18:00:00.000Z",
  },
  {
    id: "88888888-8888-4888-8888-888888888883",
    buildingId: DEMO_BUILDING_ID,
    title: {
      en: "Publish annual audit package",
      ru: "Опубликовать годовой аудит",
      kk: "Жылдық аудит пакетін жариялау",
    },
    summary: {
      en: "Release audit report, expense register, and document version history to residents.",
      ru: "Опубликовать аудит, реестр расходов и историю версий документов.",
      kk: "Аудит есебін, шығын тізілімін және құжат нұсқа тарихын жариялау.",
    },
    status: "approved",
    quorumPercent: 50,
    yesPercent: 81,
    deadline: "2026-04-29T18:00:00.000Z",
  },
];

export const seedVotes: Vote[] = [
  {
    id: "99999999-9999-4999-8999-999999999991",
    approvalId: seedApprovals[1].id,
    userId: seedUsers[0].id,
    choice: "yes",
    createdAt: "2026-04-30T18:05:00.000Z",
  },
];

export const seedRisks: RiskFlag[] = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    buildingId: DEMO_BUILDING_ID,
    code: "land-use-mismatch",
    title: {
      en: "Land-use designation mismatch",
      ru: "Несоответствие назначения земли",
      kk: "Жер нысаналы мақсаты сәйкес емес",
    },
    severity: "critical",
    status: "critical",
    explanation: {
      en: "Cadastral purpose must match approved apartment construction use before permit renewal.",
      ru: "Кадастровое назначение должно соответствовать строительству многоквартирного дома.",
      kk: "Кадастрлық мақсат көппәтерлі үй құрылысына сәйкес болуы керек.",
    },
    owner: "Akimat registry",
    sourceEntityType: "document",
    sourceEntityId: seedDocuments[0].id,
    createdAt: "2026-05-01T00:15:00.000Z",
    resolvedAt: null,
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    buildingId: DEMO_BUILDING_ID,
    code: "garden-land-signal",
    title: {
      en: "Garden land construction signal",
      ru: "Признак строительства на садовой земле",
      kk: "Бақ жеріндегі құрылыс белгісі",
    },
    severity: "review",
    status: "review",
    explanation: {
      en: "Historical record mentions dacha cooperative parcel. Auditor confirmation is required.",
      ru: "Историческая запись указывает дачный кооператив. Требуется аудитор.",
      kk: "Тарихи жазба саяжай кооперативін көрсетеді. Аудитор қажет.",
    },
    owner: "State land cadastre",
    sourceEntityType: "document",
    sourceEntityId: seedDocuments[0].id,
    createdAt: "2026-04-30T19:15:00.000Z",
    resolvedAt: null,
  },
  {
    id: "44444444-4444-4444-8444-444444444443",
    buildingId: DEMO_BUILDING_ID,
    code: "single-bid-procurement",
    title: {
      en: "Single-bid procurement",
      ru: "Закупка с одним участником",
      kk: "Бір қатысушы бар сатып алу",
    },
    severity: "review",
    status: "review",
    explanation: {
      en: "Elevator maintenance contract has one bidder and a price 18% above benchmark.",
      ru: "Договор на лифты имеет одного участника и цену на 18% выше ориентира.",
      kk: "Лифт келісімінде бір қатысушы және баға нарықтан 18% жоғары.",
    },
    owner: "Building manager",
    sourceEntityType: "procurement",
    sourceEntityId: seedProcurements[0].id,
    createdAt: "2026-04-30T21:42:00.000Z",
    resolvedAt: null,
  },
];

const seedAuditInputs: AuditInput[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    buildingId: DEMO_BUILDING_ID,
    actorId: seedUsers[3].id,
    actorName: seedUsers[3].name,
    actorRole: "auditor",
    action: "Flagged land-use designation mismatch",
    entityType: "risk",
    entityId: seedRisks[0].id,
    metadata: { code: seedRisks[0].code },
    createdAt: "2026-05-01T00:15:00.000Z",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    buildingId: DEMO_BUILDING_ID,
    actorId: seedUsers[1].id,
    actorName: seedUsers[1].name,
    actorRole: "manager",
    action: "Published monthly maintenance invoice register v8",
    entityType: "document",
    entityId: seedDocuments[3].id,
    metadata: { version: 8 },
    createdAt: "2026-04-30T21:42:00.000Z",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    buildingId: DEMO_BUILDING_ID,
    actorId: seedUsers[0].id,
    actorName: seedUsers[0].name,
    actorRole: "resident",
    action: "Voted on elevator contract re-tender",
    entityType: "approval",
    entityId: seedApprovals[1].id,
    metadata: { choice: "yes" },
    createdAt: "2026-04-30T18:05:00.000Z",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
    buildingId: DEMO_BUILDING_ID,
    actorId: seedUsers[2].id,
    actorName: seedUsers[2].name,
    actorRole: "contractor",
    action: "Attached delivery evidence for facade repair tender",
    entityType: "procurement",
    entityId: seedProcurements[1].id,
    metadata: { evidence: "photo-pack" },
    createdAt: "2026-04-29T13:24:00.000Z",
  },
];

export const seedAuditEvents: AuditEvent[] = seedAuditInputs
  .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
  .reduce<AuditEvent[]>((events, input) => {
    events.push(buildAuditEvent(input, events.at(-1)?.eventHash));
    return events;
  }, []);

export function cloneSeedState() {
  return {
    building: structuredClone(seedBuilding),
    users: structuredClone(seedUsers),
    documents: structuredClone(seedDocuments),
    risks: structuredClone(seedRisks),
    procurements: structuredClone(seedProcurements),
    expenses: structuredClone(seedExpenses),
    approvals: structuredClone(seedApprovals),
    votes: structuredClone(seedVotes),
    auditEvents: structuredClone(seedAuditEvents),
  };
}
