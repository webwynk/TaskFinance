import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [
    todayTasks,
    totalTodayTasks,
    recentTasks,
    todayExpense,
    recentEntries,
    monthExpense,
    user,
    settings,
    categories,
  ] = await Promise.all([
    prisma.task.count({ where: { userId, status: 'COMPLETED', completedAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.task.count({ where: { userId, dueDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.task.findMany({ where: { userId, dueDate: { gte: todayStart, lte: todayEnd } }, orderBy: { priority: 'asc' }, take: 5 }),
    prisma.financeEntry.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: todayStart, lte: todayEnd } }, _sum: { amount: true } }),
    prisma.financeEntry.findMany({ where: { userId, date: { gte: todayStart, lte: todayEnd } }, include: { category: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.financeEntry.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { budgetGoal: true } }),
    prisma.appSettings.findFirst(),
    prisma.financeCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  const goalAmount = Number(user?.budgetGoal ?? settings?.defaultBudgetGoal ?? 10000)
  const monthSpent = Number(monthExpense._sum.amount ?? 0)

  return (
    <DashboardClient
      session={session}
      stats={{
        completedToday: todayTasks,
        dueToday: totalTodayTasks,
        todaySpend: Number(todayExpense._sum.amount ?? 0),
        monthSpend: monthSpent,
        budgetGoal: goalAmount,
        budgetRemaining: goalAmount - monthSpent,
        budgetPercentage: goalAmount > 0 ? (monthSpent / goalAmount) * 100 : 0,
      }}
      todayTasks={recentTasks}
      todayEntries={recentEntries}
      categories={categories}
    />
  )
}
