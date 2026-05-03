# Shanyraq Architecture Documentation

## Scope

This document describes the current Shanyraq MVP architecture as implemented in the Next.js App Router codebase. It focuses on the application structure that supports one or more apartment complexes, role-based access, document versioning, transparent finance, resident approvals, risk checks, and hash-chain audit events.

The diagrams are aligned with these implementation areas:

| Area | Implementation reference |
| --- | --- |
| Routes | `src/app/[locale]/*` |
| Server actions | `src/app/actions.ts` |
| Domain types | `src/lib/domain.ts` |
| Permissions | `src/lib/permissions.ts` |
| Persistence and seed fallback | `src/lib/store.ts` |
| Database schema | `src/db/schema.ts` |
| Audit hash chain | `src/lib/audit.ts` |
| Risk rules | `src/lib/risk-engine.ts` |

## Runtime Architecture

```mermaid
flowchart LR
  Browser["User Browser"] --> LocaleRoutes["Next.js App Router<br/>/[locale] routes"]
  LocaleRoutes --> Pages["Server and Client UI Pages"]
  Pages --> Actions["Server Actions"]
  Actions --> Auth["HTTP-only Session Auth"]
  Actions --> Permissions["Role Permission Checks"]
  Actions --> Store["Store Layer"]
  Store --> Memory["Seeded Memory Store<br/>when DATABASE_URL is missing"]
  Store --> Postgres["Neon Postgres<br/>Drizzle ORM"]
  Actions --> Blob["Vercel Blob<br/>document files"]
  Actions --> Audit["Hash-chain Audit Writer"]
  Audit --> Store
  Actions --> RiskEngine["Rules Engine"]
  RiskEngine --> Store
```

## Main Routes

| Route | Purpose | Primary users |
| --- | --- | --- |
| `/[locale]/login` | Seeded or approved-user sign in | All roles |
| `/[locale]/register` | Submit a building access request | Applicants |
| `/[locale]/dashboard` | Overview of transparency score, risks, documents, finance, approvals | All authenticated roles |
| `/[locale]/documents` | Inspect repository documents and upload/verify versions | Residents, managers, contractors, auditors |
| `/[locale]/finance` | Review expenses, procurements, and publish financial report | Residents, managers, auditors |
| `/[locale]/approvals` | Create approvals and cast resident votes | Residents, managers |
| `/[locale]/audit` | Inspect/export audit trail and integrity state | Residents, managers, auditors |
| `/[locale]/access` | Review registration requests | Managers, auditors |

## Permission Model

| Permission | Resident | Manager | Contractor | Auditor |
| --- | --- | --- | --- | --- |
| `document:upload` | No | Yes | Yes | No |
| `document:verify` | No | No | No | Yes |
| `finance:publish` | No | Yes | No | No |
| `approval:create` | No | Yes | No | No |
| `approval:vote` | Yes | No | No | No |
| `risk:run` | No | No | No | Yes |
| `risk:resolve` | No | No | No | Yes |
| `audit:export` | Yes | Yes | No | Yes |
| `access:review` | No | Yes | No | Yes |

## Use-Case Diagram

```mermaid
flowchart LR
  Applicant["Applicant"]
  Resident["Resident"]
  Manager["Manager"]
  Contractor["Contractor"]
  Auditor["Auditor"]

  subgraph PublicArea["Public access"]
    Register["Request building access"]
    SignIn["Sign in"]
  end

  subgraph CommonArea["Shared transparency views"]
    Dashboard["View building dashboard"]
    Documents["Inspect documents"]
    Finance["Inspect expenses and procurements"]
    AuditTrail["Inspect audit trail"]
  end

  subgraph ResidentArea["Resident participation"]
    Vote["Cast one account one vote"]
    ViewDecision["View approval status"]
  end

  subgraph ManagerArea["Management operations"]
    UploadDoc["Upload management documents"]
    PublishFinance["Publish expense report"]
    CreateApproval["Create resident approval"]
    ReviewAccessM["Approve or reject access requests"]
  end

  subgraph ContractorArea["Contractor operations"]
    UploadEvidence["Upload delivery evidence"]
    ViewProcurement["View assigned procurement context"]
  end

  subgraph AuditorArea["Audit operations"]
    VerifyDoc["Verify document versions"]
    RunRisk["Run consistency checks"]
    ResolveRisk["Close or reopen risk findings"]
    ExportAudit["Export audit log"]
    ReviewAccessA["Approve or reject access requests"]
  end

  Applicant --> Register
  Applicant --> SignIn

  Resident --> SignIn
  Resident --> Dashboard
  Resident --> Documents
  Resident --> Finance
  Resident --> AuditTrail
  Resident --> Vote
  Resident --> ViewDecision

  Manager --> SignIn
  Manager --> Dashboard
  Manager --> Documents
  Manager --> Finance
  Manager --> AuditTrail
  Manager --> UploadDoc
  Manager --> PublishFinance
  Manager --> CreateApproval
  Manager --> ReviewAccessM

  Contractor --> SignIn
  Contractor --> Dashboard
  Contractor --> Documents
  Contractor --> UploadEvidence
  Contractor --> ViewProcurement

  Auditor --> SignIn
  Auditor --> Dashboard
  Auditor --> Documents
  Auditor --> Finance
  Auditor --> AuditTrail
  Auditor --> VerifyDoc
  Auditor --> RunRisk
  Auditor --> ResolveRisk
  Auditor --> ExportAudit
  Auditor --> ReviewAccessA
```

