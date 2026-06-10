import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'
import BudgetClient from './BudgetClient'

export const metadata: Metadata = { title: 'Budget Goals' }

export default async function BudgetPage() {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Get or create current month budget
  let record = await prisma.budgetRecord.findUnique({
    where: { userId_month_year: { userId, month, year } },
  })

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { budgetGoal: true } }),
    prisma.appSettings.findFirst(),
  ])

  const goalAmount = Number(user?.budgetGoal ?? settings?.defaultBudgetGoal ?? 10000)

  if (!record) {
    record = await prisma.budgetRecord.create({
      data: { userId, month, year, goalAmount, spentAmount: 0 },
    })
  }

  // Actual spent this month
  const spent = await prisma.financeEntry.aggregate({
    where: { userId, type: 'EXPENSE', date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    _sum: { amount: true },
  })

  // Past 6 months
  const history = await prisma.budgetRecord.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 6,
  })

  // Category breakdown this month
  const byCategory = await prisma.financeEntry.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE', date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  const catIds = byCategory.map(g => g.categoryId)
  const cats = await prisma.financeCategory.findMany({ where: { id: { in: catIds } } })
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]))

  const categoryBreakdown = byCategory.map(g => ({
    category: catMap[g.categoryId],
    amount: Number(g._sum.amount ?? 0),
  }))

  const spentAmount = Number(spent._sum.amount ?? 0)

  return (
    <BudgetClient
      budget={{ goalAmount, spentAmount, month, year }}
      history={history}
      categoryBreakdown={categoryBreakdown}
    />
  )
}
