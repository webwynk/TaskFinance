import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FinanceEntryUpdateSchema } from '@/lib/validations/finance.schema'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entry = await prisma.financeEntry.findUnique({
    where: { id: params.id },
    include: { category: true },
  })
  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  if (entry.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ data: entry })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entry = await prisma.financeEntry.findUnique({ where: { id: params.id } })
  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  if (entry.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = FinanceEntryUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const updateData: any = {}
  const { title, description, itemName, amount, categoryId, type, date } = parsed.data
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (itemName !== undefined) updateData.itemName = itemName
  if (amount !== undefined) updateData.amount = amount
  if (categoryId !== undefined) updateData.categoryId = categoryId
  if (type !== undefined) updateData.type = type
  if (date !== undefined) updateData.date = new Date(date)

  const updated = await prisma.financeEntry.update({
    where: { id: params.id },
    data: updateData,
    include: { category: true },
  })

  return NextResponse.json({ data: updated, message: 'Entry updated' })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entry = await prisma.financeEntry.findUnique({ where: { id: params.id } })
  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  if (entry.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.financeEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Entry deleted' })
}
