# Server

This service is a NestJS application implementing core authentication primitives and an audit pipeline. The README documents only the implemented (completed) areas: Prisma integration, local authentication (login), audit logging for authentication events, and a scheduled retention/cleanup job.

## Features (implemented)
- Local authentication (email + password) with Argon2 verification and rehash support.
- AuditEvent model + AuditService for structured, append-only audit entries.
  - Covers login attempts, successes, failures, locks, and password reset events.
- Retention policy: daily cleanup job that purges audit events older than 45 days.
- Prisma ORM integration for PostgreSQL and schema models:
  - `User` (nullable `hashedPassword` to support OAuth accounts)
  - `Account` (provider linkage for OAuth)
  - `AuditEvent` + `AuditAction` enum
- Basic AuthController endpoint for login with DTO validation.
- Non-blocking audit writes (audit failures are logged and do not block auth flow).

## Prerequisites
- Node.js (tested with LTS)
- pnpm
- PostgreSQL-compatible database (Neon, RDS, etc.)
- (Optional) Redis / queue if you later choose to make audit writes asynchronous

## Required environment variables
Create a `.env` in the server app folder (not committed). Required:
- DATABASE_URL - Prisma connection string. For Neon, ensure SSL: `?sslmode=require` (and consider `pgbouncer=true` for pooler endpoints).

Example:
DATABASE_URL="postgresql://USER:PASSWORD@host:5432/dbname?sslmode=require"

## Setup (development)
1. Install dependencies
   pnpm install

2. Generate Prisma client
   pnpm --filter server exec prisma generate

3. Create / apply migrations (when schema changes)
   pnpm --filter server exec prisma migrate dev --name <migration_name>

4. Start development server (watch)
   pnpm --filter server run start:dev

The TypeScript compiler runs in watch mode; save files to recompile.

## API (implemented endpoints)

- POST /auth/login
  - Request body (JSON): { "email": "user@example.com", "password": "your-password" }
  - Validation: DTO uses class-validator (IsEmail, MinLength).
  - Response: { "user": { id, name, email, createdAt, updatedAt, ... } }
  - Notes:
    - Responses are intentionally generic on authentication failure ("Invalid credentials") to avoid user enumeration.
    - Login attempts are tracked in an in-memory attempt map (process-local). Excess attempts lock the account for the configured interval and emit an `AUTH_LOGIN_LOCKED` audit event.

## Prisma models (implemented)
Key models in `prisma/schema.prisma`:
- enum AuditAction { AUTH_LOGIN_ATTEMPT, AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILED, AUTH_LOGIN_LOCKED, PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS, PASSWORD_RESET_FAILED }
- model User { id, email, name, hashedPassword?, accounts, auditEvents, createdAt, updatedAt }
- model Account { id, userId, provider, providerAccountId, accessToken?, refreshToken?, expiresAt?, ... }
- model AuditEvent { id, userId?, user relation, email, action, success, reason?, ip?, requestId?, sessionId?, metadata?, createdAt }

(See `prisma/schema.prisma` for the exact schema.)

## Audit retention
A scheduled cleanup service runs daily (via `@nestjs/schedule`) and deletes AuditEvent rows older than 45 days. Adjust retention by modifying RETENTION_DAYS in the cleanup service.

## Notes & production recommendations
- Keep `hashedPassword` nullable (supports OAuth-only accounts). For production, the recommended model is to maintain a separate `Account` model for external providers (implemented).
- The current failed-login tracking is in-memory. For multi-instance or durable lockouts, use Redis or a DB-backed counter (recommended).
- Audit writes are synchronous to the DB in the current implementation but tolerate failures. For high throughput, push audit events to a queue (BullMQ, Kafka) and persist from a worker.
- When using cloud DBs (Neon), set `sslmode=require` in DATABASE_URL and prefer the direct DB endpoint for migrations if pooler issues arise. Add retry/backoff for Prisma connect at startup.
- Protect access to audit logs (RBAC), redact or hash PII as required by compliance, and implement retention/archival policies.

## Troubleshooting
- Prisma cannot reach DB (Prisma P1001): verify `DATABASE_URL`, network, host, port, and SSL params. Test with `psql` or `nc -vz host 5432`.
- TypeScript errors about nullable password: ensure code checks `user.hashedPassword` before calling `argon2.verify`.
- Module registration errors (InvalidClassModuleException): ensure services are listed in `providers` and modules in `imports`; do not put service classes in `imports`.

## Tests
Unit tests are scaffolded next to modules (spec files). Run the project tests using your workspace test runner configuration.

## Next steps (suggested)
- Replace in-memory attempt store with Redis for distributed lockouts.
- Add OAuth callback handlers that use the `Account` model and safe linking logic (verify provider emails before auto-linking).
- Add an audit consumer queue for high-volume event collection.
- Harden logging, monitoring, and sensitive-data handling to meet compliance requirements.

For implementation details, review source files under `src/{auth,users,audit,prisma}`.// filepath: /home/rewant/Desktop/authentication/FromScratch/apps/server/README.md
# Server — Authentication FromScratch

