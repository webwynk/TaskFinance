import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import FinanceSummaryClient from '@/app/(dashboard)/finance/summary/FinanceSummaryClient'

export const metadata: Metadata = { title: 'Finance Summary' }

export default async function FinanceSummaryPage() {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const where = { userId, date: { gte: start, lte: end } }

  const [expenses, income, byCategory, daily, categories] = await Promise.all([
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
    // All categories
    prisma.financeCategory.findMany(),
  ])

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const byCategoryWithDetails = byCategory.map(g => ({
    categoryId: g.categoryId,
    categoryName: categoryMap[g.categoryId]?.name ?? 'Other',
    colorBg: categoryMap[g.categoryId]?.colorBg ?? '#E4E8F2',
    colorText: categoryMap[g.categoryId]?.colorText ?? '#3A4870',
    count: g._count,
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

  return (
    <FinanceSummaryClient
      initialSummary={{
        totalExpenses,
        totalIncome,
        net: totalIncome - totalExpenses,
        expenseCount: expenses._count,
        incomeCount: income._count,
        byCategory: byCategoryWithDetails,
        dailyTotals,
      }}
    />
  )
}
