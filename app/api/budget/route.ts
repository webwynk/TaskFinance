import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Get or create budget record
  let record = await prisma.budgetRecord.findUnique({
    where: { userId_month_year: { userId, month, year } },
  })

  if (!record) {
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { budgetGoal: true } }),
      prisma.appSettings.findFirst(),
    ])
    const goalAmount = Number(user?.budgetGoal ?? settings?.defaultBudgetGoal ?? 10000)
    record = await prisma.budgetRecord.create({
      data: { userId, month, year, goalAmount, spentAmount: 0 },
    })
  }

  // Recalculate spent from entries this month
  const spent = await prisma.financeEntry.aggregate({
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: startOfMonth(now), lte: endOfMonth(now) },
    },
    _sum: { amount: true },
  })

  const spentAmount = Number(spent._sum.amount ?? 0)
  const goalAmount = Number(record.goalAmount)
  const percentage = goalAmount > 0 ? (spentAmount / goalAmount) * 100 : 0

  return NextResponse.json({
    data: {
      ...record,
      spentAmount,
      goalAmount,
      percentage: Math.round(percentage * 10) / 10,
      status: percentage <= 60 ? 'on_track' : percentage <= 80 ? 'watch' : percentage <= 100 ? 'near_limit' : 'over_budget',
    }
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { goalAmount } = body
  if (!goalAmount || isNaN(Number(goalAmount)) || Number(goalAmount) <= 0) {
    return NextResponse.json({ error: 'Valid goal amount required' }, { status: 400 })
  }

  const userId = session.user.id
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Update user's personal budget goal
  await prisma.user.update({ where: { id: userId }, data: { budgetGoal: Number(goalAmount) } })

  // Upsert budget record for current month
  const record = await prisma.budgetRecord.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: { goalAmount: Number(goalAmount) },
    create: { userId, month, year, goalAmount: Number(goalAmount), spentAmount: 0 },
  })

  return NextResponse.json({ data: record, message: 'Budget goal updated' })
}
