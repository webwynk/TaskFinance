import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FinanceClient from './FinanceClient'

export const metadata: Metadata = { title: 'Finance' }

export default async function FinancePage() {
  const session = await auth()
  if (!session?.user) return null

  const [entries, categories] = await Promise.all([
    prisma.financeEntry.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    }),
    prisma.financeCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  return <FinanceClient initialEntries={entries} categories={categories} />
}
