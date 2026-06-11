import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const CATEGORY_SEED = [
  { name: 'Food & Dining',      colorBg: '#FDE8DF', colorText: '#B04D25', icon: 'UtensilsCrossed' },
  { name: 'Transport',          colorBg: '#DCF0FB', colorText: '#1A6A9E', icon: 'Car' },
  { name: 'Bills & Utilities',  colorBg: '#FEF7DC', colorText: '#8A6500', icon: 'Zap' },
  { name: 'Shopping',           colorBg: '#EAE4F7', colorText: '#5C3DAA', icon: 'ShoppingBag' },
  { name: 'Health & Medical',   colorBg: '#DFF5EE', colorText: '#1E7A55', icon: 'Heart' },
  { name: 'Entertainment',      colorBg: '#F0E4FF', colorText: '#6A2EAA', icon: 'Film' },
  { name: 'Education',          colorBg: '#E0F0E4', colorText: '#2A6E3F', icon: 'BookOpen' },
  { name: 'Other',              colorBg: '#E4E8F2', colorText: '#3A4870', icon: 'MoreHorizontal' },
]

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskfinance.app' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@taskfinance.app',
      password: hashedPassword,
      role: 'ADMIN',
      budgetGoal: 10000,
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // 2. Create default categories
  for (const cat of CATEGORY_SEED) {
    await prisma.financeCategory.upsert({
      where: { id: cat.name }, // won't match, will always create
      update: {},
      create: {
        name: cat.name,
        colorBg: cat.colorBg,
        colorText: cat.colorText,
        icon: cat.icon,
        isActive: true,
        createdBy: admin.id,
      },
    }).catch(async () => {
      // If category already exists by name, skip
      const existing = await prisma.financeCategory.findFirst({ where: { name: cat.name } })
      if (!existing) {
        await prisma.financeCategory.create({
          data: {
            name: cat.name,
            colorBg: cat.colorBg,
            colorText: cat.colorText,
            icon: cat.icon,
            isActive: true,
            createdBy: admin.id,
          },
        })
      }
    })
  }
  console.log(`✅ ${CATEGORY_SEED.length} categories seeded`)

  // 3. Create AppSettings
  await prisma.appSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultBudgetGoal: 10000,
      updatedAt: new Date(),
    },
  }).catch(async () => {
    const existing = await prisma.appSettings.findFirst()
    if (!existing) {
      await prisma.appSettings.create({
        data: { defaultBudgetGoal: 10000, updatedAt: new Date() },
      })
    }
  })
  console.log('✅ AppSettings seeded (default budget: ₹10,000/month)')

  console.log('\n🎉 Seed complete!')
  console.log('   Admin login: admin@taskfinance.app / Admin@123')
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
