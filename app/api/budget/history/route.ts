import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const now = new Date()

  // Get last 6 months of budget records
  const records = await prisma.budgetRecord.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 6,
  })

  // Recalculate actual spent for each month
  const enriched = await Promise.all(records.map(async (record) => {
    const monthStart = startOfMonth(new Date(record.year, record.month - 1, 1))
    const monthEnd = endOfMonth(monthStart)

    const spent = await prisma.financeEntry.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    })

    const spentAmount = Number(spent._sum.amount ?? 0)
    const goalAmount = Number(record.goalAmount)
    const percentage = goalAmount > 0 ? (spentAmount / goalAmount) * 100 : 0

    return {
      ...record,
      spentAmount,
      goalAmount,
      percentage: Math.round(percentage * 10) / 10,
      status: percentage <= 60 ? 'on_track' : percentage <= 80 ? 'watch' : percentage <= 100 ? 'near_limit' : 'over_budget',
    }
  }))

  return NextResponse.json({ data: enriched })
}