## Use-Case Mapping

| Use case | Route | Server action or store function | Key records |
| --- | --- | --- | --- |
| Request building access | `/[locale]/register` | `registerAction`, `submitRegistrationRequest` | `registration_requests` |
| Approve or reject access | `/[locale]/access` | `approveRegistrationRequestAction`, `rejectRegistrationRequestAction` | `users`, `memberships`, `registration_requests`, `audit_events` |
| Sign in | `/[locale]/login` | `signInAction` | `users`, session cookie |
| Upload document version | `/[locale]/documents` | `uploadDocumentVersionAction`, `uploadDocumentVersion` | `documents`, `document_versions`, `audit_events` |
| Verify document | `/[locale]/documents` | `verifyDocumentAction`, `verifyDocument` | `documents`, `document_versions`, `audit_events` |
| Publish expenses | `/[locale]/finance` | `publishExpenseReportAction`, `publishExpenseReport` | `expenses`, `audit_events` |
| Create approval | `/[locale]/approvals` | `createApprovalAction`, `createApproval` | `approvals`, `audit_events` |
| Cast vote | `/[locale]/approvals` | `castVoteAction`, `castVote` | `votes`, `approvals`, `audit_events` |
| Run risk checks | `/[locale]/audit` | `runRiskChecksAction`, `runRiskChecks` | `risk_flags`, `audit_events` |
| Export audit log | `/[locale]/audit` | `exportAuditLogAction`, `exportAuditLines` | `audit_events` |

## Sequence Diagram: Registration And Access Approval

```mermaid
sequenceDiagram
  actor Applicant
  participant RegisterPage as Register Page
  participant RegisterAction as registerAction
  participant Store as Store Layer
  participant DB as Neon Postgres
  actor Reviewer as Manager or Auditor
  participant AccessPage as Access Review Page
  participant ReviewAction as approve or reject action
  participant Audit as Audit Writer

  Applicant->>RegisterPage: Submit name, email, role, building, evidence
  RegisterPage->>RegisterAction: FormData
  RegisterAction->>RegisterAction: Validate request and hash password
  RegisterAction->>Store: submitRegistrationRequest
  Store->>DB: Insert pending registration request
  DB-->>Store: Created request
  Store-->>RegisterAction: Pending request
  RegisterAction-->>Applicant: Redirect to login with registration notice

  Reviewer->>AccessPage: Open access requests
  AccessPage->>Store: getRegistrationRequests
  Store->>DB: Read pending requests
  DB-->>AccessPage: Pending requests
  Reviewer->>AccessPage: Approve or reject
  AccessPage->>ReviewAction: Request id and decision
  ReviewAction->>ReviewAction: assertCan role access:review
  ReviewAction->>Store: approveRegistrationRequest or rejectRegistrationRequest
  alt Approved
    Store->>DB: Create user if needed
    Store->>DB: Create building if needed
    Store->>DB: Create active membership
    Store->>DB: Mark request approved
  else Rejected
    Store->>DB: Mark request rejected with reason
  end
  Store->>Audit: addAuditEvent
  Audit->>DB: Append hash-chain event
  ReviewAction-->>AccessPage: Revalidate access page
```

## Sequence Diagram: Document Upload And Verification

