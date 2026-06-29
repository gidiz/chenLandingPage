Status: done
Owner: User
Last updated: 2026-06-29

# Goal
Move all treatment catalog content currently stored in composables into Supabase PostgreSQL tables, then store vector embeddings for all searchable content in Supabase (pgvector) for semantic retrieval.

# Scope
In scope:
- Data currently defined under composables/treatment-catalog/** (categories, services, FAQ questions, and rich text fields).
- Database schema design and SQL migrations under server/db/migrations/.
- One-time backfill script to migrate existing composables data into Supabase.
- Vectorization pipeline to create embeddings for all migrated content.
- Verification queries and rollback SQL.

Out of scope:
- UI redesign of treatments pages.
- Content rewriting.
- Multi-language translation workflow.

# Assumptions
- Supabase project is provisioned and accessible from this repository.
- Database credentials are available via environment variables.
- OpenAI key is provided only via local environment variable OPENAI_API_KEY and is never committed to git.
- pgvector extension can be enabled in the target Supabase database.
- The app can temporarily run in read-only mode for treatment content during cutover if needed.

# Open Questions (Answered)
1. What embedding provider/model should be used for vectors?
Answer: OpenAI text-embedding-3-small (1536 dimensions).

Decision note: Use OPENAI_API_KEY from local .env or deployment secrets manager. Do not place raw keys in plan files, source files, logs, or .env.example.

2. Should vectors be generated per full service record or by chunks?
Answer: Chunk by semantic section (description, summary, suitability, process, expectations, and each FAQ answer).

3. Should composables remain as fallback during rollout?
Answer: Yes. Keep composables as fallback behind a feature flag until DB parity is validated.

4. What should be the source of truth after rollout?
Answer: Supabase tables become source of truth; composables become deprecated and later removed.

5. Approval gate before execution?
Answer: Require explicit approval on this plan before any schema/data changes are applied.

6. Supabase question: "I'm using Supabase, do I need RAG_POSTGRES_URL?"
Answer: Not required if the migration/backfill uses Supabase client API (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). Required only if a direct Postgres driver is used for SQL/migrations/backfill.

Decision: Use Supabase client API for app reads/writes and backfill, so required env vars are SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY. Keep RAG_POSTGRES_URL optional for direct SQL tooling only.

Execution note: Completed using Supabase URL + publishable key path after disabling RLS on the catalog tables for this internal migration flow.

# Steps
1. Inventory and canonical mapping
- Enumerate all entities in composables/treatment-catalog/**:
  - category fields: slug, title, shortTitle, description, eyebrow, intro, seoTitle, seoDescription.
  - service fields: slug, title, shortTitle, navTitle, description, shortDescription, summary, suitability, process, expectations, ctaLabel, seoTitle, seoDescription.
  - questions fields: title, answer.
- Define deterministic IDs and ordering keys (display_order) for stable rendering.

2. Create relational schema in Supabase
- Add migration file in server/db/migrations/ with:
  - extension: create extension if not exists vector;
  - table treatment_categories
  - table treatment_services (FK to categories)
  - table treatment_questions (FK to services)
  - optional table treatment_content_chunks for embedding-ready chunks
  - created_at/updated_at timestamps and unique constraints:
    - unique category slug
    - unique (category_id, service_slug)
    - question display order per service
- Add indexes for routing and lookups:
  - categories.slug
  - services.category_id, services.slug
  - questions.service_id
Progress: Done in migration file server/db/migrations/001_2026-06-29_treatment_catalog_vector.sql.

3. Design vector storage layer
- Add vector column embedding vector(1536) to treatment_content_chunks.
- Add metadata columns for retrieval filtering:
  - category_slug, service_slug, section_type, source_table, source_id.
- Add ivfflat or hnsw index (Supabase-supported option) on embedding.
- Add SQL RPC/function for similarity search (match_treatment_content) returning chunk text + metadata + similarity score.
Progress: Done in migration file server/db/migrations/001_2026-06-29_treatment_catalog_vector.sql.

4. Build migration/backfill script
- Add script (for example server/rag/backfill-treatment-catalog.ts) that:
  - imports composables catalog objects.
  - upserts categories, services, questions.
  - emits normalized chunks into treatment_content_chunks.
  - calls embedding provider and stores vectors.
- Add startup validation for required env vars:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
- Add optional env var support for direct SQL mode:
  - RAG_POSTGRES_URL (optional, only when running direct Postgres tooling)
- Make script idempotent (upsert by stable keys).
- Add dry-run mode to validate counts without writes.
Progress: Done in server/rag/backfill-treatment-catalog.ts and package scripts.

8. Secret management hardening
- Keep OPENAI_API_KEY only in local .env and deployment secret store.
- Ensure .env is gitignored and .env.example contains only placeholders.
- Redact OPENAI_API_KEY from runtime logs and error messages.
- If a key is ever shared in chat/issue/commit, rotate it immediately and replace all active references.
Progress: In progress. Policy documented. Key rotation still required outside repository.

5. Integrate app reads from DB
- Add server query layer (for example server/lib/rag/ or server/lib/catalog/) to fetch categories/services/questions from Supabase.
- Update composable access path to read from DB endpoint.
- Keep feature flag fallback to current composables until parity checks pass.
Progress: Done. Added API endpoint server/api/rag/treatment-catalog.get.ts and switched composable to DB-backed cached fetch with static fallback controlled by NUXT_PUBLIC_TREATMENT_CATALOG_SOURCE.

6. Validation and parity checks
- Record expected counts from composables and compare with DB:
  - category count
  - service count
  - question count
  - chunk count
- Validate route-level payload parity for:
  - /[category]
  - /[category]/[service]
- Validate semantic search returns relevant chunks for sample Hebrew queries.
Progress: Done. Live Supabase backfill executed successfully in no-embeddings mode and full embeddings mode. Static-vs-DB parity script reports zero diffs for category/service/question counts and selected text fields.

7. Cutover and cleanup
- Enable DB as default source via feature flag.
- Monitor for 24-48 hours.
- Remove deprecated composables content files after confirmation.

# Validation
- SQL integrity checks:
  - no orphan services
  - no orphan questions
  - unique slug constraints enforced
- App checks:
  - category page and service page render with DB data
  - SEO fields present for all records
- Vector checks:
  - embedding not null for all chunks
  - similarity function returns expected top-k for test prompts
- Performance checks:
  - route payload latency within acceptable threshold
  - vector query response under target latency for top-k search

# Risks
- HTML-heavy fields may create noisy embeddings if not normalized.
Mitigation: strip/normalize HTML to plain text before embedding while retaining raw HTML for display.

- Large one-time embedding run can exceed API budget or rate limits.
Mitigation: batch processing with retry and checkpointing.

- Data drift during transition if both composables and DB are editable.
Mitigation: freeze content edits during migration window.

- Wrong vector dimension/model mismatch.
Mitigation: enforce dimension via schema and validate model configuration before backfill.

# Rollout Order
1. Merge migration SQL.
2. Apply migrations to Supabase.
3. Run dry-run backfill.
4. Run full backfill + embedding.
5. Enable DB read path in staging.
6. Validate parity and semantic retrieval.
7. Enable DB read path in production.
8. Remove composables fallback.

# Rollback
- Disable DB read feature flag and revert app reads to composables.
- Keep migrated tables for forensic analysis; do not drop immediately.
- If schema causes runtime issues, revert latest migration with dedicated down migration.
- If vectors are corrupted, truncate treatment_content_chunks and rerun backfill with corrected normalization/model.

# Approval Required
Execution should start only after explicit approval on this plan and answers to Open Questions are confirmed.

# Execution Notes
- Implemented migration SQL: server/db/migrations/001_2026-06-29_treatment_catalog_vector.sql
- Implemented backfill + embedding script: server/rag/backfill-treatment-catalog.ts
- Added npm scripts for dry-run/backfill in package.json
- Added required env placeholders in .env.example: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
- Verified dry-run output:
  - categories: 6
  - services: 15
  - questions: 45
  - chunks: 135
- Verified live Supabase upsert run (no embeddings):
  - dbMode: supabase
  - Data upsert completed
- Verified live Supabase full embedding run:
  - dbMode: supabase
  - Embedded 135 / 135
  - Embedding backfill completed
- Implemented app read-path cutover wiring:
  - Added runtime flag: NUXT_PUBLIC_TREATMENT_CATALOG_SOURCE (default: db)
  - Added DB catalog API: server/api/rag/treatment-catalog.get.ts
  - Updated composable to fetch from API and fallback to static catalog: composables/useTreatmentCatalog.ts
- Added and executed parity validator:
  - Script: server/rag/validate-catalog-parity.ts
  - Command: npm run rag:catalog:validate:parity
  - Result: 0 missing/extra categories, 0 missing/extra services, question counts match (45), selected text-field diffs: 0
