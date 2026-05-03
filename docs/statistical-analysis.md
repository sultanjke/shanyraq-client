# Shanyraq Statistical Analysis Report

Date: 2026-05-04  
Project: Shanyraq, apartment construction and building-management transparency platform for Kazakhstan

## 1. Executive Summary

This statistical analysis evaluates the need, relevance, and measurable success model for Shanyraq. The analysis combines public Kazakhstan housing/construction statistics, corruption-risk indicators, competitor scale benchmarks, and internal MVP metrics from the current codebase.

The data supports Shanyraq's practical significance: Kazakhstan has a large and growing urban housing sector, high annual housing commissioning, significant construction-sector economic activity, and persistent public-sector corruption risk. Shanyraq's measurable contribution should therefore be evaluated through transparency KPIs: document completeness, audit-chain integrity, resident participation, financial traceability, risk-flag resolution, and access-review efficiency.

## 2. Public Context Statistics

| Indicator | Latest Value Used | Derived Statistic | Interpretation For Shanyraq | Source |
| --- | ---: | ---: | --- | --- |
| Kazakhstan population | 20,495,975 people as of Jan. 1, 2026 | 63.57% urban population | A majority urban population increases relevance of apartment-complex governance tools | Bureau of National Statistics ([population](https://stat.gov.kz/en/industries/socialtatistics/demography/publications/475783/)) |
| Urban population | 13,029,803 people | 36.43% rural population | Urban residents are the primary early-adopter segment | Bureau of National Statistics ([population](https://stat.gov.kz/en/industries/socialtatistics/demography/publications/475783/)) |
| Housing stock total area | 447,266.2 thousand sq.m in 2025 | +12,997.6 thousand sq.m vs previous year | Housing stock is expanding, increasing the need for scalable governance and transparency | Bureau of National Statistics ([housing stock](https://stat.gov.kz/en/industries/business-statistics/stat-inno-build/publications/477126/)) |
| Urban housing stock area | 297,936.9 thousand sq.m | 66.61% of total housing-stock area | Housing-management transparency is especially relevant in urban areas | Bureau of National Statistics ([housing stock](https://stat.gov.kz/en/industries/business-statistics/stat-inno-build/publications/477126/)) |
| Residential buildings | 2,594,614 buildings in 2025 | 299,598 apartment buildings, 11.55% of residential buildings | Apartment buildings are a smaller but governance-heavy segment because one building has many stakeholders | Bureau of National Statistics ([housing stock](https://stat.gov.kz/en/industries/business-statistics/stat-inno-build/publications/477126/)) |
| Housing commissioned in 2025 | 20,099.1 thousand sq.m | +5.1% vs 2024 | High annual housing delivery creates ongoing construction and handover transparency needs | Bureau of National Statistics via gov.kz ([2025 housing commissioning](https://www.gov.kz/memleket/entities/stat/press/news/details/1142508?lang=ru)) |
| Multi-apartment housing commissioned in 2025 | 13,523.7 thousand sq.m | 67.29% of commissioned housing | New housing supply is strongly concentrated in multi-apartment buildings, Shanyraq's core target | Bureau of National Statistics via gov.kz ([2025 housing commissioning](https://www.gov.kz/memleket/entities/stat/press/news/details/1142508?lang=ru)) |
| Astana housing commissioned in 2025 | 4,812.5 thousand sq.m | 23.94% of national commissioned housing | Astana is a strong pilot city for Shanyraq, consistent with the Baiterek 24 demo | Bureau of National Statistics via gov.kz ([2025 housing commissioning](https://www.gov.kz/memleket/entities/stat/press/news/details/1142508?lang=ru)) |
| Construction work in 2025 | 10,704.8 billion KZT | +15.9% vs 2024 | Large financial flows increase the importance of expense, procurement, and audit transparency | Bureau of National Statistics via gov.kz ([2025 housing commissioning](https://www.gov.kz/memleket/entities/stat/press/news/details/1142508?lang=ru)) |
| Construction sector share of GDP in 2024 | 6.0% | 8,178,260.1 million KZT gross value added | Construction is economically material, so governance failures can have wide public impact | Bureau of National Statistics ([GDP by production method](https://stat.gov.kz/en/industries/economy/national-accounts/publications/427637/)) |
| Kazakhstan CPI 2025 score | 38/100 | 4 points above Eastern Europe and Central Asia average of 34/100 | Corruption risk remains a relevant problem area; transparency tools have policy significance | Transparency International ([CPI 2025 press page](https://www.transparency.org/en/press/corruption-perceptions-index-2025-weak-institutions-fuelling-corruption-eastern-europe-central-asia), [CPI map PDF](https://www.transparency.de/fileadmin/Redaktion/Aktuelles/2026/CPI_2025/CPI2025_FINAL_ALL_MAPS_EN.pdf)) |

## 3. Derived Market Indicators

| Metric | Formula | Result | Meaning |
| --- | --- | ---: | --- |
| Urbanization ratio | 13,029,803 / 20,495,975 | 63.57% | Shanyraq should prioritize urban apartment complexes |
| Urban housing-stock share | 297,936.9 / 447,266.2 | 66.61% | Most housing area is in urban locations |
| Apartment-building share of residential buildings | 299,598 / 2,594,614 | 11.55% | Apartment buildings are not the majority of buildings, but they are governance-intensive |
| Multi-apartment share of 2025 commissioned housing | 13,523.7 / 20,099.1 | 67.29% | New supply is heavily apartment-oriented |
| Individual housing share of 2025 commissioned housing | 6,416.2 / 20,099.1 | 31.92% | Individual houses are significant but less aligned with Shanyraq's first use case |
| Astana share of 2025 commissioned housing | 4,812.5 / 20,099.1 | 23.94% | Astana alone accounts for nearly one quarter of 2025 commissioned housing |
| Almaty share of 2025 commissioned housing | 2,607.7 / 20,099.1 | 12.97% | Almaty is a strong second expansion market |
| Shymkent share of 2025 commissioned housing | 1,381.9 / 20,099.1 | 6.88% | Shymkent is a later expansion market |

## 4. Competitor Scale Benchmarks

| Competitor | Public Scale Metric | Derived Metric | Benchmark For Shanyraq |
| --- | ---: | ---: | --- |
| Aula.kz | More than 90,000 serviced apartments and more than 20,000 requests/month | About 0.22 requests per apartment/month, or 2.67 per apartment/year | A Kazakhstan property-management platform can reach meaningful local scale; Shanyraq should initially measure buildings onboarded and resident activation |
| Apsiyon | 24,557 properties, 1,697,712 units, 4,101,760 users | 2.42 users per unit; 69.13 units per property | Mature platforms support multiple users per unit and many buildings; Shanyraq should support household-level participation over time |
| Livly | 1,000+ properties | Not enough public unit data for ratio | Sets UX and resident-engagement benchmark |
| Bank CenterCredit POA/OSI | POA offer valid May 6-Dec. 31, 2025 | 240-day promotional window | Banks can quickly enter the POA transparency market through existing apps |

Sources: Aula.kz public website, Apsiyon product page, Livly product page, Bank CenterCredit POA news.

## 5. Internal MVP Statistics

| Project Metric | Current Value | Interpretation |
| --- | ---: | --- |
| Supported roles | 4 | Resident, manager, contractor, auditor |
| Supported interface languages | 3 | English, Russian, Kazakh |
| Main route pages | 8 | Dashboard, documents, finance, approvals, audit, login, register, access |
| Database tables | 12 | Covers users, buildings, memberships, documents, versions, expenses, procurements, approvals, votes, risks, audit events, registration requests |
| Server actions | 12 | Covers sign-in/out, upload, verify, publish, risk checks, approvals, voting, audit export, registration review |
| TypeScript/TSX source files | 52 | Moderate MVP implementation size |
| Unit test files | 3 | Audit chain, risk engine, permissions |
| Unit test cases | 10 | Baseline coverage for critical logic |
| E2E test cases | 5 | Covers resident voting, manager finance, auditor risk/document flow, language switching, registration request |
| Audit integrity model | Hash-chain | Every event stores previous and current hash |

## 6. Risk And Transparency Indicators

| Risk Area | Observable In Shanyraq | Suggested Statistical Indicator | Target For Pilot |
| --- | --- | --- | ---: |
| Missing or incomplete documents | Document repository and status | Verified documents / required documents | >= 80% in MVP demo, >= 95% in pilot |
| Unverified document versions | Document version status | Unverified latest versions / total documents | <= 20% in MVP demo, <= 5% in pilot |
| Expense opacity | Finance page and expense statuses | Published expenses / total expenses | >= 80% monthly |
| Procurement risk | Bidder count and price variance rules | Red-flagged procurements / total procurements | Track trend; reduce unresolved critical flags |
| Resident participation | Votes table and approvals page | Unique voters / eligible resident accounts | >= 50% for major decisions |
| Audit traceability | Audit events table | Logged actions / critical actions | 100% |
| Audit integrity | Hash-chain verification | Valid audit events / total audit events | 100% |
| Access governance | Registration requests | Median review time for access requests | <= 48 hours |
| Role misuse | Permission checks | Unauthorized mutation attempts blocked / attempts | 100% blocked |

## 7. Proposed Pilot Evaluation Model

| Evaluation Question | Data Needed | Statistical Method | Success Criterion |
| --- | --- | --- | --- |
| Does Shanyraq improve document transparency? | Required document checklist, uploaded documents, verification statuses | Before-after percentage comparison | Verified completeness increases by at least 30 percentage points |
| Does Shanyraq improve financial transparency? | Monthly expenses, publication status, approval links | Ratio analysis and monthly trend | At least 80% of expenses published with linked evidence |
| Does Shanyraq improve resident participation? | Resident accounts, vote records, approval participation | Participation-rate analysis | At least 50% participation in one major decision |
| Does Shanyraq reduce unresolved risk exposure? | Open risk flags, severity, closure status | Risk count by severity over time | Critical unresolved risks decline month over month |
| Does Shanyraq improve accountability? | Audit events and hash-chain validation | Integrity check and event coverage ratio | 100% chain validity and 100% key-action logging |
| Does Shanyraq improve trust? | Resident survey before/after pilot | Likert-scale comparison | Average trust score improves by at least 1 point on a 5-point scale |

## 8. Example KPI Dashboard For Report Evaluation

| KPI | Formula | MVP Baseline Method | Pilot Target |
| --- | --- | --- | ---: |
| Transparency Score | Weighted average of document, finance, audit, and participation scores | Current dashboard demo value | >= 85/100 |
| Document Completeness | Verified documents / total required documents | App document status | >= 95% |
| Financial Publication Rate | Published expenses / total expenses | Finance records | >= 80% monthly |
| Approval Participation Rate | Voters / eligible resident members | Vote records and memberships | >= 50% |
| Audit Coverage | Audit events for key actions / key actions | Server action log coverage | 100% |
| Audit Chain Validity | Valid hash-chain events / total audit events | Audit verifier | 100% |
| Risk Closure Rate | Resolved risk flags / opened risk flags | Risk register | >= 70% by review deadline |
| Access Review SLA | Requests reviewed within 48h / total requests | Registration request timestamps | >= 90% |

## 9. Statistical Interpretation

| Finding | Interpretation | Product Implication |
| --- | --- | --- |
| 63.57% of Kazakhstan's population is urban | The main user group is concentrated in cities where apartment complexes are common | Start with Astana, then Almaty and Shymkent |
| 67.29% of 2025 commissioned housing area was multi-apartment | New housing supply is highly relevant to shared governance and resident oversight | Focus MVP narrative on apartment-complex transparency |
| Astana accounted for 23.94% of commissioned housing in 2025 | Astana is statistically justified as the first pilot city | "Astana, Baiterek 24" is a relevant demo case |
| Construction work reached 10,704.8 billion KZT in 2025 | Financial volume is large enough for procurement and expense opacity to be material | Finance tracking and procurement red flags should remain core |
| Kazakhstan CPI score is 38/100 | Corruption perception remains a significant governance issue | Shanyraq's anti-corruption framing is relevant |
| Competitor platforms emphasize convenience, service requests, and payments | The market has resident-app demand but limited transparency-first positioning | Shanyraq should specialize in auditability rather than broad maintenance CRM |

## 10. Limitations

| Limitation | Impact | Mitigation |
| --- | --- | --- |
| Public statistics are national-level, not building-level | They prove macro relevance but not direct pilot impact | Collect Shanyraq building-level data during pilot |
| CPI measures perception, not direct corruption events | It supports context, not causality | Use Shanyraq audit/risk metrics for direct project evaluation |
| Competitor figures are public marketing/app-store data | They may not be independently audited | Treat as benchmarks, not exact market-share data |
| MVP has seeded and demo data | Internal metrics prove feasibility, not social impact | Run a real pilot with residents/managers/auditors |
| Red-flag rules are simulated | They are educational, not official determinations | Label rules clearly and link official references where available |

## 11. Sources

- Bureau of National Statistics, population by gender and type of locality as of Jan. 1, 2026: <https://stat.gov.kz/en/industries/socialtatistics/demography/publications/475783/>
- Bureau of National Statistics, housing stock 2025: <https://stat.gov.kz/en/industries/business-statistics/stat-inno-build/publications/477126/>
- Bureau of National Statistics / gov.kz, 2025 housing commissioning: <https://www.gov.kz/memleket/entities/stat/press/news/details/1142508?lang=ru>
- Bureau of National Statistics, GDP by production method 2024: <https://stat.gov.kz/en/industries/economy/national-accounts/publications/427637/>
- Official Information Source of the Prime Minister, construction-sector review: <https://primeminister.kz/en/news/reviews/record-housing-commissioning-digitalization-of-processes-and-support-for-ppps-implementation-of-the-presidents-instructions-in-the-construction-sector-30371>
- Transparency International, CPI 2025 regional press page: <https://www.transparency.org/en/press/corruption-perceptions-index-2025-weak-institutions-fuelling-corruption-eastern-europe-central-asia>
- Transparency International, CPI 2025 maps PDF: <https://www.transparency.de/fileadmin/Redaktion/Aktuelles/2026/CPI_2025/CPI2025_FINAL_ALL_MAPS_EN.pdf>
- Aula.kz: <https://aula.kz/ru>
- Apsiyon: <https://www.apsiyon.com/en/resident/mobile-app>
- Livly: <https://www.livly.io/>
- Bank CenterCredit POA news: <https://testbcc.amphibia.kz/en/about/press-center/news/osi-management-bcc-app/>