```mermaid
sequenceDiagram
  actor Uploader as Manager or Contractor
  participant DocumentsPage as Documents Page
  participant UploadAction as uploadDocumentVersionAction
  participant Blob as Vercel Blob or local fallback
  participant Store as Store Layer
  participant DB as Neon Postgres
  actor Auditor
  participant VerifyAction as verifyDocumentAction
  participant Audit as Audit Writer

  Uploader->>DocumentsPage: Select document and file
  DocumentsPage->>UploadAction: FormData with document id and file
  UploadAction->>UploadAction: assertCan document:upload
  UploadAction->>UploadAction: Compute SHA-256 hash
  UploadAction->>Blob: Store file bytes
  Blob-->>UploadAction: File URL
  UploadAction->>Store: uploadDocumentVersion
  Store->>DB: Insert next document version with review status
  Store->>DB: Set document currentStatus to review
  Store->>Audit: addAuditEvent with hash and version number
  Audit->>DB: Append hash-chain event
  UploadAction-->>DocumentsPage: Revalidate documents

  Auditor->>DocumentsPage: Verify latest version
  DocumentsPage->>VerifyAction: Document id
  VerifyAction->>VerifyAction: assertCan document:verify
  VerifyAction->>Store: verifyDocument
  Store->>DB: Set document currentStatus to verified
  Store->>DB: Set latest version status to verified
  Store->>Audit: addAuditEvent for verification
  Audit->>DB: Append hash-chain event
  VerifyAction-->>DocumentsPage: Revalidate documents and audit
```

## Sequence Diagram: Approval Voting

```mermaid
sequenceDiagram
  actor Manager
  actor Resident
  participant ApprovalsPage as Approvals Page
  participant CreateAction as createApprovalAction
  participant VoteAction as castVoteAction
  participant Store as Store Layer
  participant DB as Neon Postgres
  participant Audit as Audit Writer

  Manager->>ApprovalsPage: Create approval title and summary
  ApprovalsPage->>CreateAction: FormData
  CreateAction->>CreateAction: assertCan approval:create
  CreateAction->>Store: createApproval
  Store->>DB: Insert approval with pending status and quorum
  Store->>Audit: addAuditEvent for created approval
  Audit->>DB: Append hash-chain event
  CreateAction-->>ApprovalsPage: Revalidate approvals

  Resident->>ApprovalsPage: Cast yes or no vote
  ApprovalsPage->>VoteAction: Approval id and choice
  VoteAction->>VoteAction: assertCan approval:vote
  VoteAction->>Store: castVote
  Store->>DB: Check existing vote for approval and user
  alt No prior vote and approval pending
    Store->>DB: Insert vote
    Store->>DB: Update yesPercent and status when quorum is met
    Store->>Audit: addAuditEvent with vote choice
    Audit->>DB: Append hash-chain event
  else Duplicate vote or closed approval
    Store-->>VoteAction: No mutation
  end
  VoteAction-->>ApprovalsPage: Revalidate approvals
```

## Sequence Diagram: Risk Checks And Audit Integrity

```mermaid
sequenceDiagram
  actor Auditor
  participant AuditPage as Audit Page
  participant RiskAction as runRiskChecksAction
  participant Store as Store Layer
  participant RiskEngine as Risk Engine
  participant DB as Neon Postgres
  participant Audit as Audit Writer

  Auditor->>AuditPage: Run consistency checks
  AuditPage->>RiskAction: Submit request
  RiskAction->>RiskAction: assertCan risk:run
  RiskAction->>Store: runRiskChecks
  Store->>DB: Load dashboard data for building
  Store->>RiskEngine: runDocumentRiskRules
  Store->>RiskEngine: runProcurementRiskRules
  RiskEngine-->>Store: Generated risk flags
  Store->>Store: Dedupe existing risk codes and source ids
  alt New risks found
    Store->>DB: Insert risk flags
    Store->>Audit: addAuditEvent with opened risk codes
  else No new risks
    Store->>Audit: addAuditEvent with no-new-risk result
  end
  Audit->>DB: Append eventHash using previous eventHash
  RiskAction-->>AuditPage: Revalidate risk and audit views
```

## Class Diagram

