import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskCreateSchema } from '@/lib/validations/task.schema'
import { resolveTaskStatus } from '@/lib/utils/taskStatus'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const period = searchParams.get('period') || 'month'
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'dueDate'
  const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const adminUserId = searchParams.get('userId')

  // Determine which userId to query
  const userId = (session.user.role === 'ADMIN' && adminUserId) ? adminUserId : session.user.id

  // Date range
  const now = new Date()
  let dateFilter: { gte?: Date; lte?: Date } | undefined

  if (period === 'today') {
    dateFilter = { gte: startOfDay(now), lte: endOfDay(now) }
  } else if (period === 'week') {
    dateFilter = { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) }
  } else if (period === 'month') {
    dateFilter = { gte: startOfMonth(now), lte: endOfMonth(now) }
  } else if (period === 'custom' && from && to) {
    dateFilter = { gte: new Date(from), lte: new Date(to) }
  }

  const where: any = { userId }
  if (dateFilter) where.dueDate = dateFilter
  if (status && status !== 'ALL') where.status = status
  if (priority && priority !== 'ALL') where.priority = priority
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const orderBy: any = {}
  if (sort === 'dueDate') orderBy.dueDate = order
  else if (sort === 'createdAt') orderBy.createdAt = order
  else if (sort === 'priority') orderBy.priority = order
  else if (sort === 'title') orderBy.title = order

  const tasks = await prisma.task.findMany({ where, orderBy })

  // Resolve status (auto-detect OVERDUE)
  const resolved = tasks.map(t => ({ ...t, status: resolveTaskStatus(t) }))

  return NextResponse.json({ data: resolved })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = TaskCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, description, dueDate, dueTime, priority, tags, userId: bodyUserId } = parsed.data
  const userId = (session.user.role === 'ADMIN' && bodyUserId) ? bodyUserId : session.user.id

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime ?? null,
      priority,
      tags,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ data: task, message: 'Task created successfully' }, { status: 201 })
}
