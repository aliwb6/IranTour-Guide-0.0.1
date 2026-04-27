/**
 * setup-db.js
 * Runs all CREATE TABLE statements through Neon's WebSocket driver (port 443).
 * Use this instead of `prisma migrate dev` when ports 5432/6543 are blocked.
 *
 * Usage:  node scripts/setup-db.js
 */

require('dotenv').config()
const { Pool, neonConfig } = require('@neondatabase/serverless')
const ws = require('ws')

neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const SCHEMA_SQL = `
-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)        NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255)        NOT NULL,
  phone       VARCHAR(50),
  city        VARCHAR(100),
  type        VARCHAR(20)         NOT NULL DEFAULT 'attendee',
  "createdAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ── Events ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Event" (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(500)  NOT NULL,
  description   TEXT,
  province      VARCHAR(100)  NOT NULL,
  city          VARCHAR(100),
  venue         TEXT,
  "startDate"   TIMESTAMPTZ   NOT NULL,
  "endDate"     TIMESTAMPTZ,
  category      VARCHAR(50)   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending',
  capacity      INTEGER       NOT NULL DEFAULT 0,
  phone         VARCHAR(50),
  email         VARCHAR(255),
  website       VARCHAR(500),
  "imageUrl"    VARCHAR(500),
  style         VARCHAR(100),
  duration      VARCHAR(100),
  "organizerId" INTEGER       NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_category   ON "Event"(category);
CREATE INDEX IF NOT EXISTS idx_event_province   ON "Event"(province);
CREATE INDEX IF NOT EXISTS idx_event_status     ON "Event"(status);
CREATE INDEX IF NOT EXISTS idx_event_startdate  ON "Event"("startDate");
CREATE INDEX IF NOT EXISTS idx_event_organizer  ON "Event"("organizerId");

-- ── Registrations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Registration" (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(50)  NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
  "userId"    INTEGER      REFERENCES "User"(id) ON DELETE SET NULL,
  "eventId"   INTEGER      NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_event ON "Registration"("eventId");
CREATE INDEX IF NOT EXISTS idx_registration_user  ON "Registration"("userId");

-- ── Saved Events ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SavedEvent" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER     NOT NULL REFERENCES "User"(id)  ON DELETE CASCADE,
  "eventId"   INTEGER     NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "eventId")
);

-- ── Auto-update updatedAt ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_updated_at') THEN
    CREATE TRIGGER user_updated_at  BEFORE UPDATE ON "User"  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'event_updated_at') THEN
    CREATE TRIGGER event_updated_at BEFORE UPDATE ON "Event" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
`

async function main() {
  console.log('🔌 Connecting to Neon via WebSocket (port 443)...')
  try {
    await pool.query(SCHEMA_SQL)
    console.log('✅ Database schema created successfully')

    // Prisma needs a _prisma_migrations table to track state
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id                  VARCHAR(36)  PRIMARY KEY,
        checksum            VARCHAR(64)  NOT NULL,
        finished_at         TIMESTAMPTZ,
        migration_name      VARCHAR(255) NOT NULL,
        logs                TEXT,
        rolled_back_at      TIMESTAMPTZ,
        started_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        applied_steps_count INTEGER      NOT NULL DEFAULT 0
      )
    `)
    console.log('✅ Prisma metadata table ready')
    console.log('')
    console.log('Next step → run: npm run db:seed')
  } catch (err) {
    console.error('❌ Setup failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
