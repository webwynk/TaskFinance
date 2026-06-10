import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminCategoriesClient from './AdminCategoriesClient'

export const metadata: Metadata = { title: 'Finance Categories' }

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/dashboard')

  const categories = await prisma.financeCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { entries: true } } },
  })

  return <AdminCategoriesClient categories={categories} />
}
