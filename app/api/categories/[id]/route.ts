import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const body = await req.json()
  const { name, colorBg, colorText, icon, isActive } = body

  const category = await prisma.financeCategory.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(colorBg !== undefined && { colorBg }),
      ...(colorText !== undefined && { colorText }),
      ...(icon !== undefined && { icon }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json({ data: category, message: 'Category updated' })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  // Check if any entries use this category
  const count = await prisma.financeEntry.count({ where: { categoryId: params.id } })

  if (count > 0) {
    // Soft delete — deactivate instead
    await prisma.financeCategory.update({ where: { id: params.id }, data: { isActive: false } })
    return NextResponse.json({ message: `Category deactivated (used by ${count} entries)` })
  }

  await prisma.financeCategory.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Category deleted' })
}
