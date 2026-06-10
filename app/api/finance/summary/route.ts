import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const period = searchParams.get('period') || 'month'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const adminUserId = searchParams.get('userId')

  const userId = (session.user.role === 'ADMIN' && adminUserId) ? adminUserId : session.user.id
  const now = new Date()

  let start: Date, end: Date
  if (period === 'week') {
    start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0)
    end = new Date(now); end.setHours(23, 59, 59, 999)
  } else if (period === 'custom' && from && to) {
    start = new Date(from); end = new Date(to)
  } else {
    start = startOfMonth(now)
    end = endOfMonth(now)
  }

  const where = { userId, date: { gte: start, lte: end } }

  const [expenses, income, byCategory, daily] = await Promise.all([
    // Total expenses
    prisma.financeEntry.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    }),
    // Total income
    prisma.financeEntry.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    }),
    // By category
    prisma.financeEntry.groupBy({
      by: ['categoryId'],
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    }),
    // Daily totals for the period
    prisma.financeEntry.findMany({
      where: { ...where, type: 'EXPENSE' },
      select: { date: true, amount: true },
      orderBy: { date: 'asc' },
    }),
  ])

  // Fetch category details
  const categoryIds = byCategory.map(g => g.categoryId)
  const categories = await prisma.financeCategory.findMany({
    where: { id: { in: categoryIds } },
  })

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const byCategoryWithDetails = byCategory.map(g => ({
    ...g,
    category: categoryMap[g.categoryId],
    total: Number(g._sum.amount ?? 0),
  }))

  // Aggregate daily totals
  const dailyTotals: Record<string, number> = {}
  for (const entry of daily) {
    const key = format(new Date(entry.date), 'yyyy-MM-dd')
    dailyTotals[key] = (dailyTotals[key] ?? 0) + Number(entry.amount)
  }

  const totalExpenses = Number(expenses._sum.amount ?? 0)
  const totalIncome = Number(income._sum.amount ?? 0)

  return NextResponse.json({
    data: {
      totalExpenses,
      totalIncome,
      net: totalIncome - totalExpenses,
      expenseCount: expenses._count,
      incomeCount: income._count,
      byCategory: byCategoryWithDetails,
      dailyTotals,
    }
  })
}
