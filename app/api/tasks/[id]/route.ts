import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskUpdateSchema } from '@/lib/validations/task.schema'
import { resolveTaskStatus } from '@/lib/utils/taskStatus'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  if (task.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ data: { ...task, status: resolveTaskStatus(task) } })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = TaskUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, description, dueDate, dueTime, priority, tags, status } = parsed.data

  const updateData: any = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  if (dueTime !== undefined) updateData.dueTime = dueTime
  if (priority !== undefined) updateData.priority = priority
  if (tags !== undefined) updateData.tags = tags
  if (status !== undefined) {
    updateData.status = status
    if (status === 'COMPLETED') updateData.completedAt = new Date()
    else if (task.status === 'COMPLETED') updateData.completedAt = null
  }

  const updated = await prisma.task.update({ where: { id: params.id }, data: updateData })

  return NextResponse.json({ data: { ...updated, status: resolveTaskStatus(updated) }, message: 'Task updated' })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Task deleted' })
}
