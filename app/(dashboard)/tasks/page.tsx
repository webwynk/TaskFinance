import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveTaskStatus } from '@/lib/utils/taskStatus'
import TasksClient from './TasksClient'

export const metadata: Metadata = { title: 'My Tasks' }

export default async function TasksPage() {
  const session = await auth()
  if (!session?.user) return null

  const [tasks, categories] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    }),
    prisma.financeCategory.findMany({ where: { isActive: true } }),
  ])

  const resolved = tasks.map(t => ({ ...t, status: resolveTaskStatus(t) }))

  return <TasksClient initialTasks={resolved} session={session} />
}
