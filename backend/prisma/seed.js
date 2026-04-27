require('dotenv').config()
const { PrismaClient }     = require('@prisma/client')
const { PrismaNeon }       = require('@prisma/adapter-neon')
const { Pool, neonConfig } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')
const ws     = require('ws')

neonConfig.webSocketConstructor = ws
const pool    = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
const prisma  = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const organizer = await prisma.user.upsert({
    where:  { email: 'organizer@irantour.ir' },
    update: {},
    create: {
      name: 'علی محمدی', email: 'organizer@irantour.ir',
      password: hashedPassword, phone: '09121234567', city: 'تهران', type: 'organizer',
    },
  })

  await prisma.user.upsert({
    where:  { email: 'attendee@irantour.ir' },
    update: {},
    create: {
      name: 'سارا رضایی', email: 'attendee@irantour.ir',
      password: hashedPassword, phone: '09129876543', city: 'اصفهان', type: 'attendee',
    },
  })

  const events = [
    { title:'نمایشگاه اتوکام با رویکرد هوش مصنوعی', category:'tech', province:'اصفهان', city:'اصفهان', venue:'محل دائمی نمایشگاه‌های بین‌المللی', startDate:new Date('2025-11-08'), endDate:new Date('2025-11-11'), capacity:1200, status:'completed', style:'نمایشگاهی', duration:'3 روز', website:'https://isfahanfair.ir/autocom-1404/', description:'نمایشگاه تخصصی فن‌آوری و نوآوری با رویکرد هوش مصنوعی' },
    { title:'نمایشگاه اقوام و عشایر ایرانی', category:'national', province:'همدان', city:'همدان', venue:'محل دائمی نمایشگاه‌های بین‌المللی', startDate:new Date('2025-11-09'), endDate:new Date('2025-11-13'), capacity:3400, status:'completed', style:'نمایشگاهی', duration:'4 روز', website:'https://eventro.ir/events/51700', description:'نمایش تنوع فرهنگی و قومی ایران' },
    { title:'کیش INVEX', category:'business', province:'هرمزگان', city:'کیش', venue:'مرکز همایش‌های بین‌المللی جزیره کیش', startDate:new Date('2025-11-10'), endDate:new Date('2025-11-13'), capacity:800, status:'completed', style:'نمایشگاهی', duration:'3 روز', website:'https://kishinvex.ir', description:'نمایشگاه بین‌المللی سرمایه‌گذاری و اقتصاد کیش' },
    { title:'جشنواره فیلم فجر', category:'art', province:'تهران', city:'تهران', venue:'پردیس سینمایی ملت / برج میلاد', startDate:new Date('2025-11-26'), endDate:new Date('2025-12-03'), capacity:5000, status:'active', style:'جشنواره', duration:'7 روز', website:'https://fajriff.com', description:'چهل‌وسومین جشنواره بین‌المللی فیلم فجر' },
    { title:'نمایشگاه خانه و آشپزخانه تهران', category:'business', province:'تهران', city:'تهران', venue:'شهر آفتاب', startDate:new Date('2025-12-03'), endDate:new Date('2025-12-06'), capacity:600, status:'active', style:'نمایشگاهی', duration:'3 روز', description:'نمایشگاه تخصصی لوازم خانگی و آشپزخانه' },
    { title:'جشنواره موسیقی فجر', category:'music', province:'تهران', city:'تهران', venue:'تالار وحدت', startDate:new Date('2026-01-25'), endDate:new Date('2026-02-03'), capacity:2000, status:'pending', style:'جشنواره', duration:'10 روز', description:'سی‌وهفتمین جشنواره موسیقی فجر' },
    { title:'نمایشگاه کتاب تهران', category:'educational', province:'تهران', city:'تهران', venue:'مصلی تهران', startDate:new Date('2026-05-07'), endDate:new Date('2026-05-17'), capacity:50000, status:'pending', style:'نمایشگاه', duration:'10 روز', description:'سی‌وهفتمین نمایشگاه بین‌المللی کتاب تهران' },
    { title:'جشنواره فیلم کودک اصفهان', category:'art', province:'اصفهان', city:'اصفهان', venue:'سینماهای اصفهان', startDate:new Date('2026-04-01'), endDate:new Date('2026-04-08'), capacity:3000, status:'pending', style:'جشنواره', duration:'7 روز', description:'جشنواره ملی فیلم کودک و نوجوان' },
    { title:'جشنواره نوروزی مشهد', category:'tourism', province:'خراسان رضوی', city:'مشهد', venue:'بولوار احمدآباد', startDate:new Date('2026-03-20'), endDate:new Date('2026-04-02'), capacity:10000, status:'pending', style:'جشنواره', duration:'13 روز', description:'جشنواره نوروزی در کنار حرم مطهر رضوی' },
    { title:'همایش بین‌المللی گردشگری ایران', category:'tourism', province:'تهران', city:'تهران', venue:'برج میلاد', startDate:new Date('2026-02-15'), endDate:new Date('2026-02-17'), capacity:2500, status:'pending', style:'همایش', duration:'2 روز', description:'بزرگترین همایش صنعت گردشگری کشور' },
  ]

  // Delete existing events to allow re-seeding
  await prisma.event.deleteMany({ where: { organizerId: organizer.id } })

  for (const ev of events) {
    await prisma.event.create({ data: { ...ev, organizerId: organizer.id } })
  }

  console.log(`✅ Seeded ${events.length} events`)
  console.log('✅ Demo accounts:')
  console.log('   organizer@irantour.ir  /  password123  (organizer)')
  console.log('   attendee@irantour.ir   /  password123  (attendee)')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
