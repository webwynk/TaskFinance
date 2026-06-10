import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const adminUserId = searchParams.get('userId')
  const userId = (session.user.role === 'ADMIN' && adminUserId) ? adminUserId : session.user.id

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [
    todayTasks,
    totalTasks,
    todayExpense,
    monthExpense,
    budget,
  ] = await Promise.all([
    // Today's completed tasks
    prisma.task.count({ where: { userId, status: 'COMPLETED', completedAt: { gte: todayStart, lte: todayEnd } } }),
    // Today's total tasks (due today)
    prisma.task.count({ where: { userId, dueDate: { gte: todayStart, lte: todayEnd } } }),
    // Today's spend
    prisma.financeEntry.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
    }),
    // Month's spend
    prisma.financeEntry.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    // Budget goal
    prisma.user.findUnique({ where: { id: userId }, select: { budgetGoal: true } }),
  ])

  const defaultBudget = await prisma.appSettings.findFirst().then(s => Number(s?.defaultBudgetGoal ?? 10000))
  const goalAmount = Number(budget?.budgetGoal ?? defaultBudget)
  const monthSpent = Number(monthExpense._sum.amount ?? 0)
  const budgetRemaining = goalAmount - monthSpent

  return NextResponse.json({
    data: {
      tasks: { completedToday: todayTasks, dueToday: totalTasks },
      finance: {
        todaySpend: Number(todayExpense._sum.amount ?? 0),
        monthSpend: monthSpent,
        budgetGoal: goalAmount,
        budgetRemaining,
        budgetPercentage: goalAmount > 0 ? Math.round((monthSpent / goalAmount) * 1000) / 10 : 0,
      },
    }
  })
}