```mermaid
classDiagram
  class Building {
    string id
    string name
    string address
    string city
    number transparencyScore
  }

  class User {
    string id
    string name
    string email
    UserRole role
    string passwordHash
    string unit
  }

  class SessionUser {
    string id
    string name
    string email
    UserRole role
    string unit
  }

  class Membership {
    string id
    string buildingId
    string userId
    UserRole role
    string status
    string unit
    number ownershipShare
  }

  class RegistrationRequest {
    string id
    string name
    string email
    UserRole requestedRole
    string buildingId
    string buildingName
    string buildingAddress
    string city
    string unit
    string organizationName
    string evidenceNote
    RegistrationStatus status
    string reviewedBy
    string rejectionReason
  }

  class RepositoryDocument {
    string id
    string buildingId
    LocalizedText title
    string category
    string authority
    DocumentStatus currentStatus
    string linkedRiskId
    string externalRef
  }

  class DocumentVersion {
    string id
    string documentId
    number versionNo
    string fileName
    string fileUrl
    number fileSize
    string sha256
    DocumentStatus status
    string uploadedBy
    string uploadedByName
  }

  class Procurement {
    string id
    string buildingId
    LocalizedText title
    string vendor
    number bidderCount
    number benchmarkAmountKzt
    number contractAmountKzt
    string status
  }

  class Expense {
    string id
    string buildingId
    string vendor
    string category
    number amountKzt
    string status
    LocalizedText description
    string procurementId
    string approvalId
    string publishedAt
  }

  class Approval {
    string id
    string buildingId
    LocalizedText title
    LocalizedText summary
    ApprovalStatus status
    number quorumPercent
    number yesPercent
    string deadline
  }

  class Vote {
    string id
    string approvalId
    string userId
    VoteChoice choice
    string createdAt
  }

  class RiskFlag {
    string id
    string buildingId
    string code
    LocalizedText title
    RiskSeverity severity
    LocalizedText explanation
    string owner
    string sourceEntityType
    string sourceEntityId
    RiskSeverity status
  }

  class AuditEvent {
    string id
    string buildingId
    string actorId
    string actorName
    string actorRole
    string action
    string entityType
    string entityId
    object metadata
    string previousHash
    string eventHash
    string createdAt
  }

  class DashboardData {
    Building building
    SessionUser user
    RepositoryDocument documents
    RiskFlag risks
    Expense expenses
    Procurement procurements
    Approval approvals
    Vote votes
    AuditEvent auditEvents
  }

  class UserRole {
    <<enumeration>>
    resident
    manager
    contractor
    auditor
  }

  class DocumentStatus {
    <<enumeration>>
    draft
    review
    verified
    blocked
  }

  class RiskSeverity {
    <<enumeration>>
    info
    review
    critical
    resolved
  }

  class ApprovalStatus {
    <<enumeration>>
    pending
    approved
    rejected
    expired
  }

  class RegistrationStatus {
    <<enumeration>>
    pending
    approved
    rejected
  }

  class VoteChoice {
    <<enumeration>>
    yes
    no
  }

  Building "1" --> "0..*" Membership
  User "1" --> "0..*" Membership
  Building "1" --> "0..*" RegistrationRequest
  User "1" --> "0..*" RegistrationRequest : reviews
  Building "1" --> "0..*" RepositoryDocument
  RepositoryDocument "1" --> "0..*" DocumentVersion
  User "1" --> "0..*" DocumentVersion : uploads
  Building "1" --> "0..*" Procurement
  Procurement "1" --> "0..*" Expense
  Building "1" --> "0..*" Expense
  Building "1" --> "0..*" Approval
  Approval "1" --> "0..*" Vote
  User "1" --> "0..*" Vote
  Building "1" --> "0..*" RiskFlag
  Building "1" --> "0..*" AuditEvent
  DashboardData --> Building
  DashboardData --> SessionUser
```

## ER Diagram

