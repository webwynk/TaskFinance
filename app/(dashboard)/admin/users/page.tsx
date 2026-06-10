import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminUsersClient from './AdminUsersClient'

export const metadata: Metadata = { title: 'User Management' }

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, isActive: true, budgetGoal: true, createdAt: true,
      _count: { select: { tasks: true, financeEntries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminUsersClient users={users} currentUserId={session.user.id} />
}