This service is a NestJS application implementing core authentication primitives and an audit pipeline. The README documents only the implemented (completed) areas: Prisma integration, local authentication (login), audit logging for authentication events, and a scheduled retention/cleanup job.

## Features (implemented)
- Local authentication (email + password) with Argon2 verification and rehash support.
- AuditEvent model + AuditService for structured, append-only audit entries.
  - Covers login attempts, successes, failures, locks, and password reset events.
- Retention policy: daily cleanup job that purges audit events older than 45 days.
- Prisma ORM integration for PostgreSQL and schema models:
  - `User` (nullable `hashedPassword` to support OAuth accounts)
  - `Account` (provider linkage for OAuth)
  - `AuditEvent` + `AuditAction` enum
- Basic AuthController endpoint for login with DTO validation.
- Non-blocking audit writes (audit failures are logged and do not block auth flow).

## Prerequisites
- Node.js (tested with LTS)
- pnpm
- PostgreSQL-compatible database (Neon, RDS, etc.)
- (Optional) Redis / queue if you later choose to make audit writes asynchronous

## Required environment variables
Create a `.env` in the server app folder (not committed). Required:
- DATABASE_URL - Prisma connection string. For Neon, ensure SSL: `?sslmode=require` (and consider `pgbouncer=true` for pooler endpoints).

Example:
DATABASE_URL="postgresql://USER:PASSWORD@host:5432/dbname?sslmode=require"

## Setup (development)
1. Install dependencies
   pnpm install

2. Generate Prisma client
   pnpm --filter server exec prisma generate

3. Create / apply migrations (when schema changes)
   pnpm --filter server exec prisma migrate dev --name <migration_name>

4. Start development server (watch)
   pnpm --filter server run start:dev

The TypeScript compiler runs in watch mode; save files to recompile.

## API (implemented endpoints)

- POST /auth/login
  - Request body (JSON): { "email": "user@example.com", "password": "your-password" }
  - Validation: DTO uses class-validator (IsEmail, MinLength).
  - Response: { "user": { id, name, email, createdAt, updatedAt, ... } }
  - Notes:
    - Responses are intentionally generic on authentication failure ("Invalid credentials") to avoid user enumeration.
    - Login attempts are tracked in an in-memory attempt map (process-local). Excess attempts lock the account for the configured interval and emit an `AUTH_LOGIN_LOCKED` audit event.

## Prisma models (implemented)
Key models in `prisma/schema.prisma`:
- enum AuditAction { AUTH_LOGIN_ATTEMPT, AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILED, AUTH_LOGIN_LOCKED, PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS, PASSWORD_RESET_FAILED }
- model User { id, email, name, hashedPassword?, accounts, auditEvents, createdAt, updatedAt }
- model Account { id, userId, provider, providerAccountId, accessToken?, refreshToken?, expiresAt?, ... }
- model AuditEvent { id, userId?, user relation, email, action, success, reason?, ip?, requestId?, sessionId?, metadata?, createdAt }

(See `prisma/schema.prisma` for the exact schema.)

## Audit retention
A scheduled cleanup service runs daily (via `@nestjs/schedule`) and deletes AuditEvent rows older than 45 days. Adjust retention by modifying RETENTION_DAYS in the cleanup service.

## Notes & production recommendations
- Keep `hashedPassword` nullable (supports OAuth-only accounts). For production, the recommended model is to maintain a separate `Account` model for external providers (implemented).
- The current failed-login tracking is in-memory. For multi-instance or durable lockouts, use Redis or a DB-backed counter (recommended).
- Audit writes are synchronous to the DB in the current implementation but tolerate failures. For high throughput, push audit events to a queue (BullMQ, Kafka) and persist from a worker.
- When using cloud DBs (Neon), set `sslmode=require` in DATABASE_URL and prefer the direct DB endpoint for migrations if pooler issues arise. Add retry/backoff for Prisma connect at startup.
- Protect access to audit logs (RBAC), redact or hash PII as required by compliance, and implement retention/archival policies.

## Troubleshooting
- Prisma cannot reach DB (Prisma P1001): verify `DATABASE_URL`, network, host, port, and SSL params. Test with `psql` or `nc -vz host 5432`.
- TypeScript errors about nullable password: ensure code checks `user.hashedPassword` before calling `argon2.verify`.
- Module registration errors (InvalidClassModuleException): ensure services are listed in `providers` and modules in `imports`; do not put service classes in `imports`.

## Tests
Unit tests are scaffolded next to modules (spec files). Run the project tests using your workspace test runner configuration.

## Next steps (suggested)
- Replace in-memory attempt store with Redis for distributed lockouts.
- Add OAuth callback handlers that use the `Account` model and safe linking logic (verify provider emails before auto-linking).
- Add an audit consumer queue for high-volume event collection.
- Harden logging, monitoring, and sensitive-data handling to meet compliance requirements.

For implementation details, review source files under `src/{auth,users,audit,prisma}`.