```mermaid
erDiagram
  BUILDINGS ||--o{ MEMBERSHIPS : has
  USERS ||--o{ MEMBERSHIPS : joins
  BUILDINGS ||--o{ REGISTRATION_REQUESTS : receives
  USERS ||--o{ REGISTRATION_REQUESTS : reviews
  BUILDINGS ||--o{ DOCUMENTS : owns
  DOCUMENTS ||--o{ DOCUMENT_VERSIONS : has
  USERS ||--o{ DOCUMENT_VERSIONS : uploads
  BUILDINGS ||--o{ PROCUREMENTS : owns
  PROCUREMENTS ||--o{ EXPENSES : supports
  BUILDINGS ||--o{ EXPENSES : owns
  BUILDINGS ||--o{ APPROVALS : owns
  APPROVALS ||--o{ VOTES : receives
  USERS ||--o{ VOTES : casts
  BUILDINGS ||--o{ RISK_FLAGS : owns
  BUILDINGS ||--o{ AUDIT_EVENTS : records

  BUILDINGS {
    uuid id PK
    text name
    text address
    text city
    integer transparency_score
    timestamp created_at
  }

  USERS {
    uuid id PK
    text name
    text email UK
    text role
    text password_hash
    text unit
    timestamp created_at
  }

  MEMBERSHIPS {
    uuid id PK
    uuid building_id FK
    uuid user_id FK
    text role
    text status
    text unit
    integer ownership_share
    timestamp created_at
  }

  REGISTRATION_REQUESTS {
    uuid id PK
    text name
    text email
    text password_hash
    text requested_role
    uuid building_id FK
    text building_name
    text building_address
    text city
    text unit
    text organization_name
    text evidence_note
    text status
    uuid reviewed_by FK
    timestamp reviewed_at
    text rejection_reason
    timestamp created_at
  }

  DOCUMENTS {
    uuid id PK
    uuid building_id FK
    jsonb title
    text category
    text authority
    text current_status
    uuid linked_risk_id
    text external_ref
    timestamp created_at
  }

  DOCUMENT_VERSIONS {
    uuid id PK
    uuid document_id FK
    integer version_no
    text file_name
    text file_url
    integer file_size
    text sha256
    text status
    uuid uploaded_by FK
    text uploaded_by_name
    timestamp created_at
  }

  PROCUREMENTS {
    uuid id PK
    uuid building_id FK
    jsonb title
    text vendor
    integer bidder_count
    integer benchmark_amount_kzt
    integer contract_amount_kzt
    text status
  }

  EXPENSES {
    uuid id PK
    uuid building_id FK
    text vendor
    text category
    integer amount_kzt
    text status
    jsonb description
    uuid procurement_id FK
    uuid approval_id
    timestamp published_at
  }

  APPROVALS {
    uuid id PK
    uuid building_id FK
    jsonb title
    jsonb summary
    text status
    integer quorum_percent
    integer yes_percent
    timestamp deadline
  }

  VOTES {
    uuid id PK
    uuid approval_id FK
    uuid user_id FK
    text choice
    timestamp created_at
  }

  RISK_FLAGS {
    uuid id PK
    uuid building_id FK
    text code
    jsonb title
    text severity
    jsonb explanation
    text owner
    text source_entity_type
    text source_entity_id
    text status
    timestamp created_at
    timestamp resolved_at
  }

  AUDIT_EVENTS {
    uuid id PK
    uuid building_id FK
    uuid actor_id
    text actor_name
    text actor_role
    text action
    text entity_type
    uuid entity_id
    jsonb metadata
    text previous_hash
    text event_hash
    timestamp created_at
  }
```

## ER Design Notes

| Design choice | Reason |
| --- | --- |
| `memberships` separates users from buildings | A single platform can support multiple apartment complexes while restricting each user to the building records they belong to. |
| `registration_requests` is separate from `users` | Applicants do not become authenticated users until a manager or auditor approves access. |
| `document_versions` stores `sha256` and immutable version metadata | File history can be inspected even when the current document status changes. |
| `votes` has one vote per approval and user | The database unique index enforces one-account-one-vote behavior. |
| `audit_events` uses `entity_type` and `entity_id` | Audit events can reference many business entities without a separate table for every event type. |
| `previous_hash` and `event_hash` are stored per audit event | The chain can detect modified or reordered historical audit records without using blockchain. |
| `risk_flags` uses source entity fields | Rule-generated findings remain explainable and traceable back to documents or procurements. |

## Core Data Lifecycle

| Lifecycle | State transition |
| --- | --- |
| Registration | `pending` to `approved` or `rejected` |
| Membership | applicant becomes `active` member after approval |
| Document | `draft` or `review` to `verified` or `blocked` |
| Expense | `draft` or `review` to `published` |
| Approval | `pending` to `approved`, `rejected`, or `expired` |
| Risk flag | `info`, `review`, or `critical` to `resolved` |
| Audit event | appended only; each event links to the previous event hash |

## Architectural Assumptions

| Assumption | Current MVP behavior |
| --- | --- |
| Multi-building support | Users are attached to buildings through memberships; dashboard data is scoped to the user's building. |
| No real eGov integration in v1 | External registry numbers and links are stored as references only. |
| Blob storage is optional for local development | If Vercel Blob is not configured, the upload path falls back to local or demo storage behavior. |
| Database is optional for demo mode | If `DATABASE_URL` is missing, the store uses seeded in-memory data. |
| Audit immutability is application-level | The app stores a tamper-evident hash chain, not a blockchain or write-once database. |
| Risk checks are simulated rules | Risk flags are explainable educational indicators, not official government determinations. |
