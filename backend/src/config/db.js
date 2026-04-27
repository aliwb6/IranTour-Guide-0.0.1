const { PrismaClient }  = require('@prisma/client')
const { PrismaNeon }    = require('@prisma/adapter-neon')
const { Pool, neonConfig } = require('@neondatabase/serverless')
const ws = require('ws')

// Force all connections through WebSocket on port 443
// (bypasses Iran's block on PostgreSQL ports 5432 / 6543)
neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)

// Reuse the same PrismaClient across hot reloads in dev
const prisma = global.__prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma

module.exports = prisma
