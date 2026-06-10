import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveTaskStatus } from '@/lib/utils/taskStatus'
import TaskBoardClient from '@/app/(dashboard)/tasks/board/TaskBoardClient'

export const metadata: Metadata = { title: 'Task Board' }

export default async function TaskBoardPage() {
  const session = await auth()
  if (!session?.user) return null

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    take: 100, // Fetch up to 100 tasks for the board
  })

  const resolved = tasks.map(t => ({ ...t, status: resolveTaskStatus(t) }))

  return <TaskBoardClient initialTasks={resolved} />
}
