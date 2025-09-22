# VoiceLocal Backend Plan (Code-free Roadmap)

Use this document to guide backend development from zero to production. Each phase includes tasks, deliverables, and acceptance criteria. Update this plan as you iterate.

References
- Design: BACKEND-DESIGN.md (ERD + API contracts)
- Setup: BACKEND-SETUP.md (step-by-step execution guide)


## Phase 0 — Foundations and planning
Tasks
- Confirm scope, ERD, and API list (from BACKEND-DESIGN.md).
- Decide naming conventions (snake_case vs camelCase in API, plural vs singular routes).
- Confirm environment strategy (dev, staging, prod) and secret management approach.
- Choose exact stack versions (Python, Django, MySQL) and tools (DRF, SimpleJWT).
Deliverables
- Final ERD image and API endpoint list.
- Backend tech decisions documented.
Acceptance criteria
- Stakeholders sign off on data model and endpoints.

## Phase 1 — Project scaffolding and configuration
Tasks
- Initialize backend project structure and Python venv.
- Create settings (base/dev/prod), .env handling, logging.
- Add core dependencies (Django, DRF, SimpleJWT, CORS, django-filter).
- Configure CORS to allow the frontend dev origin.
Deliverables
- Django project + primary app created.
- Dev server starts; health/ready endpoint planned.
Acceptance criteria
- Server runs locally; basic route responds 200.

## Phase 2 — Database and schema alignment
Tasks
- Provision local MySQL database and user with proper privileges.
- Implement models from ERD (User/Profile, Category, Issue, Comment, Vote).
- Define enums, constraints, indexes, relationships.
- Generate and apply initial migrations.
Deliverables
- Database schema matches ERD.
Acceptance criteria
- Migrations apply cleanly; tables and constraints verified.

## Phase 3 — Authentication and user management
Tasks
- Integrate JWT auth (access + refresh) endpoints.
- Implement /api/me to fetch current user profile.
- Add Profile model for role (user/admin/moderator), status (Active/Inactive/Suspended) and profile fields.
- Define permission classes (IsAuthorOrReadOnly, admin-only guards).
Deliverables
- Auth endpoints + permissions in place.
Acceptance criteria
- Auth flow works; role-based access enforced.

## Phase 4 — Categories module
Tasks
- Endpoints: list (public), create/update/delete (admin-only).
- Validate unique name and well-formed color.
- Filtering and ordering (name, created_at) defined.
Deliverables
- Categories API live.
Acceptance criteria
- CRUD and permissions confirmed via manual tests.

## Phase 5 — Issues module (core)
Tasks
- Endpoints: list (filters, search, ordering, pagination), create, retrieve, update, soft delete.
- Fields: title, description, location, imageUrl, status, priority, category (FK), author.
- Computed: upvotes/downvotes (aggregates in responses).
- Implement restore endpoint for admins.
Deliverables
- Issues API complete per contract.
Acceptance criteria
- Filters/search/ordering/pagination return expected results; soft delete + restore verified.

## Phase 6 — Votes module
Tasks
- Endpoint: POST /api/issues/{id}/vote/ with { type: 'up' | 'down' }.
- Upsert vote unique per (issue, user), update aggregates.
Deliverables
- Voting flow complete.
Acceptance criteria
- One vote per user/issue; toggling updates counts as expected.

## Phase 7 — Comments module
Tasks
- Nested under issues: list, create, patch, delete.
- Permissions: author can edit/delete own; admin can moderate.
- Ordering and pagination for comments.
Deliverables
- Comments API complete.
Acceptance criteria
- Comment lifecycle works; permissions enforced.

## Phase 8 — Admin: Users and moderation
Tasks
- Admin user list with filters (status, role, search).
- Admin can update user status/role.
- Issue moderation endpoints (status changes, hard delete if required).
Deliverables
- Admin management endpoints.
Acceptance criteria
- Admin-only access enforced; operations logged (basic logs acceptable).

## Phase 9 — API consistency and error handling
Tasks
- Decide casing (snake_case vs camelCase) for responses; ensure consistency.
- Standardize error response formats (400/401/403/404).
- Confirm pagination metadata (count, next, previous, results).
Deliverables
- API contract finalized and documented.
Acceptance criteria
- Frontend consumes API without extra mapping work.

## Phase 10 — Security hardening
Tasks
- Tighten CORS to known origins.
- Validate inputs; restrict enum values; set reasonable field lengths.
- Configure production settings: DEBUG off, ALLOWED_HOSTS set, strong SECRET_KEY.
- Tune JWT lifetimes and consider refresh rotation.
Deliverables
- Security review checklist completed.
Acceptance criteria
- Secrets not in repo; security baseline satisfied.

## Phase 11 — Seed data and fixtures
Tasks
- Seed common categories and demo data (optional).
- Add management command for seeding/clearing.
Deliverables
- Repeatable seeding.
Acceptance criteria
- Demo environment populated quickly.

## Phase 12 — Testing
Tasks
- Unit tests for serializers, permissions, and vote upsert logic.
- API tests for auth, categories, issues, votes, comments, admin.
- Establish coverage goal (e.g., ≥80%).
Deliverables
- Automated test suite + coverage report.
Acceptance criteria
- CI tests pass; coverage threshold met.

## Phase 13 — Documentation
Tasks
- Generate OpenAPI schema; enable browsable API for dev.
- Update BACKEND.md, BACKEND-SETUP.md, runbooks (run, migrate, seed).
- Provide example requests/responses where helpful.
Deliverables
- Up-to-date developer docs and API reference.
Acceptance criteria
- A new dev can set up and call endpoints in < 30 minutes.

## Phase 14 — CI/CD pipeline
Tasks
- Add lint/test workflows (GitHub Actions or equivalent).
- Build backend Docker image; push to registry (if applicable).
- Add migration step to deployment pipeline.
Deliverables
- Automated checks and builds on push/PR.
Acceptance criteria
- Pipeline gates merges on test/lint success.

## Phase 15 — Deployment
Tasks
- Prepare Docker Compose for db + backend (and optional Nginx).
- Configure environment variables and secrets for the target environment.
- Run initial deploy; apply migrations; create superuser.
Deliverables
- Running backend (staging/production) with DB.
Acceptance criteria
- Health endpoint OK; frontend can hit live API.

## Phase 16 — Observability and operations
Tasks
- Add health endpoint and basic metrics.
- Integrate error tracking (e.g., Sentry) and structured logging.
- Set log rotation/retention.
Deliverables
- Monitoring & error visibility.
Acceptance criteria
- Incidents are detectable and diagnosable.

## Phase 17 — Performance & scalability (as needed)
Tasks
- Add/adjust indexes for slow queries; remove N+1s via select_related/prefetch_related.
- Consider caching for hot endpoints.
Deliverables
- Performance improvements.
Acceptance criteria
- P95 latency within target; DB load acceptable.

## Optional feature roadmap (post-MVP)
- Image uploads (S3 or equivalent) with signed URLs.
- Email notifications (comments, status changes).
- Rate limiting and abuse prevention.
- Audit logs for admin actions.
- Advanced search and analytics.

## Timeboxing (rough)
- Foundations + scaffolding + DB: 2–3 days
- Auth + users + categories: 2–3 days
- Issues + votes + comments: 4–6 days
- Admin + moderation: 2–3 days
- Tests + docs + CI/CD + deploy: 3–5 days
- Total MVP: ~3–4 weeks (adjust per team size/scope)
