import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FinanceEntryCreateSchema } from '@/lib/validations/finance.schema'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const period = searchParams.get('period') || 'month'
  const categoryId = searchParams.get('category')
  const type = searchParams.get('type')
  const sort = searchParams.get('sort') || 'date'
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const adminUserId = searchParams.get('userId')

  const userId = (session.user.role === 'ADMIN' && adminUserId) ? adminUserId : session.user.id
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
  if (dateFilter) where.date = dateFilter
  if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId
  if (type && type !== 'ALL') where.type = type

  const orderBy: any = {}
  if (sort === 'date') orderBy.date = order
  else if (sort === 'amount') orderBy.amount = order
  else if (sort === 'category') orderBy.category = { name: order }

  const entries = await prisma.financeEntry.findMany({
    where,
    orderBy: [orderBy, { createdAt: 'desc' }],
    include: { category: true },
  })

  return NextResponse.json({ data: entries })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = FinanceEntryCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, description, itemName, amount, categoryId, type, date, userId: bodyUserId } = parsed.data
  const userId = (session.user.role === 'ADMIN' && bodyUserId) ? bodyUserId : session.user.id

  const entry = await prisma.financeEntry.create({
    data: {
      userId,
      categoryId,
      title,
      description: description ?? null,
      itemName: itemName ?? null,
      amount,
      type,
      date: new Date(date),
    },
    include: { category: true },
  })

  return NextResponse.json({ data: entry, message: 'Entry created' }, { status: 201 })
}
